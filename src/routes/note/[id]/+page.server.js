import { Note } from '$lib/models/Note';
import { error, redirect, fail } from '@sveltejs/kit';
import { truncateNoteText, getCurrTime, withAuth } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import { User } from '$lib/models/User';
import { Types } from 'mongoose';
import { verifyEmailInput } from '$lib/server/email';
import { getUserFromEmail } from '$lib/server/user';

export async function load(event) {
	if (event.locals.user === null) {
		return redirect(307, '/login');
	}

	if (!Types.ObjectId.isValid(event.params.id)) {
		error(422, { message: 'Appunto non trovato' });
	}

	const noteP = Note.findById({ _id: event.params.id });
	const userDataP = User.findById({ _id: event.locals.user._id }, { tags: 1 });

	let note, userData;
	try {
		[note, userData] = await Promise.all([noteP, userDataP]);
	} catch (error) {
		error(500);
	}

	// Check user access
	const userIsAuthor = note.userID.equals(event.locals.user._id);
	const noteIsShared =
		(note.isPublic && !userIsAuthor) ||
		note.sharedUsers.some((usr) => usr.userID.equals(event.locals.user._id));
	if (!noteIsShared && !userIsAuthor) error(500);

	if (noteIsShared) {
		const sharedUserData = await User.findById(
			{ _id: note.userID },
			{ username: 1, email: 1, _id: 1 }
		);
		if (!sharedUserData) return fail(500);
	}

	const userTags = userData.tags;
	const noteTags = [];
	userTags.forEach((tag) => {
		if (tag.noteIDs.some((id) => id.toString() === event.params.id)) noteTags.push(tag);
	});
	return {
		sharedUserData: noteIsShared ? JSON.parse(JSON.stringify(sharedUserData)) : null,
		noteIsShared,
		note: JSON.parse(JSON.stringify(note)),
		userTags: JSON.parse(JSON.stringify(userTags)),
		noteTags: JSON.parse(JSON.stringify(noteTags))
	};
}

export const actions = {
	// UPDATE Note
	update: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const data = await event.request.formData();

		const id = event.params.id;
		let title = data.get('title').substring(0, TITLE_MAX_LEN) || '';
		const text = data.get('text').substring(0, TEXT_MAX_LEN) || '';

		const textStart = truncateNoteText(text);
		const timeLastModified = getCurrTime();
		const charNum = text.length;

		const note = await Note.findOneAndUpdate(
			{
				$or: [
					{ _id: id, isPublic: true },
					{ _id: id, userID: event.locals.user._id },
					{ _id: id, 'sharedUsers.userID': event.locals.user._id }
				]
			},
			{
				title,
				text,
				charNum,
				textStart,
				timeLastModified
			}
		);
		if (!note) return fail(500, { failed: true });

		redirect(303, '/note');
	}),

	// DELETE Note
	delete: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const id = event.params.id;
		const res = await Note.deleteOne({ userID: event.locals.user._id, _id: id });

		if (!res) return fail(500, { failed: true });

		redirect(303, '/note');
	}),

	// UPDATE Tags
	updateTags: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formDataP = event.request.formData();
		const userDataP = User.findById({ _id: event.locals.user._id }, { tags: 1 });

		let formData, userData;
		try {
			[formData, userData] = await Promise.all([formDataP, userDataP]);
		} catch (error) {
			return fail(500, { failed: true });
		}

		userData.tags.forEach((tag) => {
			if (formData.get(`${tag._id}`)) {
				if (!tag.noteIDs.some((id) => id.toString() === event.params.id))
					tag.noteIDs.push(event.params.id);
			} else {
				tag.noteIDs = tag.noteIDs.filter((id) => id.toString() !== event.params.id);
			}
		});

		await User.updateOne({ _id: event.locals.user._id }, { tags: userData.tags });
	}),

	// ADD Sharing User
	addUser: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formData = await event.request.formData();
		const email = formData.get('email');

		if (!email || !verifyEmailInput(email)) return fail(400, { email, invalid: true });

		const user = await getUserFromEmail(email);
		if (!user) return fail(500, { email, failed: true });

		if (user._id.equals(event.locals.user._id)) return fail(400, { email, sameUser: true });

		const note = await Note.findOne(
			{ _id: event.params.id, userID: event.locals.user._id },
			{ sharedUsers: 1 }
		);
		if (!note) fail(500, { email, failed: true });

		if (note.sharedUsers.some((usr) => usr.userID.equals(user._id)))
			return fail(400, { email, alreadyAdded: true });

		const usrInfo = { email, userID: user._id.toString() };
		const res = await Note.findOneAndUpdate(
			{ _id: event.params.id, userID: event.locals.user._id },
			{
				$push: { sharedUsers: usrInfo }
			}
		);
		if (!res) return fail(500, { failed: true });

		return { success: true };
	}),

	// REMOVE Sharing User
	removeUser: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formData = await event.request.formData();
		const removeID = formData.get('id');

		if (!Types.ObjectId.isValid(removeID)) return fail(422, { removeID, invalid: true });

		let res;
		if (!formData.get('isOwner')) {
			res = await removeSharedUser(removeID, event.locals.user._id);
		} else {
			res = await removeSharedUser(event.locals.user._id, removeID);
		}
		if (!res) return fail(500, { failed: true });

		return { success: true };
	}),

	// UPDATE Note's Public status
	setPublic: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}
		const formData = await event.request.formData();
		const isPublic = !!formData.get('isPublic');

		const res = await Note.findOneAndUpdate(
			{ _id: event.params.id, userID: event.locals.user._id },
			{
				isPublic
			}
		);
		if (!res) return fail(500, { failed: true });

		return { success: true };
	})
};

// userID: ID of user who owns the Note to be modified
// removeID: ID of user to be removed from Shared of Note
async function removeSharedUser(userID, removeID) {
	return await Note.findOneAndUpdate(
		{ _id: event.params.id, userID },
		{
			$pull: { sharedUsers: { userID: removeID } }
		}
	);
}

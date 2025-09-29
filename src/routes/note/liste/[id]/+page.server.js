import { List } from '$lib/models/List';
import { Task } from '$lib/models/Task';
import { error, redirect, fail } from '@sveltejs/kit';
import { getCurrTime, withAuth } from '$lib/server/utilities';
import { updateTagsForItem } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import { User } from '$lib/models/User';
import { Types } from 'mongoose';

export async function load(event) {
	if (event.locals.user === null) {
		redirect(307, '/login');
	}

	if (!Types.ObjectId.isValid(event.params.id)) {
		error(422, { message: 'Appunto non trovato' });
	}

	const listP = await List.findById({ _id: event.params.id });
	const userDataP = await User.findById({ _id: event.locals.user._id }, { tags: 1 });

	let list, userData;
	try {
		[list, userData] = await Promise.all([listP, userDataP]);
	} catch (error) {
		error(500);
	}

	const userIsAuthor = list?.userID.equals(event.locals.user._id);
	if (!userIsAuthor) error(500, { message: 'Appunto non trovato' });

	const userTags = userData.tags;
	const noteTags = [];
	userTags.forEach((tag) => {
		if (tag.noteIDs.some((id) => id.toString() === event.params.id)) noteTags.push(tag);
	});
	return {
		list: JSON.parse(JSON.stringify(list)),
		userTags: JSON.parse(JSON.stringify(userTags)),
		noteTags: JSON.parse(JSON.stringify(noteTags))
	};
}

export const actions = {
	// UPDATE List Items (add)
	addItem: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formData = await event.request.formData();
		const descr = formData.get('descr');
		const deadline = formData.get('deadline');
		const itemId = new Types.ObjectId();

		const newItem = { _id: itemId, descr, deadline };
		let res = await List.findOneAndUpdate(
			{ _id: event.params.id, userID: event.locals.user._id },
			{
				$push: { items: newItem }
			}
		);
		if (!res) return fail(500, { failed: true });

		if (deadline) {
			const newTask = new Task({
				title: descr || 'Nuova attivita',
				deadline: new Date(deadline),
				description: '',
				status: 'todo',
				userId: event.locals.user._id,
				listItemId: itemId
			});
			const saved = await newTask.save();
			if (!saved) return fail(500, { failed: true });
		}

		return { success: true };
	}),

	// UPDATE List Items (remove)
	removeItem: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id');

		let res = await List.findOneAndUpdate(
			{ _id: event.params.id, userID: event.locals.user._id },
			{ $pull: { items: { _id: id } } }
		);
		if (!res) return fail(500, { failed: true });

		res = await Task.deleteMany({ userId: event.locals.user._id, listItemId: id });
		if (!res) return fail(500, { failed: true });

		return { success: true };
	}),

	// UPDATE List Title
	updateTitle: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const formData = await event.request.formData();
		const title = formData.get('title');

		const res = await List.findOneAndUpdate(
			{ _id: event.params.id, userID: event.locals.user._id },
			{ title }
		);
		if (!res) return fail(500, { failed: true });

		redirect(303, '/note');
	}),

	// UPDATE Tags (for this list)
	updateTags: withAuth(async (event) => {
		return await updateTagsForItem(event, event.params.id);
	}),

	// DELETE List
	delete: withAuth(async (event) => {
		if (!Types.ObjectId.isValid(event.params.id)) {
			error(422, { message: 'Appunto non trovato' });
		}

		const res = await List.findOneAndDelete({
			_id: event.params.id,
			userID: event.locals.user._id
		});
		if (!res) return fail(500, { failed: true });

		redirect(303, '/note');
	})
};

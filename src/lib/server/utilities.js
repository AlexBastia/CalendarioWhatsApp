import { redirect, error, fail } from '@sveltejs/kit';
import { PREVIEW_MAX_LEN } from './constants';
import { User } from '$lib/models/User';
import { Types } from 'mongoose';
// https://stackoverflow.com/a/53637828
export const truncateNoteText = (str) => {
	const num = PREVIEW_MAX_LEN;
	if (str.length > num) {
		return str.slice(0, num) + '...';
	} else {
		return str;
	}
};

// Time and Date
export const getCurrTime = () => {
	return new Date();
};

// Shared handler to update user tags for a note/list item
export async function updateTagsForItem(event, itemId) {
	if (!Types.ObjectId.isValid(itemId)) {
		throw error(422, { message: 'Appunto non trovato' });
	}

	const formDataP = event.request.formData();
	const userDataP = User.findById({ _id: event.locals.user._id }, { tags: 1 });

	let formData, userData;
	try {
		[formData, userData] = await Promise.all([formDataP, userDataP]);
	} catch (err) {
		return fail(500, { failed: true });
	}

	userData.tags.forEach((tag) => {
		if (formData.get(`${tag._id}`)) {
			if (!tag.noteIDs.some((id) => id.toString() === itemId)) tag.noteIDs.push(itemId);
		} else {
			tag.noteIDs = tag.noteIDs.filter((id) => id.toString() !== itemId);
		}
	});

	await User.updateOne({ _id: event.locals.user._id }, { tags: userData.tags });

	return { success: true };
}

// Check if a valid user is set before running the action
export const withAuth = (action) => {
   return async function(event, ...args) {
	   if (!event.locals.user) {
		   throw redirect(307, '/login');
	   }
	   return await action(event, ...args);
   };
};

import { Note } from '$lib/models/Note';
import { error, fail, redirect } from '@sveltejs/kit';
import { getCurrTime, truncateNoteText, withAuth } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import mongoose from 'mongoose';
import { User } from '$lib/models/User';
import { List } from '$lib/models/List';

export async function load(event) {
  if (event.locals.user === null) {
    return redirect(307, '/login');
  }

  const userDataP = User.findById({ _id: event.locals.user._id }, { tags: 1 });
  const notesP = Note.find({ userID: event.locals.user._id }, { text: 0 });
  const listsP = List.find({ userID: event.locals.user._id });
  const sharedNotesP = Note.find(
    {
      $or: [
        { isPublic: true, userID: { $ne: event.locals.user._id } },
        { 'sharedUsers.userID': event.locals.user._id }
      ]
    },
    { text: 0 }
  );

  let userData, notes, lists, sharedNotes;
  try {
    [userData, notes, lists, sharedNotes] = await Promise.all([
      userDataP,
      notesP,
      listsP,
      sharedNotesP
    ]);
  } catch (err) {
    error(500);
  }

  const userTags = userData.tags;
  return {
    lists: JSON.parse(JSON.stringify(lists)),
    notePreviews: JSON.parse(JSON.stringify(notes)),
    sharedNotePreviews: JSON.parse(JSON.stringify(sharedNotes)),
    userTags: JSON.parse(JSON.stringify(userTags))
  };
}

export const actions = {
  // CREATE Note
  create: withAuth(async (event) => {
    const data = await event.request.formData();

    let title = data.get('title').substring(0, TITLE_MAX_LEN) || '';
    const text = data.get('text').substring(0, TEXT_MAX_LEN) || '';
    const tagIDs = data.get('tagIDs') || [];
    const timeCreation = data.get('time')

    if (data.get('copy')) {
      title = (title || '') + '|duplicato';
      title.substring(0, TITLE_MAX_LEN);
    }

    const newNote = new Note({
      title,
      text,
      charNum: text.length,
      tagIDs,
      textStart: truncateNoteText(text),
      timeCreation,
      timeLastModified: timeCreation,
      userID: event.locals.user._id
    });

    const saved = await newNote.save();
    if (!saved) return fail(500, { failed: true });

    redirect(303, `/note/${saved._id.toString()}`);
  }),

  // CREATE Tag
  createTag: withAuth(async (event) => {
    const data = await event.request.formData();

    const tagName = data.get('tagName');

    if (!tagName) return fail(400, { missing: true });
    if (tagName.trim() === '') return fail(400, { tagName, invalid: true });

    const res = await User.updateOne(
      { _id: event.locals.user._id },
      {
        $push: { tags: { name: tagName, noteIDs: [] } }
      }
    );
    if (!res) return fail(500, { tagName, failed: true });
    return { success: true };
  }),

  // DELETE Tag
  deleteTag: withAuth(async (event) => {
    const data = await event.request.formData();

    const tagID = data.get('id');

    if (!tagID) return fail(400, { tagID, missing: true });

    const res = await User.updateOne(
      { _id: event.locals.user._id },
      {
        $pull: { tags: { _id: tagID } }
      }
    );
    if (!res) return fail(500, { tagID, failed: true });
    return { success: true };
  })
};

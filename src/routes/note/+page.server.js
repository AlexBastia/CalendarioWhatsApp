import { Note } from "$lib/models/Note";
import { error, fail, redirect } from "@sveltejs/kit";
import { getCurrTime, truncateNoteText } from "$lib/server/utilities";
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from "$lib/server/constants";
import mongoose from "mongoose";
import { User } from "$lib/models/User";
import { List } from "$lib/models/List";

export async function load(event) {

  if (event.locals.user === null) {
    return redirect(301, "/login");
  }

  const notes = await Note.find({ userID: event.locals.user._id }, { text: 0 });
  if (!notes) return error(404, { message: "Non e' stato possibile caricare le note" })

  const lists = await List.find({ userID: event.locals.user._id });
  if (!lists) return error(404, { message: "Non e' stato possibile caricare le liste" })

  const sharedNotes = await Note.find({ $or: [{ isPublic: true, userID: { $ne: event.locals.user._id } }, { "sharedUsers.userID": event.locals.user._id }] }, { text: 0 }) // Find notes that are public or shared with the user

  const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })

  if (!userData) return fail(404)

  const userTags = userData.tags
  return {
    lists: JSON.parse(JSON.stringify(lists)),
    notePreviews: JSON.parse(JSON.stringify(notes)),
    sharedNotePreviews: JSON.parse(JSON.stringify(sharedNotes)),
    userTags: JSON.parse(JSON.stringify(userTags))
  }
}

export const actions = {

  create: async (event) => {
    if (event.locals.user === null) {
      return fail(401);
    }

    const data = await event.request.formData();

    let title = data.get('title').substring(0, TITLE_MAX_LEN) || '';
    const text = data.get('text').substring(0, TEXT_MAX_LEN) || '';
    const tagIDs = data.get('tagIDs') || [];

    const textStart = truncateNoteText(text);
    const charNum = text.length;


    const newNote = new Note({
      title,
      text,
      charNum,
      tagIDs,
      textStart,
      timeCreation: getCurrTime(),
      timeLastModified: getCurrTime(),
      userID: event.locals.user._id
    });

    const saved = await newNote.save();

    if (!saved) return fail(404, { notAvailable: true });

    return redirect(303, `/note/${saved._id.toString()}`)
  },
  
  createTag: async (event) => {
    if (event.locals.user === null) {
      return fail(401)
    }

    const data = await event.request.formData();

    const tagName = data.get('tagName');

    if (tagName === null) return fail(404);
    if (tagName.trim() === '') return fail(422, { message: 'Name not valid' })

    await User.updateOne({ _id: event.locals.user._id }, {
      $push: { tags: { name: tagName, noteIDs: [] } }
    })
  },

  deleteTag: async (event) => {
    if (event.locals.user === null) {
      return fail(401)
    }

    const data = await event.request.formData();
    console.log(data)

    const tagID = data.get('id');

    if (tagID === null) return fail(404);

    await User.updateOne({ _id: event.locals.user._id }, {
      $pull: { tags: { _id: tagID } }
    })
  },

}

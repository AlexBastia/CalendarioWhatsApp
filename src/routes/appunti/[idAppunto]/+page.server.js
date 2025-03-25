import { Note } from '$lib/models/Note';
import { error, redirect, fail } from '@sveltejs/kit';
import { truncateNoteText, getCurrTime } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import { User } from '$lib/models/User';

export async function load(event) {
  if (event.locals.user === null) {
    return redirect(307, '/login')
  }
  let note = await Note.findById({ _id: event.params.idAppunto });

  // Non uso codice 401 per idUtente sbagliato perche'
  // comunica all'utente che l'id appunto esiste
  if (!note || !note.userID.equals(event.locals.user._id)) error(404, { message: 'Appunto non trovato' });

  const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })

  if (!userData) return fail(404)

  const userTags = userData.tags
  const noteTags = [];
  userTags.forEach((tag) => {
    if (tag.noteIDs.some((id) => id.toString() === event.params.idAppunto)) noteTags.push(tag)
  })
  return {
    note: JSON.parse(JSON.stringify(note)),
    userTags: JSON.parse(JSON.stringify(userTags)),
    noteTags: JSON.parse(JSON.stringify(noteTags))
  }
}

export const actions = {
  update: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    const data = await event.request.formData();

    const id = event.params.idAppunto;
    let title = data.get('title').substring(0, TITLE_MAX_LEN) || '';
    const text = data.get('text').substring(0, TEXT_MAX_LEN) || '';

    const textStart = truncateNoteText(text);
    const timeLastModified = getCurrTime();
    const charNum = text.length;

    const note = await Note.findOneAndUpdate({ userID: event.locals.user._id, _id: id }, {
      title,
      text,
      charNum,
      textStart,
      timeLastModified
    });

    if (!note) return fail(404, { notAvailable: true });

    if (data.get('copy')) {
      title = (title || '') + '|duplicato';
      title.substring(0, TITLE_MAX_LEN);

      const newNote = new Note({
        title,
        text,
        charNum,
        tagIDs: [],
        textStart,
        timeCreation: getCurrTime(),
        timeLastModified: getCurrTime(),
        userID: event.locals.user._id
      });

      const saved = await newNote.save();

      if (!saved) return fail(404, { notAvailable: true });

    }

    // return redirect(303, '/appunti')
  },
  delete: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }

    const id = event.params.idAppunto;
    const res = await Note.deleteOne({ userID: event.locals.user._id, _id: id });

    if (!res.ok) return fail(404)

    return { success: true }
  },
  updateTags: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }

    const formData = await event.request.formData();
    const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })
    if (!userData) return fail(404)
    userData.tags.forEach((tag) => {
      if (formData.get(`${tag._id}`)) {
        if (!tag.noteIDs.some((id) => id.toString() === event.params.idAppunto)) tag.noteIDs.push(event.params.idAppunto)
      }
      else {
        tag.noteIDs = tag.noteIDs.filter((id) => id.toString() !== event.params.idAppunto)
      }
    })

    await User.updateOne({ _id: event.locals.user._id }, { tags: userData.tags })
  }
}

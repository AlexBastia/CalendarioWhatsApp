import { Note } from '$lib/models/Note';
import { error, redirect, fail } from '@sveltejs/kit';
import { truncateNoteText, getCurrTime } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import { User } from '$lib/models/User';
import { Types } from 'mongoose';
import { verifyEmailInput } from '$lib/server/email';
import { getUserFromEmail } from '$lib/server/user';

export async function load(event) {
  if (event.locals.user === null) {
    return redirect(307, '/login')
  }

  // Per evitare errori di casting di mongoose
  if (!Types.ObjectId.isValid(event.params.id)) {
    error(404, { message: 'Appunto non trovato' })
  }

  let note = await Note.findById({ _id: event.params.id });
  if (!note) error(404, { message: 'Appunto non trovato' });

  // Non uso codice 401 per idUtente sbagliato perche'
  // comunica all'utente che l'id appunto esiste
  const userIsAuthor = note.userID.equals(event.locals.user._id);
  const noteIsShared = note.isPublic && !userIsAuthor || note.sharedUsers.some((usr) => usr.userID.equals(event.locals.user._id));
  if (!noteIsShared && !userIsAuthor) error(404, { message: 'Appunto non trovato' })

  const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })

  let sharedUserData = null;
  if (noteIsShared) sharedUserData = await User.findById({ _id: note.userID }, { username: 1, email: 1 })

  if (!userData) return fail(404)

  const userTags = userData.tags
  const noteTags = [];
  userTags.forEach((tag) => {
    if (tag.noteIDs.some((id) => id.toString() === event.params.id)) noteTags.push(tag)
  })
  return {
    sharedUserData: JSON.parse(JSON.stringify(sharedUserData)),
    noteIsShared,
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
    // Per evitare errori di casting di mongoose
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const data = await event.request.formData();

    const id = event.params.id;
    let title = data.get('title').substring(0, TITLE_MAX_LEN) || '';
    const text = data.get('text').substring(0, TEXT_MAX_LEN) || '';

    const textStart = truncateNoteText(text);
    const timeLastModified = getCurrTime();
    const charNum = text.length;

    const note = await Note.findOneAndUpdate({ $or: [{ _id: id, isPublic: true }, { _id: id, userID: event.locals.user._id }, { _id: id, "sharedUsers.userID": event.locals.user._id }] }, {
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
        userID: event.locals.user._id,
        sharedUsers: []
      });

      const saved = await newNote.save();

      if (!saved) return fail(404, { notAvailable: true });

    }

    // return redirect(303, '/note')
  },
  delete: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    // Per evitare errori di casting di mongoose
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const id = event.params.id;
    const res = await Note.deleteOne({ userID: event.locals.user._id, _id: id });

    if (!res.ok) return fail(404)

    return { success: true }
  },
  updateTags: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })
    if (!userData) return fail(404)
    userData.tags.forEach((tag) => {
      if (formData.get(`${tag._id}`)) {
        if (!tag.noteIDs.some((id) => id.toString() === event.params.id)) tag.noteIDs.push(event.params.id)
      }
      else {
        tag.noteIDs = tag.noteIDs.filter((id) => id.toString() !== event.params.id)
      }
    })

    await User.updateOne({ _id: event.locals.user._id }, { tags: userData.tags })
  },
  addUser: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const email = formData.get('email');

    if (!email || !verifyEmailInput(email)) return fail(400, { email, invalid: true })

    const user = await getUserFromEmail(email)
    if (!user) return fail(400, { email, invalid: true })

    if (user._id.equals(event.locals.user._id)) return fail(400, { email, sameUser: true })

    const note = await Note.findOne({ _id: event.params.id, userID: event.locals.user._id }, { sharedUsers: 1 })
    if (!note) error(404, { message: 'Appunto non trovato' })

    if (note.sharedUsers.some((usr) => usr.userID.equals(user._id))) return fail(400, { email, alreadyAdded: true })

    const usrInfo = { email, userID: user._id.toString() }
    await Note.findOneAndUpdate({ _id: event.params.id }, {
      $push: { sharedUsers: usrInfo }
    })
  },
  removeUser: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const id = formData.get('id');

    if (!Types.ObjectId.isValid(id)) return fail(400, { invalidID: true })

    await Note.findOneAndUpdate({ _id: event.params.id, userID: event.locals.user._id }, {
      $pull: { sharedUsers: { userID: id } }
    })
  },
  setPublic: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }
    const formData = await event.request.formData();
    const isPublic = !!formData.get('isPublic');

    await Note.findOneAndUpdate({ _id: event.params.id, userID: event.locals.user._id }, {
      isPublic
    })
  }
}

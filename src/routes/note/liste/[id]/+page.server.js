import { List } from '$lib/models/List';
import { error, redirect, fail } from '@sveltejs/kit';
import { getCurrTime } from '$lib/server/utilities';
import { TITLE_MAX_LEN, TEXT_MAX_LEN } from '$lib/server/constants';
import { User } from '$lib/models/User';
import { Types } from 'mongoose';

export async function load(event) {
  if (event.locals.user === null) {
    return redirect(307, '/login')
  }

  // Per evitare errori di casting di mongoose
  if (!Types.ObjectId.isValid(event.params.id)) {
    error(404, { message: 'Nota non trovata' })
  }

  let list = await List.findById({ _id: event.params.id });
  if (!list) error(404, { message: 'Appunto non trovato' });

  // Non uso codice 401 per idUtente sbagliato perche'
  // comunica all'utente che l'id appunto esiste
  const userIsAuthor = list.userID.equals(event.locals.user._id);
  if (!userIsAuthor) error(404, { message: 'Appunto non trovato' })

  const userData = await User.findById({ _id: event.locals.user._id }, { tags: 1 })
  if (!userData) return fail(404)

  const userTags = userData.tags
  const noteTags = [];
  userTags.forEach((tag) => {
    if (tag.noteIDs.some((id) => id.toString() === event.params.id)) noteTags.push(tag)
  })
  return {
    list: JSON.parse(JSON.stringify(list)),
    userTags: JSON.parse(JSON.stringify(userTags)),
    noteTags: JSON.parse(JSON.stringify(noteTags))
  }
}

export const actions = {
  addItem: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const descr = formData.get('descr');
    const deadline = formData.get('deadline');

    const newItem = { descr, deadline };
    await List.findOneAndUpdate({ _id: event.params.id, userID: event.locals.user._id }, {
      $push: { items: newItem }
    })
  },
  removeItem: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const id = formData.get('id');

    const res = await List.findOneAndUpdate({ _id: event.params.id, userID: event.locals.user._id },
      { $pull: { items: { _id: id } } }
    )
  },
  updateTitle: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const formData = await event.request.formData();
    const title = formData.get('title');

    const res = await List.findOneAndUpdate({ _id: event.params.id, userID: event.locals.user._id },
      { title }
    )
  },
  delete: async (event) => {
    if (event.locals.user === null) {
      return fail(401, { noSession: true });
    }
    if (!Types.ObjectId.isValid(event.params.id)) {
      error(404, { message: 'Appunto non trovato' })
    }

    const res = await List.findOneAndDelete({ _id: event.params.id, userID: event.locals.user._id })
    return redirect(303, '/note')
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
}

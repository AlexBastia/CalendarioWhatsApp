import { List } from "$lib/models/List";
import { getCurrTime, withAuth } from "$lib/server/utilities";
import { redirect, fail } from "@sveltejs/kit";

export const actions = {
  create: withAuth(async (event) => {
    const newList = new List({
      title: '',
      charNum: 0,
      items: [],
      timeCreation: getCurrTime(),
      timeLastModified: getCurrTime(),
      userID: event.locals.user._id
    });

    const saved = await newList.save();
    if (!saved) return fail(500, { failed: true });

    redirect(303, `note/liste/${saved._id.toString()}`)
  })
}

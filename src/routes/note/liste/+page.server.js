import { List } from "$lib/models/List";
import { getCurrTime } from "$lib/server/utilities";
import { redirect, fail } from "@sveltejs/kit";

export const actions = {
  create: async (event) => {
    if (event.locals.user === null) {
      return fail(401);
    }

    const newList = new List({
      title: '',
      charNum: 0,
      items: [],
      timeCreation: getCurrTime(),
      timeLastModified: getCurrTime(),
      userID: event.locals.user._id
    });

    const saved = await newList.save();

    if (!saved) return fail(404, { notAvailable: true });

    return redirect(303, `note/liste/${saved._id.toString()}`)
  }
}

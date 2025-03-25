import { Evento } from "$lib/models/Event.js"
import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation";
import mongoose from "mongoose";

export async function load(event) {

  if (event.locals.user === null) {
    return redirect(301, "/login");
  }

  const rugeElements = await Evento.find({});
  // const eventi = JSON.parse(JSON.stringify(rugeElement));

  return {
    events: rugeElements.map((rugeElement) => ({
      id: rugeElement._id.toString(),
      title: rugeElement.title,
      note: rugeElement.note,
      start: rugeElement.start,
      end: rugeElement.end

    }))
  };
}

export const actions = {
  createEvent: async ({ locals, request, url }) => {
    if (locals.user === null) {
      return redirect(301, "/login");
    }
    const formData = await request.formData();

    let dateStart;
    let dateEnd;
    const title = formData.get('title');
    const note = formData.get('note');
    const allDay = formData.get('allDay') === 'on';
    const location = formData.get('location');

    if (allDay) {
      dateStart = new Date(formData.get('dateStart'));
      dateEnd = dateStart;
    }

    else {
      dateStart = new Date(`${formData.get('dateStart')}T${formData.get('timeStart')}`);
      dateEnd = new Date(`${formData.get('dateStart')}T${formData.get('timeEnd')}`);
    }


    // Log dei dati ricevuti

    console.log(`Orario: ${dateStart.getHours()}:${dateStart.getMinutes()}`);
    console.log(`Orario: ${dateEnd.getHours()}:${dateEnd.getMinutes()}`);

    const event = new Evento({
      title: title,
      start: dateStart,
      end: dateEnd,
      place: location,
      allDay: allDay,
      note: note
    });

    console.log(event);
    const saved = await event.save();

    if (!saved) return { success: false };

    redirect(303, `${url.origin}${url.pathname}/${saved._id.toString()}`);
  },
  updateEvent: async ({ locals, request }) => {
    if (locals.user === null) {
      throw fail(401);
    }
    const formData = await request.formData();

    let dateStart;
    let dateEnd;
    const id = new mongoose.Types.ObjectId(formData.get('id'));
    const title = formData.get('title');
    const note = formData.get('note');
    const allDay = formData.get('allDay') === 'on';
    const location = formData.get('location');

    if (allDay) {
      dateStart = new Date(formData.get('dateStart'));
      dateEnd = dateStart;
    }

    else {
      dateStart = new Date(`${formData.get('dateStart')}T${formData.get('timeStart')}`);
      dateEnd = new Date(`${formData.get('dateStart')}T${formData.get('timeEnd')}`);
    }


    // Log dei dati ricevuti

    console.log(`Orario: ${dateStart.getHours()}:${dateStart.getMinutes()}`);
    console.log(`Orario: ${dateEnd.getHours()}:${dateEnd.getMinutes()}`);

    const event = await Evento.findOneAndUpdate(
      { _id: id },
      {
        title: title,
        start: dateStart,
        end: dateEnd,
        place: location,
        allDay: allDay,
        note: note
      },
      { new: true }
    );

    console.log(event);

    redirect(303, `${url.origin}`);

  },

  deleteEvent: async ({ locals, request }) => {
    if (locals.user === null) {
      return fail(401);
    }
    const data = await request.formData();

    const id = new mongoose.Types.ObjectId(data.get('id'));
    const idk = await Evento.deleteOne({ _id: id });

    return { success: true }
  }



}

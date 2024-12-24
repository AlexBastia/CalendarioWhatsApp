import { Evento } from "$lib/models/Event.js"
import mongoose from "mongoose";

export async function load() {
    const  rugeElements = await Evento.find( {});
    // const eventi = JSON.parse(JSON.stringify(rugeElement));

    return {
        events: rugeElements.map((rugeElement)=>({
            id: rugeElement._id.toString(),
            title: rugeElement.title,
            note: rugeElement.note,
            start : rugeElement.start,
            end: rugeElement.end

        }))
    };
}

export const actions = {
    createEvent: async ({request})  =>{

        const data = await request.formData();
        const id = new mongoose.Types.ObjectId(data.get('id'));
        const title = data.get('title');

        const start = data.get('start');
        const end = data.get('end');

        const allDay = data.get('allDay');
        const place = data.get('place');
        const note = data.get('node');

        const appunto = await Appunto.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(data.get('id') )}, {
            title,
            start,
            end,
            place,
            allDay,
            note
          }, { new: true });
      


    }
}
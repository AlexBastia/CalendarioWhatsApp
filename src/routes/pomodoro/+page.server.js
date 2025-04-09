import { Pomodoro } from "$lib/models/Pomodoro.js"
import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation";
import mongoose from "mongoose";
import { User } from "$lib/models/User";


export async function load(event) {
    if (event.locals.user === null) {
        return redirect(301, "/login");
    }

    const pomodori = await Pomodoro.find(
        { userID: event.locals.user._id }
    ); // Find pomodori that are public or shared with the user
    if (!pomodori) return error(404, { message: "Non e' stato possibile caricare i pomidori" });


    // pomodori condivisi
    const sharedPomodori = await Pomodoro.find({ $or: [{ userID: { $ne: event.locals.user._id } }, { "sharedUsers.userId": event.locals.user._id }] }) // Find notes that are public or shared with the user



    return {
        pomodori: JSON.parse(JSON.stringify(pomodori)),
        sharedPomodori: JSON.parse(JSON.stringify(sharedPomodori)),
    }
}

export const actions = {
    createPomodoro: async (event) => {
        if (event.locals.user === null) {
            return fail(401);
        }

        console.log('dio ghane');

        const data = await event.request.formData();

        console.log('ciccia');
        const title = data.get('title') || ''; // stringa
        const timeStudyDate = data.get('timeStudy'); // oggetto Number
        const sharedUsers = data.get('sharedUsers') || []; // array di oggetti {userId, email}
        const timeBreakDate = data.get('timeBreak') // oggetto Number
        const cycles = data.get('cycles'); // numero di cicli
        const userId = event.locals.user._id; // id dell'utente

        console.log(title);
        console.log(timeBreakDate);
        console.log(timeStudyDate);
        console.log(cycles);
        console.log(data);

        const timeStudy = new Date(1, 1, 1, 0, timeStudyDate).toISOString()
        const timeBreak = new Date(1, 1, 1, 0, timeBreakDate).toISOString()
        console.log(typeof (timeStudy));
        console.log(typeof (timeBreak));

        // Controlla se l'utente è loggato
        console.log('user_id: ', userId);


        const newPomodoro = new Pomodoro({
            timeStudy,
            timeBreak,
            userID: userId,
            sharedUsers: [],
            title,
            cycles: parseInt(cycles, 10),       // Converti in numero
        });
        console.log(newPomodoro);

        const saved = await newPomodoro.save();

        // Restituisci la risposta
        return redirect(303, `/pomodoro/${saved._id.toString()}`)        
    },

    async put({ params }) {
        const { id, title, description, duration, sharedUsers } = params;
        const pomodoro = await Pomodoro.findById(id);
        if (!pomodoro) return { status: 404, body: { message: "Pomodoro non trovato" } };
        pomodoro.title = title;
        pomodoro.description = description;
        pomodoro.duration = duration;
        pomodoro.sharedUsers = sharedUsers;
        await pomodoro.save();
        return {
            status: 200,
            body: pomodoro
        }
    },

    async delete({ params }) {
        const { id } = params;
        const pomodoro = await Pomodoro.findById(id);
        if (!pomodoro) return { status: 404, body: { message: "Pomodoro non trovato" } };
        await pomodoro.delete();
        return {
            status: 204,
            body: {}
        }
    }
}
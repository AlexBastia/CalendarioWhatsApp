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
        { userId: event.locals.user._id }
    ); // Find pomodori that are public or shared with the user
    if (!pomodori) return error(404, { message: "Non e' stato possibile caricare i pomidori" });
      

    // pomodori condivisi
    const sharedPomodori = await Pomodoro.find({ $or: [{userId: { $ne: event.locals.user._id } }, { "sharedUsers.userId": event.locals.user._id }] }) // Find notes that are public or shared with the user

    
    
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

        const title = data.get('title') || ''; // stringa
        const timeStudy = data.get('timeStudy'); // oggetto Number
        const sharedUsers = data.get('sharedUsers') || []; // array di oggetti {userId, email}
        const timeBreak = data.get('timeBreak') // oggetto Number
        const cycles = data.get('cycles'); // numero di cicli
        const userId = event.locals.user._id;

        console.log(title);
        console.log(timeBreak);
        console.log(timeStudy);
        console.log(cycles);
        console.log(data)


        const newPomodoro = new Pomodoro({
            title,
            timeStudy: String(new Date(1,1,1,0, timeStudy)), 
            timeBreak: String(new Date(1,1,1,0, timeBreak)), 
            cycles: parseInt(cycles, 10),       // Converti in numero
            sharedUsers: [],
            userId
        });
        await newPomodoro.save();

        // Restituisci la risposta
        return {
            status: 201,
            body: newPomodoro
        }
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
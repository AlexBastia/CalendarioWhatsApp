import { Pomodoro } from "$lib/models/Pomodoro.js"
import { redirect } from "@sveltejs/kit";
import mongoose from "mongoose";
import { User } from "$lib/models/User";
import { fail, error } from "@sveltejs/kit";


export async function load(event) {
    if (event.locals.user === null) {
        return redirect(301, "/login");
    }

    const pomodori = await Pomodoro.find(
        { userID: event.locals.user._id }
    ); // Find pomodori that are public or shared with the user
    if (!pomodori) return error(404, { message: "Non e' stato possibile caricare i pomidori" });


    // pomodori condivisi
    const sharedPomodori = await Pomodoro.find({
        userID: { $ne: event.locals.user._id }, 
        sharedUsers: event.locals.user._id      
    }); 



    return {
        pomodori: JSON.parse(JSON.stringify(pomodori)),
        sharedPomodori: JSON.parse(JSON.stringify(sharedPomodori)),
    }
}

export const actions = {
    editPomodoro: async (event) => {
            console.log('editPomodoro action called');
            if (event.locals.user === null) {
                return fail(401);
            }

            const data = await event.request.formData();
            const id = event.url.searchParams.get('id');
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
            const pomodoro = await Pomodoro.findById(id);
            if (!pomodoro) return fail(404, { message: "Pomodoro non trovato" });

            pomodoro.timeStudy = timeStudy;
            pomodoro.timeBreak = timeBreak;
            pomodoro.userID = userId;
            pomodoro.sharedUsers = sharedUsers;
            pomodoro.title = title;
            pomodoro.cycles = parseInt(cycles, 10);       // Converti in numero
            console.log(pomodoro);

            const saved = await pomodoro.save();
            console.log(saved);
            // Restituisci la risposta
            return redirect(303, `/pomodoro/${saved._id.toString()}`)
    },

    
    delPomFromSU: async ({request, locals}) => {
        if (!locals.user) {
            return fail(401);
        }
        console.log('ci sono, del su');
        const data = await request.formData();
        const id = data.get('id');

        try {
            const pomodoro = await Pomodoro.findById(id);
            if (!pomodoro) {
                return fail(404, { message: "Pomodoro non trovato" });
            }

            console.log('prima', pomodoro);

            console.log(pomodoro.sharedUsers, locals.user._id);

            

            const newSU = pomodoro.sharedUsers.filter(user => 
                !user.equals(locals.user._id)
            ); // SI ROMPE QUI

            console.log('zio pera', newSU);

            // Rimuovi l'utente dagli sharedUsers
            pomodoro.sharedUsers = newSU;
            await pomodoro.save();

            return { success: true };

        } catch(e){
            console.error('errore')
            return fail(500, { message: "Errore" });
        }
    },
    deletePomodoro: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401);
        }
        const data = await request.formData();
        const id = data.get('id');
        console.log('iai')

        try {
            const result = await Pomodoro.deleteOne({ _id: id, userID: locals.user._id });

            if (result.deletedCount === 0) {
                return fail(404, { message: "Pomodoro non trovato o non autorizzato" });
            }

            return { success: true };

        } catch (err) {
            console.error("Errore durante la cancellazione:", err);
            return fail(500, { message: "Errore interno del server" });
        }
    },

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

        console.log('reeindirizzamento a: ' + `/pomodoro/${saved._id.toString()}`);

        // Restituisci la risposta
        return redirect(303, `/pomodoro/${saved._id.toString()}`)        
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
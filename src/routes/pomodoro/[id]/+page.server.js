import { Pomodoro } from '$lib/models/Pomodoro.js'; 
import { redirect, error } from '@sveltejs/kit'; 


export async function load(event) {
    if (!event.locals.user) {
        redirect(303, '/login'); 
    }

    const pomodoroId = event.params.id;

    try {
        
        const pomodoroDoc = await Pomodoro.findOne({
            _id: pomodoroId
        });

        if (!pomodoroDoc) {
            throw error(404, { message: 'Pomodoro non trovato o accesso non consentito' });
        }

        return {
            pomodoro: JSON.parse(JSON.stringify([pomodoroDoc]))
        };

    } catch (err) {
        if (err.status) { 
            throw err; 
        }
        console.error("Errore durante il caricamento del Pomodoro [ID]:", err);
        throw error(500, { message: 'Errore interno del server durante il recupero dei dati del Pomodoro' });
    }
}
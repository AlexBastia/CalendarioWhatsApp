import { Pomodoro } from '$lib/models/Pomodoro.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    // Proteggi la rotta: se l'utente non è loggato, reindirizzalo
    if (!locals.user) {
        redirect(303, '/login');
    }

    // Carica tutti i preset pomodoro dell'utente
    const pomodori = await Pomodoro.find({ userID: locals.user.id });

    // Restituisci i dati al componente frontend
    return {
        pomodori: JSON.parse(JSON.stringify(pomodori))
    };
}
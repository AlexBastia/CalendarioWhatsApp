import { Evento } from '$lib/models/Event.js';
import { Pomodoro } from '$lib/models/Pomodoro.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
    console.log(`Eseguo LOAD per [id] alle ${new Date().toLocaleTimeString()}`); // <-- AGGIUNGI QUESTO

    // Proteggi la rotta
    if (!locals.user) {
        redirect(303, '/login');
    }

    // Carica l'evento specifico usando l'ID dai parametri dell'URL
    const evento = await Evento.findById(params.id);

    // Se l'evento non esiste, lancia un errore 404
    if (!evento) {
        throw error(404, 'Evento non trovato');
    }

    // Carica tutti i preset pomodoro dell'utente
    const pomodori = await Pomodoro.find({ userID: locals.user.id });

    return {
        evento: JSON.parse(JSON.stringify(evento)),
        pomodori: JSON.parse(JSON.stringify(pomodori))
    };
}

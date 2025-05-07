import { Pomodoro } from '$lib/models/Pomodoro.js'; // Assicurati che il percorso al modello sia corretto
import { redirect, error } from '@sveltejs/kit'; // Importa 'error' per gestire i 404

// Nota: mongoose e User non sono strettamente necessari qui a meno che non si facciano validazioni di ID
// o si carichino dati utente specifici non correlati al pomodoro stesso.

export async function load(event) {
    // 1. Controlla se l'utente è autenticato
    if (!event.locals.user) {
        redirect(303, '/login'); // Reindirizza alla pagina di login se l'utente non è loggato
    }

    // 2. Ottieni l'ID del Pomodoro dai parametri della rotta
    const pomodoroId = event.params.id;

    // (Opzionale: potresti voler validare il formato dell'ID qui se necessario,
    // anche se Mongoose di solito lo gestisce e restituisce null se l'ID non è valido/non trovato)
    // if (!mongoose.Types.ObjectId.isValid(pomodoroId)) {
    //     throw error(400, { message: "ID Pomodoro non valido" });
    // }

    try {
        // 3. Recupera il Pomodoro specifico dal database
        // Cerca un pomodoro che abbia l'_id specificato E che:
        //    a) appartenga all'utente loggato (tramite userID)
        //    b) OPPURE sia condiviso con l'utente loggato (tramite l'array sharedUsers)
        const pomodoroDoc = await Pomodoro.findOne({
            _id: pomodoroId
        });

        // 4. Se il Pomodoro non viene trovato (o l'utente non ha accesso), restituisci un errore 404
        if (!pomodoroDoc) {
            throw error(404, { message: 'Pomodoro non trovato o accesso non consentito' });
        }

        // 5. Restituisci i dati del Pomodoro.
        // Il tuo codice client si aspetta data.pomodoro[0], quindi incapsuliamo il documento in un array.
        // È importante serializzare l'oggetto Mongoose prima di passarlo al client.
        return {
            pomodoro: JSON.parse(JSON.stringify([pomodoroDoc]))
        };

    } catch (err) {
        // Gestisce errori specifici (come il 404 lanciato sopra) o errori generici del database
        if (err.status) { // Se è un errore lanciato da `error()` di SvelteKit
            throw err; // Rilancia l'errore per farlo gestire da SvelteKit
        }
        console.error("Errore durante il caricamento del Pomodoro [ID]:", err);
        throw error(500, { message: 'Errore interno del server durante il recupero dei dati del Pomodoro' });
    }
}
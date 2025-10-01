import { json } from '@sveltejs/kit';
import { Pomodoro } from '$lib/models/Pomodoro.js';

// utilizzo AI solo per logging
export async function PATCH({ params, locals, request }) {
    // --- 1. Inizio della richiesta ---
    console.log('✅ [PATCH] Richiesta ricevuta per /pomodoro/[id]');
    console.log('PARAMS:', params);

    // --- 2. Controllo Autenticazione ---
    if (!locals.user) {
        console.error('🛑 [AUTH] Utente non autenticato. Accesso negato.');
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('👤 [AUTH] Utente autenticato:', { id: locals.user.id, username: locals.user.username });

    let body, pomId, time;

    try {
        // --- 3. Parsing del Body della Richiesta ---
        body = await request.json();
        pomId = params.id;
        time = body.time;
        
        console.log('📦 [BODY] Dati ricevuti dal client:', { body, pomId, time });

        // --- 4. Validazione dei Parametri ---
        if (!pomId || !time) {
            console.error('⚠️ [VALIDATION] Parametri mancanti.', { pomId, time });
            return json({ error: 'Missing parameters' }, { status: 400 });
        }
        console.log('👍 [VALIDATION] Parametri validi.');

        // --- 5. Aggiornamento del Database ---
        console.log(`🔍 [DB] Tentativo di aggiornare Pomodoro con ID: ${pomId} per l'utente ${locals.user.id}...`);
        console.log(`   - Query: findOneAndUpdate({ _id: "${pomId}", userID: "${locals.user.id}" })`);
        console.log(`   - Dati da aggiornare: { $set: { timeLastUsed: ${time} } }`);

        const updatedPomodoro = await Pomodoro.findOneAndUpdate(
            { _id: pomId, userID: locals.user.id },
            { $set: { timeLastUsed: time } },
            { new: true } // Ritorna il documento aggiornato
        ).lean();

        // --- 6. Controllo del Risultato ---
        if (!updatedPomodoro) {
            console.warn(`❓ [DB] Pomodoro con ID: ${pomId} non trovato per questo utente.`);
            return json({ error: 'Pomodoro not found or unauthorized' }, { status: 404 });
        }

        console.log('🎉 [DB] Aggiornamento riuscito!');
        console.log('   - Documento aggiornato:', updatedPomodoro);

        // --- 7. Risposta di Successo ---
        return json({ message: 'timeLastUsed updated successfully', pomodoro: updatedPomodoro }, { status: 200 });

    } catch (error) {
        // --- 8. Gestione degli Errori ---
        console.error('💥 [ERRORE] Si è verificato un errore grave durante l\'operazione PATCH.');
        console.error('   - Tipo di errore:', error.name);
        console.error('   - Messaggio:', error.message);
        console.error('   - Dati al momento dell\'errore:', { body, pomId, time });
        console.error('   - Stack trace:', error.stack);
        
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
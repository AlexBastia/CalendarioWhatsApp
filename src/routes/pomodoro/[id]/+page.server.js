import { Pomodoro } from '$lib/models/Pomodoro.js'; 
import { User } from '$lib/models/User';
import { redirect, error, fail } from '@sveltejs/kit'; 


export async function load(event) {
        console.log(`Eseguo LOAD per [id] alle ${new Date().toLocaleTimeString()}`); // <-- AGGIUNGI QUESTO
    if (!event.locals.user) {
        redirect(303, '/login'); 
    }

    const pomodoroId = event.params.id;

    try {
        
        const pomodoroDoc = await Pomodoro.findOne({
            _id: pomodoroId
        })
        .populate('sharedUsers', 'username email _id') // e username
        .lean(); // per ottenere un plain JavaScript object
        

        if (!pomodoroDoc) {
            throw error(404, { message: 'ziopera' });
        }

        return {
            pomodoro: JSON.parse(JSON.stringify([pomodoroDoc]))
        };

    } catch (err) {
        if (err.status) { 
            throw err; 
        }
        console.error("Errore durante il caricamento del Pomodoro [ID]:", err);
        throw error(500, { message: 'SadBasta noises' });
    }
}

export const actions = {
    removeUser: async ({ request, params, locals }) => {
        const formData = await request.formData();
        const userIdToRemove = formData.get('userId');

        await Pomodoro.updateOne(
            { _id: params.id, userID: locals.user._id }, // Condizione di sicurezza: solo il proprietario può rimuovere
            { $pull: { sharedUsers: userIdToRemove } }
        );
        return { success: true, message: 'Utente rimosso' };
    },    
    addUser: async ({ request, params, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email');

        // ... (fai i tuoi controlli sull'email e sull'utente come nel file delle note)
        const user = await User.findOne({ email: email });
        if (!user) return fail(404, { message: 'Utente non trovato', error: true });
        if (user._id.equals(locals.user._id)) return fail(400, { message: 'Non puoi condividere con te stesso', error: true });

        const pomodoro = await Pomodoro.findById(params.id);
        if (!pomodoro.userID.equals(locals.user._id)) return fail(403, { message: 'Non autorizzato', error: true });

        // Controlla se l'utente è già presente
        if (pomodoro.sharedUsers.some(id => id.equals(user._id))) {
            return fail(400, { message: 'Già condiviso con questo utente', error: true });
        }

        console.log(pomodoro.userID + ' e ' + locals.user._id);

        console.log(pomodoro.userID.equals(locals.user._id));

        // controlla se l'id è dello user che ha creato il pomodoro
        if (pomodoro.userID.equals(locals.user._id)) {
            return fail(400, { message: 'Non puoi condividere con il creatore', error: true });
        }

        // Aggiungi solo l'ID
        pomodoro.sharedUsers.push(user._id);
        await pomodoro.save();
        return { success: true, message: 'Utente aggiunto!' };
    },

    updatePomodoro: async ({ request, params, locals }) => { // <-- 1. Aggiungi 'locals' qui
        console.log('evviva');
        const data = await request.formData();
        const id = params.id;

        const title = data.get('title') || '';
        const timeStudyDate = data.get('timeStudy');
        const sharedUsers = data.get('sharedUsers') || [];
        const timeBreakDate = data.get('timeBreak');
        const cycles = data.get('cycles');
        const userId = locals.user._id; // <-- 2. Usa 'locals' direttamente
        
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
        

        throw redirect(303, `/pomodoro/${id}`);
    },
};


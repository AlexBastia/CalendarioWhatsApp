import { Pomodoro } from '$lib/models/Pomodoro.js'; 
import { redirect, error } from '@sveltejs/kit'; 


export async function load(event) {
        console.log(`Eseguo LOAD per [id] alle ${new Date().toLocaleTimeString()}`); // <-- AGGIUNGI QUESTO
    if (!event.locals.user) {
        redirect(303, '/login'); 
    }

    const pomodoroId = event.params.id;

    try {
        
        const pomodoroDoc = await Pomodoro.findOne({
            _id: pomodoroId
        });

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


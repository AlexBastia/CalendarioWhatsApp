import { Task } from '$lib/models/Task.js';
import { error, redirect } from '@sveltejs/kit';
import { Types } from 'mongoose';

export const load = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(301, '/login');
    }

    if (!Types.ObjectId.isValid(params.id)) {
        throw error(422, 'ID non valido');
    }

    const taskId = params.id;
    const userId = locals.user.id;

    // findOne con .lean() restituisce già un oggetto semplice
    const task = await Task.findOne({ _id: taskId, userId: userId }).lean();

    console.log("Task trovato:", task);

    if (!task) {
        throw error(404, 'Attività non trovata o non autorizzato');
    }
    
    // Restituisci semplicemente l'oggetto task
    return {
        task: JSON.parse(JSON.stringify(task))
    };
};
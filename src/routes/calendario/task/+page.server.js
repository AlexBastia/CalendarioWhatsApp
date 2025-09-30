import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { Task } from '$lib/models/Task.js';

// protecting the route

export async function load(event) {
  if (!event.locals.user) {
    console.log('zio pera1');
    throw redirect(303, '/login');
  }
}

/*
import mongoose from 'mongoose';

const attivitaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['todo', 'done', 'late'],
    default: 'todo'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Usa il percorso completo
    required: true,
    ref: 'User'
  },
  lastNotificationLevel: {
    type: String,
    enum: ['Nessuna', 'Imminente', 'Oggi', 'Scaduta'],
    default: 'Nessuna'
  },
  listItemId: {
    type: mongoose.Schema.Types.ObjectId
  }
});

export const Task = mongoose.model('Task', attivitaSchema);


*/

// adding actions
export const actions = {

    saveTask: async ({ locals, request }) => {
        if (!locals.user) {
          redirect(301, '/login');
        }
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
    
        if (!data.title || !data.deadline) {
            return fail(400, { message: 'Titolo e scadenza sono obbligatori.' });
        }
    
        const taskData = {
          title: data.title,
          description: data.description,
          deadline: new Date(data.deadline + 'T23:59:59'), // Imposta la scadenza alla fine del giorno
          status: 'todo', // Nuove attività sono sempre 'todo'
          userId: locals.user.id 
        };
    
        const taskId = data.id || null;
    
        if (taskId) {
          // Se c'è un ID, aggiorna l'attività esistente
          await Task.findOneAndUpdate({ _id: taskId, userId: locals.user.id }, taskData);
        } else {
          // Altrimenti, crea una nuova attività
          await Task.create(taskData);
        }
    
        // Reindirizza l'utente al calendario dopo l'operazione
        throw redirect(303, '/calendario');
    },
    deleteTask: async ({ locals, request }) => {
        if (!locals.user) {
          redirect(301, '/login');
        }
        const formData = await request.formData();
        const taskId = formData.get('id');
    
        // FIX di sicurezza: assicurati che l'utente possa eliminare solo le proprie attività
        await Task.deleteOne({ _id: taskId, userId: locals.user.id });
    
        // Reindirizza anche dopo l'eliminazione
        throw redirect(303, '/calendario');
    },
    markAsCompleted: async ({locals, request})=>{
        deleteTask: async ({ locals, request }) => {
        if (!locals.user) {
          redirect(301, '/login');
        }
        const formData = await request.formData();
        const taskId = formData.get('id');

        await Task.updateOne({user: locals.user._id},{status: 'done'});
        throw redirect(303, '/calendario');
      }
    }
};
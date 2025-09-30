import { json } from '@sveltejs/kit';
import { User } from '$lib/models/User'; // Assicurati che il percorso sia corretto
import { Evento } from '$lib/models/Event.js';
import { Notifica } from '$lib/models/Notification.js';

export async function PATCH({ params, locals, request }) {
    console.log('fwe')
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const eventId = params.id;
    const body = await request.json();
    const status = body.stat;



    if (!eventId || !status) {
        return json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const res = await Evento.findOneAndUpdate(
    { _id: eventId, userID: locals.user.id },
    { $set: { status } }  ).lean();


        return json({ message: 'Status updated successfully', res }, { status: 200 });
    } catch (error) {
        console.error('Error updating event status:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
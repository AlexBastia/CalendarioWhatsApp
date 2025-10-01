import { json } from '@sveltejs/kit';
import { Evento } from '$lib/models/Event';

export async function PATCH({ locals, request }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json().catch(() => ({}));
        console.log(body);
        const eventoId = body.event._id;
        const boolValue = !(body.event.notificationSettings.processed);

        const result = await Evento.findOneAndUpdate(
            { _id: eventoId },
            { $set: { 'notificationSettings.processed': boolValue } },
            { new: true }
        );

        if (!result) {
            return json({ error: 'Event not found' }, { status: 404 });
        }

        return json({ success: true, evento: result });
    } catch (err) {
        console.error(err);
        return json({ error: 'Update failed' }, { status: 500 });
    }
}
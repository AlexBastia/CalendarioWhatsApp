import { json } from '@sveltejs/kit';
import { Notifica } from '$lib/models/Notification.js';

export async function PATCH({ locals, request }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const notificationId = body.notificationId;

        if (notificationId) {
            const updatedNotification = await Notifica.findOneAndUpdate(
                { _id: notificationId, destinatario: locals.user.id },
                { $set: { letta: true } },
                { new: true }
            ).lean();

            if (!updatedNotification) {
                return json({ error: 'Notification not found or unauthorized' }, { status: 404 });
            }

            return json({ 
                success: true, 
                notification: updatedNotification 
            });

        } else {
            const result = await Notifica.updateMany(
                { destinatario: locals.user.id, letta: false },
                { $set: { letta: true } }
            );

            return json({ 
                success: true, 
                modifiedCount: result.modifiedCount 
            });
        }

    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
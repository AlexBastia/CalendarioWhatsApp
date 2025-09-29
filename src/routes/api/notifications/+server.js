import { json } from '@sveltejs/kit';
import { Notifica } from '$lib/models/Notification.js';
import mongoose from 'mongoose';
//api/notification/+server

/** @type {import('./$types').RequestHandler} */

export async function GET({ cookies, url, locals }) {
	try {
		if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
	const userId = locals.user._id;

		// Verifica che l'ID utente sia valido
		if (!mongoose.Types.ObjectId.isValid(locals.user._id)) {
			return json({ error: 'ID utente non valido' }, { status: 400 });
		}

		// Costruisci la query
		const query = {
			destinatario: new mongoose.Types.ObjectId(userId)
		};

		// Trova le notifiche con populate del mittente
		const notifications = await Notifica.find(query)
			.populate('mittente', 'email') // Popola solo i campi necessari del mittente
			.sort({ createdAt: -1 }) // Ordina per data di creazione (più recenti prima)
			.lean(); // Usa lean() per performance migliori

		// Conta il totale delle notifiche non lette per il badge
		const unreadCount = await Notifica.countDocuments({
			destinatario: new mongoose.Types.ObjectId(userId),
			letta: false
		});

		return json({
			success: true,
			notifications,
			unreadCount,

		});

	} catch (error) {
		console.error('Errore nel recupero delle notifiche:', error);
		return json(
			{ 
				success: false,
				error: 'Errore interno del server',
				message: error.message 
			}, 
			{ status: 500 }
		);
	}
}
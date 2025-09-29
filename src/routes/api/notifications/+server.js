import { json } from '@sveltejs/kit';
import { Notifica } from '$lib/models/Notification.js';
import { Evento } from '$lib/models/Event.js'; // Importa il modello Event
import mongoose from 'mongoose';

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

		// Per ogni notifica di tipo EVENTO, popola i dati dell'evento
		const enrichedNotifications = await Promise.all(
			notifications.map(async (notification) => {
				if (notification.tipo === 'EVENTO') {
					try {
						const evento = await Evento.findById(notification.riferimento)
							.select('title start end') // Seleziona solo i campi necessari
							.lean();
						
						return {
							...notification,
							evento // Aggiungi i dati dell'evento alla notifica
						};
					} catch (error) {
						console.error(`Errore nel recuperare evento ${notification.riferimento}:`, error);
						return notification; // Restituisce la notifica senza i dati dell'evento se c'è un errore
					}
				}
				return notification;
			})
		);

		// Conta il totale delle notifiche non lette per il badge
		const unreadCount = await Notifica.countDocuments({
			destinatario: new mongoose.Types.ObjectId(userId),
			letta: false
		});

		return json({
			success: true,
			notifications: enrichedNotifications,
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
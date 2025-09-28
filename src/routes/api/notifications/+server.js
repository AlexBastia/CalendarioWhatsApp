import { json } from '@sveltejs/kit';
import { Notifica } from '$lib/models/Notifica.js';
import mongoose from 'mongoose';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies, url }) {
	try {
		// Ottieni l'ID utente dalla sessione/cookie (adatta in base al tuo sistema di auth)
		const userId = cookies.get('userId'); // o il metodo che usi per l'autenticazione
		
		if (!userId) {
			return json({ error: 'Non autenticato' }, { status: 401 });
		}

		// Verifica che l'ID utente sia valido
		if (!mongoose.Types.ObjectId.isValid(userId)) {
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
			.limit(Math.min(limit, 100)) // Limita a max 100 per performance
			.skip(skip)
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
			hasMore: notifications.length === limit // Indica se ci sono altre notifiche
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
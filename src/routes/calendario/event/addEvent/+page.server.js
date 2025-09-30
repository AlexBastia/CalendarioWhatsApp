import { Pomodoro } from '$lib/models/Pomodoro.js';
import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
	// Proteggi la rotta: se l'utente non è loggato, reindirizzalo
	if (!locals.user) {
		redirect(303, '/login');
	}

	const searchParams = url.searchParams;

	const date = searchParams.get('date');
	const startTime = searchParams.get('startTime');
	const endTime = searchParams.get('endTime');

	// Carica tutti i preset pomodoro dell'utente
	const pomodori = await Pomodoro.find({ userID: locals.user.id });
	console.log('Pomodori caricati:', pomodori);

	// Restituisci i dati al componente frontend
	return {
		pomodori: JSON.parse(JSON.stringify(pomodori)),
        options: JSON.parse(JSON.stringify({date, startTime, endTime}))
	};
}

import { json } from '@sveltejs/kit';
import { User } from '$lib/models/User'; // Assicurati che il percorso sia corretto

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("Ricevuto richiesta di aggiornamento tempo virtuale");
    console.log(request);

    const { virtualTime } = await request.json();
    console.log(`Nuovo tempo virtuale ricevuto: ${virtualTime}`);
    
    console.log(`Aggiornamento tempo virtuale a: ${virtualTime}`);

    try {
        const user = await User.findById(locals.user.id);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        user.virtualTime = new Date(virtualTime);
        await user.save();

        console.log(`Tempo virtuale aggiornato a ${user.virtualTime} per l'utente ${user.username}`);
        return json({ message: 'Virtual time updated successfully', virtualTime: user.virtualTime });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del tempo virtuale:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
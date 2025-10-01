import { json } from '@sveltejs/kit';
import { Notifica } from '$lib/models/Notification.js';
import { Evento } from '$lib/models/Event.js';

import { Task } from '$lib/models/Task';

import mongoose from 'mongoose';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies, url, locals }) {
    // 1. Log all'inizio della richiesta
    console.log('\n--- 📥 Inizio GET /api/notifications ---');
    
    try {
        console.log('👤 Utente in sessione:', locals.user ? locals.user._id : 'Nessuno');
        
        if (!locals.user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = locals.user._id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return json({ error: 'ID utente non valido' }, { status: 400 });
        }

        const query = {
            destinatario: new mongoose.Types.ObjectId(userId)
        };

        // 3. Log prima della query principale
        console.log(`🔍 Eseguo query notifiche per utente: ${userId}`);
        const notifications = await Notifica.find(query)
            .populate('mittente', 'email')
            .sort({ createdAt: -1 })
            .lean();
        
        // 4. Log dopo la query principale
        console.log(`📬 Trovate ${notifications.length} notifiche totali.`);

        // 5. Log prima del processo di arricchimento
        console.log('🔄 Inizio arricchimento (aggiunta dettagli evento)...');
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notification) => {
                if (notification.tipo === 'EVENTO' && notification.riferimento) {
                    try {
                        const evento = await Evento.findById(notification.riferimento)
                            .select('title start end')
                            .lean();
                        
                        return {
                            ...notification,
                            evento
                        };
                    } catch (error) {
                        console.error(`❌ Errore nel recuperare evento ${notification.riferimento}:`, error);
                        return notification;
                    }
                }
                else if (notification.tipo === 'ATTIVITA') {
                    try {
                        const task = await Task.findById(notification.riferimento)
                            .select('title lastNotificationLevel') // Selezioniamo titolo e urgenza
                            .lean();
                        return { ...notification, task }; // Aggiungiamo i dati dell'attività
                    } catch (error) {
                        console.error(`Errore nel recuperare attività ${notification.riferimento}:`, error);
                        return notification;
                    }
                }

                return notification;
            })
        );
        console.log('✅ Arricchimento completato.');

        // 6. Log prima del conteggio non lette
        console.log('📊 Calcolo conteggio non lette...');
        const unreadCount = await Notifica.countDocuments({
            destinatario: new mongoose.Types.ObjectId(userId),
            letta: false
        });
        console.log(`❗️ Trovate ${unreadCount} notifiche non lette.`);

        // 7. Log del payload finale prima dell'invio
        console.log('✈️  Invio risposta al client...');
        return json({
            success: true,
            notifications: enrichedNotifications,
            unreadCount,
        });

    } catch (error) {
        // Il tuo log di errore è già ottimo
        console.error('💥 Errore grave nel recupero delle notifiche:', error);
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
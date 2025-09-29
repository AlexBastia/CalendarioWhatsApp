// src/lib/server/scheduler.js

import cron from 'node-cron';
import { Evento } from '$lib/models/Event.js'; 
import { Notifica } from '$lib/models/Notification.js';

export function startScheduler() {
  console.log('Scheduler per le notifiche avviato.');
  
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000);
    console.log(`\n🕒 Cron job in esecuzione: ${now.toLocaleTimeString('it-IT')}`);

    try {
    const eventsToNotify = await Evento.find({
      'notificationSettings.enabled': true,
      // Condizione 1: La notifica deve scattare in questo esatto minuto
      'notificationSettings.notifyAt': { $gte: now, $lt: oneMinuteFromNow },
      // Condizione 2: La notifica non deve essere già stata processata
      'notificationSettings.processed': { $ne: true }
    });
    
    if (eventsToNotify.length > 0) {
      console.log(`🔥 Trovati ${eventsToNotify.length} eventi da notificare!`);
      for (const event of eventsToNotify) {
        console.log(`📩 Creazione notifica per l'evento: "${event.title}"`);

        await Notifica.create({
          destinatario: event.userID,
          mittente: null,
          tipo: 'EVENTO',
          riferimento: event._id,
        });

        // Marchiamo l'evento come processato per evitare duplicati
        event.notificationSettings.processed = true;
        await event.save();
        console.log(`✅ Notifica per "${event.title}" creata e marcata come processata.`);
      }
    } else {
      console.log("DB controllato, nessuna notifica da inviare in questo minuto.");
    }
    } catch (error) {
      console.error('Errore durante il controllo delle notifiche degli eventi:', error);
    }
  });
}
// src/lib/server/scheduler.js

import cron from 'node-cron';
import { Evento } from '$lib/models/Event.js'; 
import { Notifica } from '$lib/models/Notification.js';
import { User } from '$lib/models/User.js';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { computeLevel } from '$lib/utils/UpdateTasks.js';

export function startScheduler() {
  console.log('✅ Scheduler completo con Time Machine avviato.');
  
  cron.schedule('*/1 * * * *', async () => {
   
    console.log(`\n🕒 Cron job in esecuzione (Tempo Server: ${new Date()}`);

    try {
      // --- CICLO PRINCIPALE SU TUTTI GLI UTENTI ---
      const allUsers = await User.find({}).select('_id virtualTime').lean();
      
      for (const user of allUsers) {
        const currentTime = user.virtualTime || new Date();
        
        console.log(`--- Controlli per utente ${user._id} (Tempo: ${currentTime.toLocaleTimeString('it-IT')}) ---`);
        

        // --- 2. GESTIONE NOTIFICHE EVENTI PER L'UTENTE CORRENTE ---
        const eventsToNotify = await Evento.find({
          userID: user._id, // Cerca solo gli eventi di questo utente
          'notificationSettings.enabled': true,
          'notificationSettings.notifyAt': { $lte: currentTime }, // Usa il tempo dell'utente
          'notificationSettings.processed': { $ne: true }, 
          'start': { $gt: currentTime } // Usa il tempo dell'utente
        });
        
        if (eventsToNotify.length > 0) {
          for (const event of eventsToNotify) {
            const { repeat, repeat_number, lastNotificationSentAt } = event.notificationSettings;
            let shouldNotify = false;

            if (!lastNotificationSentAt) {
              shouldNotify = true;
            } else {
              switch (repeat) {
                case 'minute':
                  if (differenceInMinutes(currentTime, lastNotificationSentAt) >= repeat_number) shouldNotify = true;
                  break;
                case 'hour':
                  if (differenceInHours(currentTime, lastNotificationSentAt) >= repeat_number) shouldNotify = true;
                  break;
                case 'day':
                  if (differenceInDays(currentTime, lastNotificationSentAt) >= repeat_number) shouldNotify = true;
                  break;
              }
            }

            if (shouldNotify) {
              await Notifica.create({ /* ... */ });
              if (repeat === 'none') {
                event.notificationSettings.processed = true;
              } else {
                event.notificationSettings.lastNotificationSentAt = currentTime;
              }
              await event.save();
            }
          }
        }
        await computeLevel(user._id, currentTime);
        
      }

      console.log(`\n✅ Controlli completati per ${allUsers.length} utenti.`);

    } catch (error) {
      console.error('💥 Errore durante l\'esecuzione dello scheduler:', error);
    }
  });
}
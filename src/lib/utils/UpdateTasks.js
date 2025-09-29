import { Task } from "$lib/models/Task.js";
// NUOVO: Importiamo il modello Notifica per poterlo usare
import { Notifica } from "$lib/models/Notification.js"; 

const urgencyOrder = {
  'Nessuna': 0,
  'Imminente': 1,
  'Oggi': 2,
  'Scaduta': 3
};

export async function computeLevel(userID, now) {
  const tasks = await Task.find({
    userId: userID,
    status: 'todo'
  });

  if (!tasks || tasks.length === 0) {
    return;
  }

  for (const task of tasks) {
    const deadline = new Date(task.deadline);
    let currentLevel = 'Nessuna';
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      currentLevel = 'Scaduta';
    } else if (hoursUntilDeadline < 24) {
      currentLevel = 'Oggi';
    } else if (hoursUntilDeadline < 72) {
      currentLevel = 'Imminente';
    }

    // Se il livello di urgenza è aumentato...
    if (urgencyOrder[currentLevel] > urgencyOrder[task.lastNotificationLevel]) {
       
       // 1. Aggiorniamo il livello sull'attività stessa
       await task.updateOne({ lastNotificationLevel: currentLevel });
       
       // 2. NUOVO: Creiamo una notifica per l'utente
       console.log(`🔔 Creazione notifica per l'attività "${task.title}"...`);
       await Notifica.create({
          destinatario: userID,
          mittente: null, // Notifica di sistema
          tipo: 'ATTIVITA', // Usiamo il tipo corretto per le attività
          riferimento: task._id // Colleghiamo la notifica all'attività specifica
       });
       
       console.log(`✅ Notifica creata.`);
    }
  }
}
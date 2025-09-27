import { Task } from "$lib/models/Task";
import { fail, error } from "@sveltejs/kit";

// Definiamo un ordine di importanza per i livelli di notifica.
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
  })
  console.log(`Computing levels for user ${userID} at time ${now}`);
  if (!tasks || tasks.length === 0) {
    return [];
  }
  for (const task of tasks) {
    const deadline = new Date(task.deadline);
    let currentLevel = 'Nessuna';

    // 2. Determina il livello di urgenza attuale in base alla data.
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      currentLevel = 'Scaduta';
    } else if (hoursUntilDeadline < 24) {
      currentLevel = 'Oggi';
    } else if (hoursUntilDeadline < 72) { // Meno di 3 giorni
      currentLevel = 'Imminente';
    }
    if (urgencyOrder[currentLevel] > urgencyOrder[task.lastNotificationLevel]) {
      try { await task.findByIdAndUpdate(task._id, { lastNotificationLevel: currentLevel }) }
      catch { console.error(`Errore durante l'aggiornamento dell'attività ${task._id}:`, error) }
    }

    console.log(`attività ${task.title} con prec ${task.lastNotificationLevel} aggiornato a ${currentLevel}`)
  }
}

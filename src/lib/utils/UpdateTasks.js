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
  console.log(`noi puffi siamo in computeLevel`);
  console.log(`computeLevel per utente ${userID} alla data ${now}`);
  const tasks = await Task.find({
    userId: userID,
    status: 'todo'
  })
  if (!tasks || tasks.length === 0) {
    return [];
  }
  console.log(`lo zio pera di taks: ${tasks}`);
  for (const task of tasks) {
    console.log(`Controllo attività: ${task}, `);
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
    console.log(`Livello attuale per l'attività ${task}: ${currentLevel}`);
    if (urgencyOrder[currentLevel] > urgencyOrder[task.lastNotificationLevel]) {
       console.log('si awaita, per modificare il current'); 
        const msg = await task.updateOne({ lastNotificationLevel: currentLevel });
       if (msg) {
        console.log(msg);
      }
    }

    console.log(`attività ${task.title} con prec ${task.lastNotificationLevel} aggiornato a ${currentLevel}`)
  }
}

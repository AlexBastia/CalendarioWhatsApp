import { Task } from "$lib/models/Task.js";
// NUOVO: Importiamo il modello Notifica per poterlo usare
import { Notifica } from "$lib/models/Notification.js"; 

const urgencyOrder = {
  'Nessuna': 0,
  'Imminente': 1,
  'Oggi': 2,
  'Scaduta': 3
};

/*
lastNotificationLevel: {
    type: String,
    enum: ['Nessuna', 'Imminente', 'Oggi', 'Scaduta'],
    default: 'Nessuna'
  },
*/

export async function computeLevel(userId, now) {
  // 1. Log iniziale: conferma l'avvio della funzione e con quali dati
  console.log(`\n--- 🔹 Inizio computeLevel per utente: ${userId} ---`);
  console.log(`      🕒 Tempo di riferimento: ${now.toLocaleString('it-IT')}`);

  const tasks = await Task.find({
    userId,
    status: 'todo'
  }).lean(); // Aggiungiamo .lean() per performance, dato che modifichiamo con updateOne

  if (!tasks || tasks.length === 0) {
    console.log("      -> 🤷 Nessuna attività 'todo' trovata per questo utente.");
    return;
  }
  
  // 2. Log del numero di attività trovate
  console.log(`      -> 📂 Trovate ${tasks.length} attività da controllare.`);

  for (const task of tasks) {
    // 3. Log per ogni attività che viene analizzata
    console.log(`\n       scrutinando attività: "${task.title}" (ID: ${task._id})`);
    
    const deadline = new Date(task.deadline);
    let currentLevel = 'Nessuna';
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Calcolo del livello di urgenza
    if (hoursUntilDeadline < 0) {
      currentLevel = 'Scaduta';
    } else if (hoursUntilDeadline < 24) {
      currentLevel = 'Oggi';
    } else if (hoursUntilDeadline < 72) {
      currentLevel = 'Imminente';
    }

    // 4. Log che mostra il confronto dei livelli di urgenza
    console.log(`         Livello Precedente: ${task.lastNotificationLevel} (${urgencyOrder[task.lastNotificationLevel] || 0})`);
    console.log(`         Livello Attuale:    ${currentLevel} (${urgencyOrder[currentLevel]})`);

    // Se il livello di urgenza è aumentato...
    if (urgencyOrder[currentLevel] > (urgencyOrder[task.lastNotificationLevel] || 0)) {
       console.log(`         📈 L'urgenza è aumentata! Procedo con l'aggiornamento e la notifica.`);
       
       // Aggiorniamo il livello sull'attività stessa
       await Task.updateOne({ _id: task._id }, { $set: { lastNotificationLevel: currentLevel } });
       
       // Creiamo una notifica per l'utente
       await Notifica.create({
          destinatario: userId,
          mittente: null, // Notifica di sistema
          tipo: 'ATTIVITA',
          riferimento: task._id
       });
       
       // 5. Log di successo per la creazione della notifica
       console.log(`         ✅ Notifica creata e livello attività aggiornato a "${currentLevel}".`);
    } else {
        // 6. Log che indica che non è necessaria alcuna azione
        console.log(`         ->  शांत Nessuna azione richiesta.`);
    }
  }
}

// src/lib/utils/notifications.js

import {Tasks } from '$lib/models/Task'

const defaultIcon = "🔥";

const presetUrgenza = {

	attivitaImminente: {
		title: '⏰ Scadenza in avvicinamento',
		options: {
			body: 'Un\'attività sta per scadere. Non dimenticartene!',
			icon: defaultIcon,
			vibrate: [100, 50, 100] // Vibrazione leggera
		}
	},

	attivitaOggi: {
		title: '🔥 Scadenza Oggi!',
		options: {
			body: 'Hai un\'attività che scade oggi. È ora di completarla!',
			icon: defaultIcon,
			vibrate: [200, 100, 200] // Vibrazione più decisa
		}
	},

	attivitaScaduta: {
		title: '🚨 ATTIVITÀ SCADUTA 🚨',
		options: {
			body: 'Questa attività è in ritardo! Completala il prima possibile.',
			icon: defaultIcon,
			vibrate: [500, 100, 500] // Vibrazione lunga e insistente
		}
	}
}

export const presetsPomodoro = {
    fineStudio: {
        title: "⏰ Fine studio",
        options: {
            body: "Inizia la pausa. Ottimo lavoro!",
            icon: '/favicon.png',
            requireInteraction: true
        }
    },
    finePausa: {
        title: "▶️ Fine pausa",
        options: {
            body: 'È ora di tornare a studiare.',
            icon: '/favicon.png',
        }
    },
    sessionEnd: {
        title: "🎉 Sessione Completata!",
        options: {
            body: "Complimenti, hai completato tutti i cicli!",
            icon: '/favicon.png',
            requireInteraction: true
        }
    }
};

export async function getNotificationForTsks(userID){
    const tasks = await Tasks.find({ userId: userID, status: 'todo' }).lean();
    const notifiche = [];

    tasks.forEach(task => {
        switch (task.lastNotificationLevel) {
            case 'Imminente':
                notifiche.push(mostraNotifica(
                    attivitaImminente.title,
                    attivitaImminente.options
                ));
                break;

            case 'Oggi':
                notifiche.push(mostraNotifica(
                    attivitaOggi.title,
                    attivitaOggi.options
                ));
                break;

            case 'Scaduta':
                notifiche.push(mostraNotifica(
                    attivitaScaduta.title,
                    attivitaScaduta.options
                ));
                break;
        }
    });

    return notifiche; // array di Notification (o undefined se permesso negato)
}

export async function initNotifiche() {
    if (Notification.permission === "granted") {
        return true; 
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log('Permesso per le notifiche concesso.');
            return true;
        }
    }
    
    console.log('Permesso per le notifiche non concesso.');
    return false;
}

// Invariata: questa funzione era già corretta
export function mostraNotifica(title, options = {}) {
    if (Notification.permission !== 'granted') {
        console.log('Impossibile mostrare la notifica: permesso non concesso.');
        return;
    }

    const defaultOption = {
        body: '',
        icon: '/favicon.png',
        silent: false,
        requireInteraction: false,
    };

    const finalOption = { ...defaultOption, ...options };
    const notifica = new Notification(title, finalOption);

    return notifica;
}
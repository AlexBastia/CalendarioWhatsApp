// src/lib/utils/notifications.js

import { Task } from '$lib/models/Task'

const defaultIcon = "🔥";

const presetUrgenza = {
    attivitaImminente: {
        title: '⏰ Scadenza in avvicinamento',
        options: {
            body: 'Un\'attività sta per scadere. Non dimenticartene!',
            icon: defaultIcon,
            vibrate: [100, 50, 100]
        }
    },

    attivitaOggi: {
        title: '🔥 Scadenza Oggi!',
        options: {
            body: 'Hai un\'attività che scade oggi. È ora di completarla!',
            icon: defaultIcon,
            vibrate: [200, 100, 200]
        }
    },

    attivitaScaduta: {
        title: '🚨 ATTIVITÀ SCADUTA 🚨',
        options: {
            body: 'Questa attività è in ritardo! Completala il prima possibile.',
            icon: defaultIcon,
            vibrate: [500, 100, 500]
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

export async function getNotificationDataForTasks(userID) {
    const tasks = await Task.find({ userId: userID, status: 'todo' }).lean();
    console.log(`Found ${tasks.length} tasks for user ${userID}`);
    
    const notificationData = [];

    tasks.forEach(task => {
        let notificationConfig = null;
        
        switch (task.lastNotificationLevel) {
            case 'Imminente':
                notificationConfig = presetUrgenza.attivitaImminente;
                break;
            case 'Oggi':
                notificationConfig = presetUrgenza.attivitaOggi;
                break;
            case 'Scaduta':
                notificationConfig = presetUrgenza.attivitaScaduta;
                break;
        }

        if (notificationConfig) {
            notificationData.push({
                taskId: task._id.toString(),
                title: notificationConfig.title,
                options: notificationConfig.options,
                level: task.lastNotificationLevel
            });
        }
    });

    console.log(`Prepared ${notificationData.length} notifications for user ${userID}`);
    return notificationData;
}

export async function initNotifiche() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
        console.log('Not in browser environment, skipping notification init');
        return false;
    }

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

export function mostraNotifica(title, options = {}) {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
        console.log('Cannot show notification: not in browser environment');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.log('Impossibile mostrare la notifica: permesso non concesso.');
        return null;
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

export function showNotificationsFromData(notificationData) {
    if (typeof window === 'undefined') {
        console.log('Cannot show notifications: not in browser environment');
        return [];
    }

    const notifications = [];
    notificationData.forEach(data => {
        const notification = mostraNotifica(data.title, data.options);
        if (notification) {
            notifications.push(notification);
        }
    });
    
    return notifications;
}
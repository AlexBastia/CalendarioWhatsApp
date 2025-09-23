// src/lib/utils/notifications.js

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

// CORRETTA: La funzione è ora async e gestisce i permessi
export async function initNotifiche() {
    if (Notification.permission === "granted") {
        return true; // L'ute<nte ha già dato il permesso
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
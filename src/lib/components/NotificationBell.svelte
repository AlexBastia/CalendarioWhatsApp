<script>
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { initNotifiche, mostraNotifica } from '$lib/utils/notification';

    // --- STATO AUTONOMO ---
    let notifications = $state([]);
    let unreadCount = $state(0);
    let previousNotificationIds = $state(new Set()); // Traccia le notifiche già viste
    let notificationsInitialized = $state(false);

    // --- LOGICA DI POLLING ---
    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                console.error('Errore nel polling delle notifiche:', response.statusText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                // Rileva le nuove notifiche confrontando con quelle precedenti
                const currentIds = new Set(data.notifications.map(n => n._id));
                
                // Se non è il primo caricamento, controlla le nuove notifiche
                if (notificationsInitialized) {
                    const newNotifications = data.notifications.filter(
                        n => !previousNotificationIds.has(n._id)
                    );
                    
                    // Mostra notifica browser per ogni nuova notifica
                    newNotifications.forEach(notification => {
                        showBrowserNotification(notification);
                    });
                }
                
                // Aggiorna lo stato
                notifications = data.notifications;
                unreadCount = data.unreadCount;
                previousNotificationIds = currentIds;
                notificationsInitialized = true;
            }
        } catch (error) {
            console.error('Errore fetch notifiche:', error);
        }
    }

    // Funzione per mostrare notifica browser in base al tipo
    function showBrowserNotification(notification) {
        let title = '';
        let body = '';
        let icon = '🔔';

        switch (notification.tipo) {
            case 'CONDIVISIONE_POMODORO':
                title = '🍅 Invito Sessione Pomodoro';
                body = `${notification.mittente?.email || 'Un utente'} ti ha invitato a una sessione di studio.`;
                break;
            
            case 'EVENTO':
                title = '📅 Promemoria Evento';
                body = notification.evento?.title || 'Hai un evento in programma';
                if (notification.evento?.start) {
                    const eventDate = new Date(notification.evento.start).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    body += ` - ${eventDate}`;
                }
                break;
            
            case 'NUOVA_ATTIVITA':
                title = '📝 Nuova Attività Assegnata';
                body = notification.body || 'Ti è stata assegnata una nuova attività.';
                break;
            
            default:
                title = 'Nuova Notifica';
                body = notification.body || 'Hai ricevuto una nuova notifica.';
        }

        mostraNotifica(title, {
            body: body,
            icon: '/favicon.png',
            requireInteraction: false,
            vibrate: [200, 100, 200]
        });
    }

    // Funzione per segnare una notifica come letta e navigare
    async function handleNotificationClick(notification) {
        await fetch(`/api/notifications/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notification._id })
        });
        
        notifications = notifications.filter(n => n._id !== notification._id);
        unreadCount--;

        if (notification.tipo === 'EVENTO') {
            goto(`/calendario/event/${notification.riferimento}`);
        }
    }

    // Avvia il polling quando il componente viene montato
    onMount(async () => {
        // Inizializza le notifiche browser
        await initNotifiche();
        
        // Primo fetch (non mostrerà notifiche browser)
        await fetchNotifications();
        
        // Polling ogni 30 secondi
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    });
</script>

<div>
    <div class="dropdown">
        <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-bell-fill"></i>
            {#if unreadCount > 0}
                <span class="badge bg-danger rounded-pill ms-1 position-absolute top-0 start-100 translate-middle" style="font-size: 0.6em;">
                    {unreadCount}
                </span>
            {/if}
        </button>

        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="min-width: 320px;">
            <li class="px-3 py-2">
                <h6 class="mb-0">Centro Notifiche</h6>
            </li>
            <li><hr class="dropdown-divider"></li>

            {#if notifications.length === 0}
                <li><span class="dropdown-item-text text-center text-muted">Nessuna nuova notifica</span></li>
            {:else}
                {#each notifications as notification}
                    <li>
                        {#if notification.tipo === 'CONDIVISIONE_POMODORO'}
                            <div class="px-3 py-2 border-bottom">
                                <strong class="d-block mb-1">🍅 Invito Sessione Pomodoro</strong>
                                <p class="small text-muted mb-2">
                                    {notification.mittente?.email || 'Un utente'} ti ha invitato a una sessione di studio.
                                </p>
                                <div class="d-flex gap-2">
                                    <form method="POST" action="?/acceptPomodoro" use:enhance={() => async ({ result }) => {
                                        if (result.type === 'success') {
                                            console.log('successo!'); 
                                            await fetchNotifications();
                                        }
                                    }}>
                                        <input type="hidden" name="notificationId" value={notification._id} />
                                        <input type="hidden" name="pomodoroId" value={notification.riferimento} />
                                        <button type="submit" class="btn btn-sm btn-success">Accetta</button>
                                    </form>
                                    <form method="POST" action="?/declineNotification" use:enhance={() => async ({ result }) => {
                                        if (result.type === 'success') await fetchNotifications();
                                    }}>
                                        <input type="hidden" name="notificationId" value={notification._id} />
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">Rifiuta</button>
                                    </form>
                                </div>
                            </div>
                        {:else if notification.tipo === 'EVENTO'}
                            <a href="#!" onclick={(e) => {e.preventDefault(); handleNotificationClick(notification)}} class="dropdown-item d-block">
                                <strong class="d-block mb-1">📅 Promemoria Evento</strong>
                                <p class="fw-semibold mb-1 text-dark">
                                    {notification.evento?.title || 'Evento senza titolo'}
                                </p>
                                <p class="small text-muted mb-0">
                                    {#if notification.evento?.start}
                                        {new Date(notification.evento.start).toLocaleDateString('it-IT', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    {:else}
                                        Un evento programmato sta per iniziare.
                                    {/if}
                                </p>
                            </a>
                        {:else if notification.tipo === 'NUOVA_ATTIVITA'}
                            <a href="#!" onclick={(e) => {e.preventDefault(); handleNotificationClick(notification)}} class="dropdown-item d-block">
                                <strong class="d-block mb-1">📝 Nuova Attività Assegnata</strong>
                                <p class="small text-muted mb-0">{notification.body || 'Ti è stata assegnata una nuova attività.'}</p>
                            </a>
                        {/if}
                    </li>
                {/each}
            {/if}
        </ul>
    </div>
</div>

<style>
    .dropdown-toggle::after {
        display: none;
    }
    .dropdown-menu {
        max-height: 400px;
        overflow-y: auto;
    }
    .dropdown-item {
        white-space: normal;
    }
</style>
<script>
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    // --- STATO AUTONOMO ---
    let notifications = $state([]);
    let unreadCount = $state(0);
    let previousUnreadCount = $state(0); // Per rilevare nuove notifiche
    let isFirstLoad = $state(true); // Per evitare notifica al primo caricamento

    // --- LOGICA DI POLLING ---
    // Funzione per recuperare le notifiche dall'API
    async function fetchNotifications() {
        try {
            console.log('Fetching notifications...');
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                console.error('Errore nel polling delle notifiche:', response.statusText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                // Salva il conteggio precedente prima di aggiornare
                previousUnreadCount = unreadCount;
                
                // Aggiorna le notifiche
                notifications = data.notifications;
                unreadCount = data.unreadCount;

                // Rileva se ci sono nuove notifiche (solo dopo il primo caricamento)
                if (!isFirstLoad && unreadCount > previousUnreadCount) {
                    const newNotificationsCount = unreadCount - previousUnreadCount;
                    console.log(`🔔 ${newNotificationsCount} nuove notifiche!`);
                    showNewNotificationFeedback();
                }

                // Dopo il primo caricamento, imposta isFirstLoad a false
                if (isFirstLoad) {
                    isFirstLoad = false;
                }
            }
        } catch (error) {
            console.error('Errore fetch notifiche:', error);
        }
    }

    // Funzione per mostrare feedback quando arriva una nuova notifica
    function showNewNotificationFeedback() {
        // 1. Animazione shake del campanello
        const bellButton = document.querySelector('.notification-bell-btn');
        if (bellButton) {
            bellButton.classList.add('shake');
            setTimeout(() => bellButton.classList.remove('shake'), 1000);
        }

        showBrowserNotification();
    }


    // Mostra notifica del browser
    function showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Prendi la prima notifica non letta per mostrare il dettaglio
            const latestNotification = notifications.find(n => !n.letta);
            
            let title = 'Nuova notifica';
            let body = 'Hai ricevuto una nuova notifica';
            let icon = '/favicon.png';

            if (latestNotification) {
                if (latestNotification.tipo === 'EVENTO') {
                    title = '📅 Promemoria Evento';
                    body = latestNotification.evento?.title || 'Un evento sta per iniziare';
                } else if (latestNotification.tipo === 'ATTIVITA') {
                    title = '📝 Promemoria Attività';
                    body = latestNotification.task?.title || 'Hai un\'attività in scadenza';
                } else if (latestNotification.tipo === 'CONDIVISIONE_POMODORO') {
                    title = '🍅 Invito Pomodoro';
                    body = `${latestNotification.mittente?.email || 'Un utente'} ti ha invitato`;
                }
            }

            const notification = new Notification(title, {
                body: body,
                icon: icon,
                tag: 'studyflow-notification', // Evita duplicati
                requireInteraction: false, // La notifica si chiude automaticamente
            });

            // Chiudi la notifica dopo 5 secondi
            setTimeout(() => notification.close(), 5000);

            // Gestisci il click sulla notifica
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        }
    }

    // Richiedi permesso per le notifiche del browser
    async function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                console.log('Notification permission:', permission);
            } catch (e) {
                console.log('Error requesting notification permission:', e);
            }
        }
    }

    // Funzione per segnare una notifica come letta e navigare
    async function handleNotificationClick(notification) {
        try {
            // Segna la notifica come letta sul server
            const response = await fetch(`/api/notifications/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: notification._id })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Rimuovi la notifica dall'UI e aggiorna il contatore
                notifications = notifications.filter(n => n._id !== notification._id);
                unreadCount = result.unreadCount;
                previousUnreadCount = unreadCount;
            } else {
                console.error('Errore nel segnare come letta:', result.error);
            }
        } catch (error) {
            console.error('Errore nella gestione del click:', error);
        }

        // Naviga alla pagina di riferimento
        if (notification.tipo === 'EVENTO') {
            goto(`/calendario/event/${notification.riferimento}`);
        } else if (notification.tipo === 'ATTIVITA') {
            goto(`/tasks/${notification.riferimento}`);
        }
    }

    // Funzione per segnare tutte le notifiche come lette
    async function markAllAsRead() {
        try {
            const response = await fetch(`/api/notifications/mark-read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                notifications = [];
                unreadCount = 0;
                previousUnreadCount = 0;
            } else {
                console.error('Errore nel segnare tutte come lette:', result.error);
            }
        } catch (error) {
            console.error('Errore nel mark all as read:', error);
        }
    }

    // Avvia il polling quando il componente viene montato
    onMount(() => {
        fetchNotifications();
        requestNotificationPermission(); // Chiedi il permesso all'utente
        
        const interval = setInterval(fetchNotifications, 30000); // Controlla ogni 30 secondi
        
        return () => clearInterval(interval); // Pulisce l'intervallo alla distruzione
    });
</script>

<div>
    <div class="dropdown">
        <button 
            class="btn btn-light dropdown-toggle notification-bell-btn position-relative" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
        >
            <i class="bi bi-bell-fill"></i>
            {#if unreadCount > 0}
                <span class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            {/if}
        </button>

        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="min-width: 320px;">
            <li class="px-3 py-2 d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Centro Notifiche</h6>
                {#if notifications.length > 0}
                    <button 
                        class="btn btn-sm btn-outline-secondary"
                        onclick={markAllAsRead}
                        title="Segna tutte come lette"
                    >
                        <i class="bi bi-check2-all"></i>
                    </button>
                {/if}
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
                                        if (result.type === 'success') await fetchNotifications();
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
                            <a 
                                href="#!" 
                                onclick={(e) => {e.preventDefault(); handleNotificationClick(notification)}} 
                                class="dropdown-item d-block notification-item"
                            >
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
                        {:else if notification.tipo === 'ATTIVITA'}
                            <a 
                                href="#!" 
                                onclick={(e) => {e.preventDefault(); handleNotificationClick(notification)}} 
                                class="dropdown-item d-block notification-item"
                            >
                                <strong class="d-block mb-1">📝 Promemoria Attività</strong>
                                <p class="fw-semibold mb-1 text-dark">
                                    {notification.task?.title || 'Attività'}
                                </p>
                                <p class="small text-muted mb-0">
                                    {#if notification.task?.lastNotificationLevel}
                                        Scadenza: {notification.task.lastNotificationLevel}
                                    {:else}
                                        Hai un'attività in scadenza
                                    {/if}
                                </p>
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

    .notification-badge {
        font-size: 0.65em;
        min-width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
    }

    .notification-item {
        transition: background-color 0.2s ease;
        cursor: pointer;
    }

    .notification-item:hover {
        background-color: #f8f9fa;
    }

    /* Animazione shake per il campanello quando arriva una nuova notifica */
    @keyframes shake {
        0%, 100% { transform: rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: rotate(-15deg); }
        20%, 40%, 60%, 80% { transform: rotate(15deg); }
    }

    .notification-bell-btn.shake {
        animation: shake 0.8s ease-in-out;
    }

    /* Animazione pulse per il badge */
    @keyframes pulse {
        0%, 100% {
            transform: translate(50%, -50%) scale(1);
        }
        50% {
            transform: translate(50%, -50%) scale(1.15);
        }
    }

    .notification-badge {
        animation: pulse 2s infinite ease-in-out;
    }

    /* Stile per il badge più visibile */
    .notification-badge {
        box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
        animation: pulse-ring 2s infinite;
    }

    @keyframes pulse-ring {
        0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
        }
        50% {
            box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
        }
    }
</style>
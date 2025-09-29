<script>
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    // --- STATO AUTONOMO ---
    // Il componente non riceve più props. Inizializza il suo stato internamente.
    let notifications = $state([]);
    let unreadCount = $state(0);

    // --- LOGICA DI POLLING ---
    // Funzione per recuperare le notifiche dall'API
    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                console.error('Errore nel polling delle notifiche:', response.statusText);
                return;
            }
            const data = await response.json();
            if (data.success) {
                notifications = data.notifications;
                unreadCount = data.unreadCount;
            }
        } catch (error) {
            console.error('Errore fetch notifiche:', error);
        }
    }

    // Funzione per segnare una notifica come letta e navigare
    async function handleNotificationClick(notification) {
        // Segna la notifica come letta sul server
        await fetch(`/api/notifications/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notification._id })
        });
        
        // Rimuovi la notifica dall'UI immediatamente per reattività
        notifications = notifications.filter(n => n._id !== notification._id);
        unreadCount--;

        // Naviga alla pagina di riferimento
        if (notification.tipo === 'EVENTO') {
            goto(`/calendario/event/${notification.riferimento}`);
        }
        // Aggiungi altre logiche di navigazione per altri tipi se necessario
    }

    // Avvia il polling quando il componente viene montato
    onMount(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Controlla ogni 30 secondi
        return () => clearInterval(interval); // Pulisce l'intervallo alla distruzione
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
                            <a href="#!" on:click|preventDefault={() => handleNotificationClick(notification)} class="dropdown-item d-block">
                                <strong class="d-block mb-1">📅 Promemoria Evento</strong>
                                <p class="small text-muted mb-0">{notification.body || 'Un evento programmato sta per iniziare.'}</p>
                            </a>
                        {:else if notification.tipo === 'NUOVA_ATTIVITA'}
                            <a href="#!" on:click|preventDefault={() => handleNotificationClick(notification)} class="dropdown-item d-block">
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
        display: none; /* Nasconde la freccetta di default di Bootstrap */
    }
    .dropdown-menu {
        max-height: 400px;
        overflow-y: auto;
    }
    .dropdown-item {
        white-space: normal; /* Permette al testo di andare a capo */
    }
</style>
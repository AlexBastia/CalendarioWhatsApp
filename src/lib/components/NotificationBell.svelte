<script>
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';

    // I dati (incluse le notifiche) arrivano dal +layout.server.js
    // getting props
    let { data } = $props();
    console.log('NotificationBell props:', data);

    // Estrai le notifiche per Pomodoro dai data
    let notificationForPom = $state(data.notificationForPom || []);
    
    // Per il futuro: notificationTasks (al momento è una Promise pending)
    // let notificationTasks = data.notificationTasks;
</script>

<div>
    <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            🔔 Notifiche 
            {#if notificationForPom.length > 0}
                <span class="badge bg-danger rounded-pill ms-1">{notificationForPom.length}</span>
            {/if}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown" style="min-width: 300px;">
            {#if notificationForPom.length === 0}
                <li><span class="dropdown-item-text text-muted">Nessuna notifica</span></li>
            {:else}
                {#each notificationForPom as notification}
                    <li class="p-3 border-bottom">
                        {#if notification.tipo === 'CONDIVISIONE_POMODORO'}
                            <div class="notification-item">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="badge bg-primary me-2">🍅</span>
                                    <strong class="text-dark">Condivisione Pomodoro</strong>
                                </div>
                                <p class="mb-2 text-muted small">
                                    Un utente ha condiviso un Pomodoro con te.
                                </p>
                                <div class="d-flex gap-2">
                                    <form method="POST" action="?/acceptPomodoro" class="d-inline-block" use:enhance={
                                            ()=>{return async ({ result, update }) => {
                                            if (result.type === 'success') {
                                                // Rimuovi la notifica accettata dalla lista
                                                notificationForPom = notificationForPom.filter(n => n._id !== notification._id);
                                                // Eventualmente aggiorna altre parti dell'interfaccia
                                                await update();
                                            }
                                        }}}>
                                        <input type="hidden" name="notificationId" value={notification._id} />
                                        <input type="hidden" name="pomodoroId" value={notification.riferimento} />
                                        <button type="submit" class="btn btn-sm btn-success">
                                            ✅ Accetta
                                        </button>
                                    </form>
                                    <form method="POST" action="?/declineNotification" use:enhance={
                                            ()=>{return async ({ result, update }) => {
                                            if (result.type === 'success') {
                                                // Rimuovi la notifica rifiutata dalla lista
                                                notificationForPom = notificationForPom.filter(n => n._id !== notification._id);
                                                // Eventualmente aggiorna altre parti dell'interfaccia
                                                await update();
                                            }
                                        }}} class="d-inline-block">
                                        <input type="hidden" name="notificationId" value={notification._id} />
                                        <button type="submit" class="btn btn-sm btn-outline-secondary">
                                            ❌ Rifiuta
                                        </button>
                                    </form>
                                </div>
                                <small class="text-muted d-block mt-2">
                                    {new Date(notification.createdAt).toLocaleString('it-IT')}
                                </small>
                            </div>
                        {:else if notification.tipo === 'INVITO_EVENTO'}
                            <div class="notification-item">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="badge bg-info me-2">📅</span>
                                    <strong class="text-dark">Invito Evento</strong>
                                </div>
                                <p class="mb-0 text-muted">Sei stato invitato a un evento.</p>
                                <small class="text-muted">
                                    {new Date(notification.createdAt).toLocaleString('it-IT')}
                                </small>
                            </div>
                        {:else if notification.tipo === 'NUOVA_ATTIVITA'}
                            <div class="notification-item">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="badge bg-warning me-2">📝</span>
                                    <strong class="text-dark">Nuova Attività</strong>
                                </div>
                                <p class="mb-0 text-muted">Una nuova attività è stata aggiunta.</p>
                                <small class="text-muted">
                                    {new Date(notification.createdAt).toLocaleString('it-IT')}
                                </small>
                            </div>
                        {:else}
                            <div class="notification-item">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="badge bg-secondary me-2">ℹ️</span>
                                    <strong class="text-dark">Notifica</strong>
                                </div>
                                <p class="mb-0 text-muted">Tipo: {notification.tipo}</p>
                                <small class="text-muted">
                                    {new Date(notification.createdAt).toLocaleString('it-IT')}
                                </small>
                            </div>
                        {/if}
                    </li>
                {/each}
            {/if}
        </ul>
    </div>
</div>

<style>
    .notification-item {
        max-width: 280px;
    }
    
    .dropdown-menu {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .badge {
        font-size: 0.75em;
    }
</style>
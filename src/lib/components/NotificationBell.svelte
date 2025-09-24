<script>
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';

    // I dati (incluse le notifiche) arrivano dal +layout.server.js
    let notifications = $derived($page.data.unreadNotifications || []);
</script>

<div>
    <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        Notifiche {#if notifications.length > 0}({notifications.length}){/if}
    </button>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
        {#if notifications.length === 0}
            <li><span class="dropdown-item-text">Nessuna notifica</span></li>
        {:else}
            {#each notifications as notification}
                <li class="p-2">
                    {#if notification.tipo === 'CONDIVISIONE_POMODORO'}
                        <div>
                            <span>Un utente ha condiviso un Pomodoro.</span>
                            <div class="mt-2">
                                <form method="POST" action="?/acceptPomodoro" class="d-inline-block" use:enhance={
                                        ()=>{return async ({ result, update }) => {
                                        if (result.type === 'success') {
                                            // Rimuovi la notifica accettata dalla lista
                                            notifications = notifications.filter(n => n.id !== notification._id);
                                            // Eventualmente aggiorna altre parti dell'interfaccia
                                            await update();
                                        }}
                                    }}>
                                    <input type="hidden" name="notificationId" value={notification._id} />
                                    <input type="hidden" name="pomodoroId" value={notification.riferimento} />
                                    <button type="submit" class="btn btn-sm btn-primary me-2">Accetta</button>
                                </form>
                                <form method="POST" action="?/declineNotification" use:enhance={
                                        ()=>{return async ({ result, update }) => {
                                        if (result.type === 'success') {
                                            // Rimuovi la notifica accettata dalla lista
                                            notifications = notifications.filter(n => n.id !== notification._id);
                                            // Eventualmente aggiorna altre parti dell'interfaccia
                                            await update();
                                        }}
                                    }} class="d-inline-block">
                                    <input type="hidden" name="notificationId" value={notification._id} />
                                    <button type="submit" class="btn btn-sm btn-secondary">Rifiuta</button>
                                </form>
                            </div>
                        </div>
                    {:else if notification.tipo === 'INVITO_EVENTO'}
                        <span>Sei stato invitato a un evento.</span>
                    {:else if notification.tipo === 'NUOVA_ATTIVITA'}
                        <span>Una nuova attività è stata aggiunta.</span>
                    {/if}
                </li>
            {/each}
        {/if}
    </ul>
</div>
</div>
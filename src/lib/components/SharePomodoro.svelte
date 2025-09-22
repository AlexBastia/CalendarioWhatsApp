<script>
    import { enhance } from '$app/forms';
    import Modal from '$lib/components/Modal.svelte';

    export let pomodoro; // Riceviamo l'intero oggetto pomodoro
    export let form;
    let modalComponent; // 1. Aggiungiamo una variabile per "catturare" l'istanza del Modal
    
    // 2. Esponiamo una funzione `show` che chiama quella del figlio
    export function show() {
        modalComponent?.show();
    }
    
    // È buona norma esporre anche hide()
    export function hide() {
        modalComponent?.hide();
    }
</script>

<Modal id="sharePomodoroModal" title="Condividi Pomodoro" bind:this={modalComponent}>
    <form class="mb-3" method="POST" action="?/addUser" use:enhance>
        <div class="input-group">
            <input type="email" name="email" placeholder="Email utente" class="form-control" required />
            <button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
        </div>
        {#if form?.action === 'addUser' && form?.message}
             <div class="alert alert-{form.error ? 'danger' : 'success'} mt-2 p-1 text-center">{form.message}</div>
        {/if}
    </form>

    <p>Condiviso con:</p>
    <div class="list-group list-group-flush">
        {#if pomodoro.sharedUsers.length === 0}
            <p class="text-muted">Nessuno. Condividi questo pomodoro con qualcuno!</p>
        {/if}
        {#each pomodoro.sharedUsers as user (user._id)}
            <form
                method="POST"
                action="?/removeUser"
                class="list-group-item d-flex justify-content-between align-items-center p-1"
                use:enhance
            >
                <input type="hidden" name="userId" value={user._id} />
                <span>{user.email}</span>
                <button type="submit" class="btn text-danger btn-sm" aria-label="remove user">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
            </form>
        {/each}
    </div>

    <div slot="footer">
        <button type="button" data-bs-dismiss="modal" class="btn btn-primary">Fatto</button>
    </div>

</Modal>
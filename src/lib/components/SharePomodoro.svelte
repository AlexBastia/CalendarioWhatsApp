<script>
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import { timingStore } from '$lib/stores/timing.js';

	const { pomodoro, form } = $props();
	let modalComponent;
	let notificheInviate = $state([]); // lista locale di email inviate in questa sessione
	let messages = $state([]); // opzionale array di messaggi toast/debug

	export function show() {
		modalComponent?.show();
	}
	export function hide() {
		modalComponent?.hide();
	}

	// factory per use:enhance sul form di addUser
	function onEnhanceAdd(formEl) {
		return async ({ result, update }) => {
			console.log('addUser result', result);
			if (result.type === 'success') {
				const data = result.data ?? {};
				// server ritorna { success, message, notifica, email, userId }
				if (data.email && !notificheInviate.includes(data.email)) {
					notificheInviate = [...notificheInviate, data.email];
				}
				// push message per debug / toast
				messages = [...messages, data.message ?? 'Invio OK'];
				// aggiorna lo stato del form (opzionale)
				update();
			} else if (result.type === 'failure') {
				// result.data contiene gli errori ritornati dall'action
				messages = [...messages, result.data?.message ?? 'Errore'];
			}
		};
	}

	// factory per use:enhance sul form di removeUser (elimina notifica)
	function onEnhanceRemove(formEl) {
		return async ({ result, update }) => {
			console.log('removeUser result', result);
			if (result.type === 'success') {
				const data = result.data ?? {};
				// server ritorna { notificaId, success, message }
				if (data.notificaId) {
					// rimuovi eventuale email corrispondente in notificheInviate
					// (se vuoi correlare email↔notifica, server dovrebbe restituire email)
					// qui rimuoviamo usando notificaId solo nella lista di debug messages
					messages = [...messages, data.message ?? 'Notifica rimossa'];
				}
				update();
			} else if (result.type === 'failure') {
				messages = [...messages, result.data?.message ?? 'Errore'];
			}
		};
	}
</script>

<Modal id="sharePomodoroModal" title="Condividi Pomodoro" bind:this={modalComponent}>
	{#snippet body()}
		<form method="POST" action="?/addUser" use:enhance={onEnhanceAdd}>
			<div class="input-group">
				<input type="email" name="email" placeholder="Email utente" class="form-control" required />
				<!-- manda il tempo virtuale al server (se disponibile) -->
				{#if $timingStore}
					<input type="hidden" name="now" value={$timingStore.toISOString()} />
				{/if}
				<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
			</div>

			{#if form?.action === 'addUser' && form?.message}
				<div class="alert alert-{form.error ? 'danger' : 'success'} mt-2 p-1 text-center">
					{form.message}
				</div>
			{/if}
		</form>

		<p class="mt-3 mb-1">Notifiche inviate (questa sessione)</p>
		<div class="list-group list-group-flush mb-2">
			{#if notificheInviate.length === 0}
				<p class="text-muted">Nessuna notifica inviata in questa sessione.</p>
			{/if}
			{#each notificheInviate as email (email)}
				<div class="list-group-item d-flex justify-content-between align-items-center p-1">
					<span>{email}</span>
					<!-- se vuoi rimuovere la notifica subito (se hai id, server deve restituire it) -->
				</div>
			{/each}
		</div>

		<hr />

		<p class="mb-1">Utenti già condivisi (dati dal server, *non* aggiornati da qui)</p>
		<div class="list-group list-group-flush">
			{#if pomodoro.sharedUsers?.length === 0}
				<p class="text-muted">
					Nessuno. La condivisione viene aggiunta quando il destinatario accetta.
				</p>
			{/if}
			{#each pomodoro.sharedUsers ?? [] as user (user._id)}
				<form
					method="POST"
					action="?/removeUser"
					use:enhance={onEnhanceRemove}
					class="list-group-item d-flex justify-content-between align-items-center p-1"
				>
					<!-- Per rimuovere SOLO la notifica, invia l'id della notifica se lo conosci; altrimenti invia userId -->
					<input type="hidden" name="userId" value={user._id} />
					<span>{user.email}</span>
					<button type="submit" class="btn text-danger btn-sm" aria-label="remove user">
						<i class="bi bi-x-circle-fill"></i>
					</button>
				</form>
			{/each}
		</div>
	{/snippet}
	{#snippet footer()}
		<button type="button" data-bs-dismiss="modal" class="btn btn-primary">Fatto</button>
	{/snippet}
</Modal>

<style>
	/* piccole migliorie se vuoi */
</style>

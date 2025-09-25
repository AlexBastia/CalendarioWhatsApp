<script>
	import { enhance } from '$app/forms';
	import Modal from './Modal.svelte';

	let { note, user } = $props();

	let isPublic = $state(note.isPublic);
</script>

<Modal id={'noteShareModal'} title={'Share'}>
	{#snippet body()}
		<form id="setPublicForm" method="POST" action="?/setPublic" use:enhance>
			<div class="form-check form-switch">
				<label class="form-check-label" for="publicSwitch">Pubblico</label>
				<input
					name="isPublic"
					class="form-check-input"
					type="checkbox"
					role="switch"
					id="publicSwitch"
					bind:checked={isPublic}
				/>
			</div>
		</form>
		{#if !isPublic}
			<form method="POST" action="?/addUser" use:enhance>
				<div class="input-group">
					<input type="text" name="email" placeholder="Email utente" class="form-control" />
					<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
				</div>
			</form>
			<div class="list-group list-group-flush">
				{#each note.sharedUsers as user, i (user.userID)}
					<form
						method="POST"
						action="?/removeUser"
						class="list-group-item d-flex justify-content-between align-items-center"
						use:enhance
					>
						<input type="hidden" name="isOwner" value={true} />
						<input type="hidden" name="id" value={user.userID} />
						<label for={`removeUser_${i}`}
							><span class="badge bg-secondary fs-6">{user.email}</span></label
						>
						<button
							id={`removeUser_${i}`}
							type="submit"
							class="btn text-danger"
							aria-label="remove user"><i class="bi bi-x-square-fill"></i></button
						>
					</form>
				{/each}
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}
		<button form="setPublicForm" type="submit" data-bs-dismiss="modal" class="btn btn-primary"
			>Salva</button
		>
	{/snippet}
</Modal>
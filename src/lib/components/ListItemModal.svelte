<script>
	import { enhance } from '$app/forms';
	import Modal from './Modal.svelte';
</script>

<Modal title={'Elemento lista'} id="listItemModal">
	{#snippet body()}
		<form id="listItemForm" method="POST" action="?/addItem">
			<div class="mb-3">
				<label for="descr" class="form-label">Descrizione</label>
				<input id="descr" name="descr" class="form-control" required />
			</div>

			<div class="mb-3">
				<label for="deadline" class="form-label">Data (opzionale)</label>
				<input id="deadline" name="deadline" type="date" class="form-control" />
			</div>
		</form>
	{/snippet}
	{#snippet footer()}
		<button form="listItemForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
			>Add</button
		>
	{/snippet}
</Modal>
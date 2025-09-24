<script>
	import Modal from '$lib/components/Modal.svelte';
</script>

<Modal title={'Choose note type'} id={'noteNewModal'}>
	{#snippet body()}
		<div class="d-flex">
			<button class="btn btn-primary flex-fill" form="createNoteForm" type="submit"
				><i class="bi bi-fonts me-2"></i>Text</button
			>
			<button
				class="btn btn-primary flex-fill"
				form="createNoteForm"
				formaction="/note/liste?/create"
				type="submit"><i class="bi bi-list-check me-2"></i>List</button
			>
		</div>
	{/snippet}
	{#snippet footer()}
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	{/snippet}
</Modal>

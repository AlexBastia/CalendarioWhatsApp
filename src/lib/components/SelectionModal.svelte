<script>
	import Modal from '$lib/components/Modal.svelte';

	let { children } = $props();
</script>

<Modal title={'Choose note type'} id={'noteNewModal'}>
	{#snippet body()}
		<div class="d-flex">
			<!-- {#each buttons as button}
				<button class="btn btn-primary flex-fill" form={button.formId} formaction={button.formaction} type="submit"
					><i class="bi bi-fonts me-2"></i>Text</button
				>
			{/each}
			<button
				class="btn btn-primary flex-fill"
				form="createNoteForm"
				formaction="/note/liste?/create"
				type="submit"><i class="bi bi-list-check me-2"></i>List</button
			> -->
			{@render children()}
		</div>
	{/snippet}
	{#snippet footer()}
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	{/snippet}
</Modal>

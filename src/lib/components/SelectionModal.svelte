<script>
	import Modal from '$lib/components/Modal.svelte';

	let { children, idModal= 'noteNewModal', titleModal = 'Choose note type' } = $props();
</script>

<Modal title={titleModal} id={idModal}>
	{#snippet body()}
		<div class="d-flex">
			{@render children()}
		</div>
	{/snippet}
	{#snippet footer()}
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	{/snippet}
</Modal>

<script>
	import Modal from '$lib/components/Modal.svelte';

	let { children } = $props();
</script>

<Modal title={'Choose note type'} id={'noteNewModal'}>
	{#snippet body()}
		<div class="d-flex">
			{@render children()}
		</div>
	{/snippet}
	{#snippet footer()}
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	{/snippet}
</Modal>

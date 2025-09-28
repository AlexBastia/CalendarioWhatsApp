<script>
	import Modal from "./Modal.svelte";

    let {formId} = $props()
</script>

<Modal id={'deleteConfirmationModal'} title={'Confirm deletion'} >
    {#snippet body()}
        <h3>Are you sure you want to delete this item?</h3>
    {/snippet}
    {#snippet footer()}
        <button type="button" class="btn btn-secondary" data-bs-dismiss='modal'>
            No, go back
        </button>
        <button type="submit" class="btn btn-danger" form={formId}>
            Yes, delete
        </button>
    {/snippet}
</Modal>
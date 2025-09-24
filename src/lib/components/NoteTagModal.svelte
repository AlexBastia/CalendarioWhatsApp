<script>
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';

	let { userTags, noteTags } = $props();
	let form = $state(null);
</script>

<Modal title={'Categorie'} id={'noteTagModal'}>
	{#snippet body()}
		<form
			method="POST"
			action="/note?/createTag"
			use:enhance={(submit) =>
				({ result }) => {
					form = result.data;
				}}
		>
			<div class="input-group has-validation">
				<input
					type="text"
					name="tagName"
					placeholder="Nome categoria"
					class="form-control {form?.missing || form?.invalid ? 'is-invalid' : ''}"
					value={form?.tagName ?? ''}
					required
				/>
				<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
				<div class="invalid-feedback">Inserire un nome valido.</div>
			</div>
		</form>
		<form
			id="changeTagForm"
			method="POST"
			action="?/updateTags"
			use:enhance={() => {
				return async ({ update }) => update({ reset: false });
			}}
		>
			<div class="list-group list-group-flush">
				{#each userTags as tag (tag._id)}
					<div class="list-group-item d-flex justify-content-between align-items-center">
						<label for={tag._id} class="form-check-label"
							><span class="badge bg-secondary fs-6">{tag.name}</span></label
						>
						<input
							type="checkbox"
							name={tag._id}
							checked={noteTags.some((noteTag) => noteTag._id === tag._id)}
							class="form-check-input"
						/>
					</div>
				{/each}
			</div>
		</form>
	{/snippet}
	{#snippet footer()}
		<button form="changeTagForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
			>Salva</button
		>
	{/snippet}
</Modal>

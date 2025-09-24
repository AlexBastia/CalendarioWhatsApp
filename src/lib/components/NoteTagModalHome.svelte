<script>
	import { enhance } from '$app/forms';
	import Modal from './Modal.svelte';

	let { userTags, form } = $props();
</script>

<!-- Modal Categorie -->
<Modal id={'noteModalCategorie'} title={'Categorie'}>
	{#snippet body()}
		<form method="POST" action="/note?/createTag" use:enhance>
			<div class="input-group has-validation">
				<input
					type="text"
					name="tagName"
					placeholder="Nome categoria"
					class="form-control {form?.missing || form?.invalid ? 'is-invalid' : ''}"
					value={form?.tagName ?? ''}
					aria-describedby="validation"
					required
				/>
				<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
				<div class="invalid-feedback">Inserire un nome valido.</div>
			</div>
		</form>
		<div class="list-group list-group-flush">
			{#each userTags as tag, i (tag._id)}
				<form
					method="POST"
					action="?/deleteTag"
					class="list-group-item d-flex justify-content-between align-items-center"
					use:enhance
				>
					<input type="hidden" name="id" value={tag._id} />
					<label for={`deleteTag_${i}`}
						><span class="badge bg-secondary fs-6">{tag.name}</span></label
					>
					<button
						id={`deleteTag_${i}`}
						type="submit"
						class="btn text-danger"
						aria-label="delete tag"><i class="bi bi-x-square-fill"></i></button
					>
				</form>
			{/each}
		</div>
	{/snippet}
	{#snippet footer()}
		<div></div>	
	{/snippet}
</Modal>

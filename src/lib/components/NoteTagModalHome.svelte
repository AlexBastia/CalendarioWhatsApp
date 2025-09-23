<script>
	import { enhance } from '$app/forms';

	let { userTags, form } = $props();
</script>

<!-- Modal Categorie -->
<div
	class="modal fade"
	id="noteModalCategorie"
	data-bs-backdrop="static"
	data-bs-keyboard="false"
	tabindex="-1"
	aria-labelledby="staticBackdropLabel"
	aria-hidden="true"
>
	<div class="modal-dialog modal-dialog-scrollable">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="staticBackdropLabel">Categorie</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<form method="POST" action="/note?/createTag" use:enhance>
					<div class="input-group has-validation">
						<input
							type="text"
							name="tagName"
							placeholder="Nome categoria"
							class="form-control {(form?.missing || form?.invalid) ? "is-invalid" : ""}"
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
			</div>
		</div>
	</div>
</div>

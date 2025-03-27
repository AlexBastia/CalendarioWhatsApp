<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { formatDate } from '../../utilities';

	let { data } = $props();
</script>

<header class="container d-flex justify-content-end">
	<form
		method="POST"
		action="?/delete"
		use:enhance={() => {
			return () => {
				goto('/note');
			};
		}}
	>
		<button class="dropdown-item text-danger fs-4" type="submit" aria-label="delete note"
			><i class="bi bi-trash"></i></button
		>
	</form>
</header>

<main class="container">
	<form
		id="listForm"
		method="POST"
		action="?/updateTitle"
		use:enhance={() => {
			return () => {
				goto('/note');
			};
		}}
	>
		<div>
			<textarea
				class="w-100 fs-1 fw-bold mb-0 border-0"
				name="title"
				id="listTitle"
				value={data.list.title}
				placeholder="Titolo"
				maxlength="50"
				rows="1"
				style="resize: none; outline: none;"
			></textarea>
			<div class="tags">
				<!-- Button trigger tag modal -->
				<button
					type="button"
					class="btn p-0"
					data-bs-toggle="modal"
					data-bs-target="#tagModal"
					aria-label="Add tag"
				>
					{#each data.noteTags as tag}
						<span class="badge bg-secondary me-1">{tag.name}</span>
					{/each}
					<i class="bi bi-plus-circle"></i>
				</button>
			</div>

			<p class="text-muted fs-6">
				{formatDate(data.list.timeCreation)} | {formatDate(data.list.timeLastModified)}
			</p>
		</div>
		<button
			class="btn position-fixed float-end rounded-circle bg-light p-0 text-primary"
			aria-label="Save and go back"
			style="bottom: 1em; right: 0.6em"
		>
			<i class="bi bi-check-circle-fill" style="font-size: 4em; line-height: 64px;"></i>
		</button>
	</form>
	<ul class="list-group list-group-flush">
		{#each data.list.items as item (item._id)}
			<li class="list-group-item">
				<form action="?/removeItem" method="POST" class="d-flex align-items-center" use:enhance>
					<button
						class="btn"
						type="submit"
						name="id"
						value={item._id}
						aria-label="Set item completed"><i class="bi bi-circle"></i></button
					>
					<h4>{item.descr}</h4>
				</form>
			</li>
		{/each}
		<li class="list-group-item">
			<button class="btn" type="button" data-bs-toggle="modal" data-bs-target="#listItemModal"
				><i class="bi bi-plus-lg"></i> Aggiungi</button
			>
		</li>
	</ul>

	<!-- Modal Categorie -->
	<div
		class="modal fade"
		id="tagModal"
		data-bs-backdrop="static"
		data-bs-keyboard="false"
		tabindex="-1"
		aria-labelledby="tagModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="tagModalLabel">Categorie</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<form method="POST" action="/note?/createTag" use:enhance>
						<div class="input-group">
							<input type="text" name="tagName" class="form-control" />
							<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
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
							{#each data.userTags as tag (tag._id)}
								<div class="list-group-item d-flex justify-content-between align-items-center">
									<label for={tag._id} class="form-check-label"
										><span class="badge bg-secondary fs-6">{tag.name}</span></label
									>
									<input
										type="checkbox"
										name={tag._id}
										checked={data.noteTags.some((noteTag) => noteTag._id === tag._id)}
										class="form-check-input"
									/>
								</div>
							{/each}
						</div>
					</form>
				</div>
				<div class="modal-footer">
					<button form="changeTagForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
						>Salva</button
					>
				</div>
			</div>
		</div>
	</div>

	<!-- List Item Modal -->
	<div
		class="modal fade"
		id="listItemModal"
		tabindex="-1"
		aria-labelledby="listItemModalLabel"
		aria-hidden="true"
		data-bs-backdrop="static"
		data-bs-keyboard="false"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="listItemModalLabel">Elemento lista</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<form action="?/addItem" method="POST" id="listItemForm" use:enhance>
						<input type="text" placeholder="Descrizione" name="descr" />
					</form>
				</div>
				<div class="modal-footer">
					<button form="listItemForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
						>Add</button
					>
				</div>
			</div>
		</div>
	</div>
</main>

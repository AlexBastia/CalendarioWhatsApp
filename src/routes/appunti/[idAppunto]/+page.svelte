<script>
	import { enhance } from '$app/forms';
	import back from '$lib/assets/svgs/arrow-left.svg';
	import copy from '$lib/assets/svgs/clipboard.svg';
	import duplicate from '$lib/assets/svgs/copy.svg';
	import trash from '$lib/assets/svgs/trash-2.svg';
	import check from '$lib/assets/svgs/check.svg';
	import tag from '$lib/assets/svgs/tag.svg';
	import plus from '$lib/assets/svgs/plus.svg';
	import { goto } from '$app/navigation';
	import { formatDate } from '../utilities';

	let { data } = $props();

	const copyText = () => {
		const title = document.getElementById('noteTitle').value;
		const text = document.getElementById('noteText').value;
		navigator.clipboard.writeText(title + '\n\n' + text);
	};
</script>

<header class="container d-flex justify-content-end">
	<div class="dropdown">
		<button
			class="btn fs-2"
			type="button"
			id="dropdownMenuButton1"
			data-bs-toggle="dropdown"
			aria-expanded="false"
			aria-label="Options dropdown"
		>
			<i class="bi bi-three-dots-vertical"></i>
		</button>
		<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
			<li>
				<button
					class="dropdown-item"
					type="button"
					onclick={() => copyText()}
					aria-label="copy text to clipboard"
				>
					<i class="bi bi-clipboard"></i> Copia Testo</button
				>
			</li>
			<li>
				<button
					form="noteForm"
					type="submit"
					alt="duplicate"
					name="copy"
					value="true"
					class="dropdown-item"><i class="bi bi-copy"></i> Duplica</button
				>
			</li>
			<li>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return () => {
							goto('/appunti');
						};
					}}
				>
					<button class="dropdown-item text-danger" type="submit" aria-label="delete note"
						><i class="bi bi-trash"></i> Elimina</button
					>
				</form>
			</li>
		</ul>
	</div>
</header>

<main class="container">
	<form
		id="noteForm"
		method="POST"
		action="?/update"
		use:enhance={() => {
			return () => {
				goto('/appunti');
			};
		}}
	>
		<div>
			<textarea
				class="w-100 fs-1 fw-bold mb-0 border-0"
				name="title"
				id="noteTitle"
				value={data.note.title}
				placeholder="Titolo"
				maxlength="50"
				rows="1"
				style="resize: none; outline: none;"
			></textarea>
			<div class="categorie">
				<!-- Button trigger modal -->
				<button
					type="button"
					class="btn p-0"
					data-bs-toggle="modal"
					data-bs-target="#staticBackdrop"
					aria-label="Add tag"
				>
					{#each data.noteTags as tag}
						<span class="badge bg-secondary me-1">{tag.name}</span>
					{/each}
					<i class="bi bi-plus-circle"></i>
				</button>
			</div>

			<p class="text-muted fs-6">
				{formatDate(data.note.timeCreation)} | {formatDate(data.note.timeLastModified)}
			</p>
		</div>
		<textarea
			class="w-100 border-0"
			name="text"
			id="noteText"
			value={data.note.text}
			placeholder="Testo..."
			maxlength="10000"
			style="outline: 0; resize: none; height: 70vh;"
		></textarea>
		<button
			class="btn position-fixed float-end rounded-circle bg-light p-0 text-primary"
			aria-label="Save and go back"
			style="bottom: 1em; right: 0.6em"
		>
			<i class="bi bi-check-circle-fill" style="font-size: 4em; line-height: 64px;"></i>
		</button>
	</form>

	<!-- Modal Categorie -->
	<div
		class="modal fade"
		id="staticBackdrop"
		data-bs-backdrop="static"
		data-bs-keyboard="false"
		tabindex="-1"
		aria-labelledby="staticBackdropLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="staticBackdropLabel">Categorie</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<form method="POST" action="/appunti?/createTag" use:enhance>
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
					<form
						id="deleteTagForm"
						method="POST"
						action="/appunti?/deleteTag"
						use:enhance={() => console.log('hi')}
					></form>
				</div>
				<div class="modal-footer">
					<button form="changeTagForm" type="submit" class="btn btn-primary" data-bs-dismiss="modal"
						>Salva</button
					>
				</div>
			</div>
		</div>
	</div>
</main>

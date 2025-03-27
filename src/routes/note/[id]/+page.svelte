<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { formatDate } from '../utilities';

	let { data } = $props();
	let isMDView = $state(false);
	let mdContent = '';

	const copyText = () => {
		const title = document.getElementById('noteTitle').value;
		const text = document.getElementById('noteText').value;
		navigator.clipboard.writeText(title + '\n\n' + text);
	};

	const toggleMDView = () => {
		if (!isMDView) {
			mdContent = DOMPurify.sanitize(marked.parse(document.getElementById('noteText').value));
		}

		isMDView = !isMDView;
	};
</script>

<header class="container d-flex justify-content-end">
	<button class="btn fs-4" aria-label="View markdown" onclick={() => toggleMDView()}>
		{#if !isMDView}
			<i class="bi bi-book-half"></i>
		{:else}
			<i class="bi bi-pencil-fill"></i>
		{/if}
	</button>
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
			{#if !data.noteIsShared}
				<li>
					<!-- Button trigger share modal -->
					<button
						type="button"
						class="dropdown-item"
						data-bs-toggle="modal"
						data-bs-target="#shareModal"
					>
						<i class="bi bi-share me-2"></i> Condividi
					</button>
				</li>
			{/if}
			<li>
				<button
					class="dropdown-item"
					type="button"
					onclick={() => copyText()}
					aria-label="copy text to clipboard"
				>
					<i class="bi bi-clipboard me-2"></i> Copia Testo</button
				>
			</li>
			<li>
				<button
					form="noteForm"
					type="submit"
					alt="duplicate"
					name="copy"
					value="true"
					class="dropdown-item"><i class="bi bi-copy me-2"></i> Duplica</button
				>
			</li>
			{#if !data.noteIsShared}
				<li>
					<form
						method="POST"
						action="?/delete"
						use:enhance={() => {
							return () => {
								goto('/note');
							};
						}}
					>
						<button class="dropdown-item text-danger" type="submit" aria-label="delete note"
							><i class="bi bi-trash me-2"></i> Elimina</button
						>
					</form>
				</li>
			{/if}
		</ul>
	</div>
</header>

<main class="container">
	{#if data.noteIsShared}
		<small class="text-muted"
			>Shared from {data.sharedUserData?.username || 'Unkown'} ({data.sharedUserData?.email})</small
		>
	{/if}
	<form
		id="noteForm"
		method="POST"
		action="?/update"
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
				id="noteTitle"
				value={data.note.title}
				placeholder="Titolo"
				maxlength="50"
				rows="1"
				style="resize: none; outline: none;"
			></textarea>
			<div class="categorie">
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
			style="outline: 0; resize: none; height: 70vh; display: {isMDView ? 'none' : 'block'};"
		></textarea>

		{#if isMDView}
			<div class="md-container">{@html mdContent}</div>
		{/if}

		<button
			class="btn position-fixed float-end rounded-circle bg-light p-0 text-primary"
			aria-label="Save and go back"
			style="bottom: 1em; right: 0.6em"
		>
			<i class="bi bi-check-circle-fill" style="font-size: 4em; line-height: 64px;"></i>
		</button>
	</form>

	<!-- Modal Share -->
	<div
		class="modal fade"
		id="shareModal"
		data-bs-backdrop="static"
		data-bs-keyboard="false"
		tabindex="-1"
		aria-labelledby="shareModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="shareModalLabel">Condividi</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<form id="setPublicForm" method="POST" action="?/setPublic" use:enhance>
						<div class="form-check form-switch">
							<label class="form-check-label" for="publicSwitch">Pubblico</label>
							<input
								name="isPublic"
								class="form-check-input"
								type="checkbox"
								role="switch"
								id="publicSwitch"
								checked={data.note.isPublic}
							/>
						</div>
					</form>
					<form method="POST" action="?/addUser" use:enhance>
						<div class="input-group">
							<input type="text" name="email" placeholder="Email utente" class="form-control" />
							<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
						</div>
					</form>
					<div class="list-group list-group-flush">
						{#each data.note.sharedUsers as user, i (user.userID)}
							<form
								method="POST"
								action="?/removeUser"
								class="list-group-item d-flex justify-content-between align-items-center"
								use:enhance
							>
								<input type="hidden" name="id" value={user.userID} />
								<label for={`removeUser_${i}`}
									><span class="badge bg-secondary fs-6">{user.email}</span></label
								>
								<button
									id={`removeUser_${i}`}
									type="submit"
									class="btn text-danger"
									aria-label="remove user"><i class="bi bi-x-square-fill"></i></button
								>
							</form>
						{/each}
					</div>
				</div>
				<div class="modal-footer">
					<button form="setPublicForm" type="submit" data-bs-dismiss="modal" class="btn btn-primary"
						>Salva</button
					>
				</div>
			</div>
		</div>
	</div>
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
</main>

<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ListItemModal from '$lib/components/ListItemModal.svelte';
	import NoteTagModal from '$lib/components/NoteTagModal.svelte';
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

	<!-- Modals -->
	<NoteTagModal userTags={data.userTags} noteTags={data.noteTags} />
	<ListItemModal />
</main>

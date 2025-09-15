<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { formatDate } from '../utilities';
	import NoteTagModal from '$lib/components/NoteTagModal.svelte';
	import NoteShareModal from '$lib/components/NoteShareModal.svelte';
	import NoteActionDropdown from '$lib/components/NoteActionDropdown.svelte';

	let { data } = $props();
	let isMDView = $state(false);
	let mdContent = '';

	const toggleMDView = () => {
		if (!isMDView) {
			mdContent = DOMPurify.sanitize(marked.parse(document.getElementById('noteText').value));
		}
		isMDView = !isMDView;
	};

	const copyText = () => {
		const title = document.getElementById('noteTitle').value;
		const text = document.getElementById('noteText').value;
		navigator.clipboard.writeText(title + '\n\n' + text);
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
	<NoteActionDropdown isShared={data.noteIsShared} {copyText} sharingId={data.sharedUserData?._id} />
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

	<!-- Modals -->
	<NoteShareModal note={data.note} user={data.user} />
	<NoteTagModal userTags={data.userTags} noteTags={data.noteTags}/>
</main>

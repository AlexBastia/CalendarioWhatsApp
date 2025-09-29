<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import NoteTagModal from '$lib/components/NoteTagModal.svelte';
	import NoteShareModal from '$lib/components/NoteShareModal.svelte';
	import NoteActionDropdown from '$lib/components/NoteActionDropdown.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Btn from '$lib/components/btn.svelte';
	import TagDisplayButton from '$lib/components/TagDisplayButton.svelte';
	import DateDisplay from '$lib/components/DateDisplay.svelte';
	import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';
	import Title from '$lib/components/Title.svelte';
	import TaskForm from '$lib/components/taskForm.svelte';

	let { data, form } = $props();
	let isMDView = $state(false);
	let mdContent = $state();

	let localForm = $state();

	const updateLocalForm = (val) => {
		localForm = val;
	};

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

<div class="position-relative vh-100">
	<Title backLink={'/note'}>
		<button class="btn fs-4" aria-label="View markdown" onclick={() => toggleMDView()}>
			{#if !isMDView}
				<i class="bi bi-book-half"></i>
			{:else}
				<i class="bi bi-pencil-fill"></i>
			{/if}
		</button>
		<NoteActionDropdown
			isShared={data.noteIsShared}
			{copyText}
			sharingId={data.sharedUserData?._id}
		/>

		<DeleteConfirmationModal formId={'deleteNoteForm'} />
	</Title>

	<main class="container">
		{#if data.noteIsShared}
			<small class="text-muted"
				>Shared from {data.sharedUserData?.username || 'Unkown'} ({data.sharedUserData
					?.email})</small
			>
		{/if}
		<form id="noteForm" method="POST" action="?/update">
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
				<div class="tags">
					<TagDisplayButton tags={data.noteTags} modalId={'noteTagModal'} />
				</div>

				<DateDisplay date1={data.note.timeCreation} date2={data.note.timeLastModified} />
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

			<Btn ariaLabel={'Save and go back'} submissionForm={'noteForm'} />
		</form>

		<!-- Modals -->
		<NoteShareModal note={data.note} user={data.user} />
		<NoteTagModal userTags={data.userTags} noteTags={data.noteTags} {localForm} {updateLocalForm} />
	</main>
	{#if localForm?.failed}
		<Alert type={'warning'} message={'Operazione fallita'} />
	{/if}
</div>

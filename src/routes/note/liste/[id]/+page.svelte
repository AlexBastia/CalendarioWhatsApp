<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Btn from '$lib/components/btn.svelte';
	import DateDisplay from '$lib/components/DateDisplay.svelte';
	import ListItem from '$lib/components/ListItem.svelte';
	import ListItemModal from '$lib/components/ListItemModal.svelte';
	import NoteTagModal from '$lib/components/NoteTagModal.svelte';
	import TagDisplayButton from '$lib/components/TagDisplayButton.svelte';

	let { data } = $props();

	let localForm = $state();

	const updateLocalForm = (val) => {
		localForm = val
	}
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
				<TagDisplayButton tags={data.noteTags} modalId={'noteTagModal'} />
			</div>

			<DateDisplay date1={data.list.timeCreation} date2={data.list.timeLastModified}/>
		</div>
		<Btn ariaLabel={'Save and go back'} submissionForm={'listForm'}/>
	</form>
	<ul class="list-group list-group-flush">
		{#each data.list.items as item (item._id)}
			<li class="list-group-item">
				<ListItem {item}/>
			</li>
		{/each}
		<li class="list-group-item">
			<button class="btn" type="button" data-bs-toggle="modal" data-bs-target="#listItemModal"
				><i class="bi bi-plus-lg"></i> Aggiungi</button
			>
		</li>
	</ul>

	<!-- Modals -->
	<NoteTagModal userTags={data.userTags} noteTags={data.noteTags} {localForm} {updateLocalForm}/>
	<ListItemModal />
</main>

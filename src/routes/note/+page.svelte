<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { filterPreviews, sortPreviews } from './utilities';
	import NoteModalCategorie from '$lib/components/NoteModalCategorie.svelte';
	import PreviewNote from '$lib/components/PreviewNote.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data, form } = $props();

	// Configurazione Filtro e Ordine default
	let orderBy = 'date',
		orderIsGrowing = $state(true),
		searchFilter = '',
		activeTagID = '';

	onMount(() => {
		// Cerca nella sessionStorage se e' salvata l'ultima configurazione Filtro/Ordine, se si la imposta
		const lastOrderedFilter = JSON.parse(window.sessionStorage.getItem('lastOrderedFilter'));
		if (lastOrderedFilter) {
			orderBy = lastOrderedFilter.orderBy;
			orderIsGrowing = lastOrderedFilter.orderIsGrowing;
			searchFilter = lastOrderedFilter.searchFilter;
			activeTagID = lastOrderedFilter.activeTagID;
		}

		// Applica la configurazione di ordine E DI FILTRO
		updatePreviewsOrder(orderBy);

		// Cambia i valori degli input per farli corrispondere alla configurazione
		document.getElementById('sort').value = orderBy;
		document.getElementById('searchVal').value = searchFilter;
		document.getElementById('tag').value = activeTagID;

		return () => {
			// Quando viene "un-mounted" la pagina, salvare nella sessionStorage la configurazione Filtro/Ordine usata
			window.sessionStorage.setItem(
				'lastOrderedFilter',
				JSON.stringify({
					orderBy,
					orderIsGrowing,
					searchFilter,
					activeTagID
				})
			);
		};
	});

	// Filtro e ordinamento note
	const originalPreviews = data.notePreviews.concat(data.sharedNotePreviews).concat(data.lists);
	let orderedPreviews = originalPreviews;
	let filteredPreviews = $state(orderedPreviews);

	const updatePreviewsOrder = (sort) => {
		orderBy = sort;
		orderedPreviews = sortPreviews(sort, orderIsGrowing, originalPreviews);
		updatePreviewsFilter(activeTagID, searchFilter);
	};

	const invertOrder = () => {
		orderedPreviews = orderedPreviews.reverse();
		orderIsGrowing = !orderIsGrowing;
		updatePreviewsFilter(activeTagID, searchFilter);
	};

	const updatePreviewsFilter = (tagID, searchText) => {
		activeTagID = tagID;
		searchFilter = searchText.toLowerCase();
		filteredPreviews = filterPreviews(activeTagID, data.userTags, searchFilter, orderedPreviews);
	};
</script>

<div class="position-relative vh-100">
	<header class="container d-flex justify-content-between align-items-center">
		<h1 class="display-2">Note</h1>
		<button
			type="button"
			class="btn btn-outline-primary"
			data-bs-toggle="modal"
			data-bs-target="#noteModalCategorie"
		>
			Gestisci categorie
		</button>
	</header>

	<main>
		<!-- Order/Filter inputs -->
		<div class="container">
			<input
				id="searchVal"
				type="text"
				class="form-control fs-2 mt-4"
				placeholder="Search"
				oninput={(e) => updatePreviewsFilter(activeTagID, e.target.value)}
			/>
			<div class="row align-items-end mt-2">
				<div class="col">
					<label for="sort" class="fs-6">Ordina</label>
					<select
						id="sort"
						class="form-select fs-6"
						oninput={(e) => updatePreviewsOrder(e.target.value)}
					>
						<option value="date" selected>Data</option>
						<option value="alpha">Alfabetico</option>
						<option value="len">Lunghezza</option>
					</select>
				</div>
				<div class="col">
					<label for="tag">Categoria</label>
					<select
						id="tag"
						class="form-select"
						oninput={(e) => updatePreviewsFilter(e.target.value, searchFilter)}
					>
						<option value="" selected>Nessuna</option>
						{#each data.userTags as tag}
							<option value={tag._id}>{tag.name}</option>
						{/each}
					</select>
				</div>
				<div class="col-2">
					<input
						id="invertOrderCheckbox"
						type="checkbox"
						class="btn-check"
						autocomplete="off"
						onclick={() => invertOrder()}
					/>
					<label class="btn fs-4" for="invertOrderCheckbox" style="border: none;">
						{#if orderIsGrowing}
							<i class="bi bi-sort-up"></i>
						{:else}
							<i class="bi bi-sort-down"></i>
						{/if}
					</label>
				</div>
			</div>
		</div>

		<!-- Note preview list -->
		<div class="container mt-4">
			<div class="row g-4">
				{#each filteredPreviews as preview (preview._id)}
					{#if preview.items}
						<PreviewNote
							{preview}
							userTags={data.userTags}
							href={`/note/liste/${preview._id}`}
							mainText={'Numero elementi: ' + preview.items.length || 'No items'}
						/>
					{:else}
						<PreviewNote
							{preview}
							userTags={data.userTags}
							href={`/note/${preview._id}`}
							mainText={preview.textStart || 'No text'}
						/>
					{/if}
				{/each}
			</div>
		</div>

		<!-- New Note/List button dropup -->
		<div class="position-fixed" style="bottom: 1em; right: 0.6em;z-index: 1050">
			<div class="btn-group dropup float-end">
				<button
					type="button"
					class="btn text-primary bg-light rounded-circle p-0 d-flex align-items-center justify-content-center"
					aria-label="Add note"
					style="font-size: 4em; width: 1em; height: 1em; "
					data-bs-toggle="dropdown"
					aria-expanded="false"
				>
					<i class="bi bi-plus-circle-fill"></i>
				</button>
				<ul class="dropdown-menu">
					<li>
						<button form="createNoteForm" type="submit" class="dropdown-item"
							><i class="bi bi-fonts me-2"></i>Text</button
						>
					</li>
					<li>
						<button form="createListForm" type="submit" class="dropdown-item"
							><i class="bi bi-list-check me-2"></i>List</button
						>
					</li>
				</ul>
			</div>
		</div>

		<!-- Hidden Forms -->
		<form method="POST" action="?/create" id="createNoteForm" use:enhance>
			<input name="title" type="hidden" value="" />
			<input name="text" type="hidden" value="" />
		</form>
		<form method="POST" action="/note/liste?/create" id="createListForm" use:enhance></form>

		<!-- Modals -->
		<NoteModalCategorie userTags={data.userTags} />
	</main>
	{#if form?.failed || form?.missing || form?.invalid}
		<Alert type={'warning'} message={'Operazione fallita'} />
	{/if}
</div>

<script>
	import { onMount } from 'svelte';
	import plus from '$lib/assets/svgs/plus.svg';
	import up from '$lib/assets/svgs/arrow-up.svg';
	import down from '$lib/assets/svgs/arrow-down.svg';
	import trash from '$lib/assets/svgs/trash-2.svg';
	import { enhance } from '$app/forms';
	import { filterPreviews, sortPreviews } from './utilities';

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
	let orderedPreviews = data.notePreviews;
	let filteredPreviews = $state(data.notePreviews);

	const updatePreviewsOrder = (sort) => {
		orderBy = sort;
		orderedPreviews = sortPreviews(sort, orderIsGrowing, data.notePreviews);
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

<header class="container d-flex justify-content-between align-items-center">
	<h1 class="display-2">Appunti</h1>
	<!-- Button trigger modal -->
	<button
		type="button"
		class="btn btn-outline-primary"
		data-bs-toggle="modal"
		data-bs-target="#staticBackdrop"
	>
		Gestisci categorie
	</button>
</header>
<main>
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
				<label class="btn" for="invertOrderCheckbox" style="border: none;"
					><img
						src={orderIsGrowing ? up : down}
						alt={orderIsGrowing ? 'Growing' : 'Decreasing'}
					/></label
				>
			</div>
		</div>
	</div>
	<div class="container mt-4">
		<div class="row g-4">
			{#each filteredPreviews as preview (preview._id)}
				<div class="col">
					<div class="card" style="max-width: 400px; min-width: 100px; position: relative;">
						<a class="card-link" href="/appunti/{preview._id}" aria-label="continue reading"></a>
						<div class="card-body">
							<h5 class="card-title">{preview.title || 'No title'}</h5>
							<p class="card-text">{preview.textStart || 'No text'}</p>
							<p class="card-text">
								<small class="text-muted">
									{#each data.userTags as tag}
										{#if tag.noteIDs.includes(preview._id)}
											<span class="badge bg-secondary me-1">{tag.name}</span>
										{/if}
									{/each}
								</small>
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="position-fixed" style="bottom: 1em; right: 0.6em">
		<form method="POST" action="?/create" use:enhance>
			<input name="title" type="hidden" value="" />
			<input name="text" type="hidden" value="" />
			<button
				class="float-end btn text-primary bg-light rounded-circle p-0"
				aria-label="Add note"
				style="font-size: 4em; line-height: 64px;"
			>
				<i class="bi bi-plus-circle-fill"></i>
			</button>
		</form>
	</div>
</main>

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
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<form method="POST" action="/appunti?/createTag" use:enhance>
					<div class="input-group">
						<input type="text" name="tagName" placeholder="Nome categoria" class="form-control" />
						<button type="submit" class="btn btn-outline-secondary">Aggiungi</button>
					</div>
				</form>
				<div class="list-group list-group-flush">
					{#each data.userTags as tag, i (tag._id)}
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

<style>
	.card-link::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}
</style>

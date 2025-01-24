<script>
	import { onMount } from 'svelte';
	import plus from '$lib/assets/svgs/plus.svg';
	import up from '$lib/assets/svgs/arrow-up.svg';
	import down from '$lib/assets/svgs/arrow-down.svg';

	let { data, form } = $props();

	// Configurazione Filtro e Ordine default
	let ordine = 'date',
		ordineIsCrescente = $state(true),
		filtroRicerca = '',
		categoriaAttiva = '';

	onMount(() => {
		// Cerca nella sessionStorage se e' salvata l'ultima configurazione Filtro/Ordine, se si la imposta
		const ultimoFiltroOrdinato = JSON.parse(window.sessionStorage.getItem('lastOrderedFilter'));
		if (ultimoFiltroOrdinato) {
			ordine = ultimoFiltroOrdinato.ordine;
			ordineIsCrescente = ultimoFiltroOrdinato.ordineIsCrescente;
			filtroRicerca = ultimoFiltroOrdinato.filtroRicerca;
			categoriaAttiva = ultimoFiltroOrdinato.categoriaAttiva;
		}

		// Applica la configurazione di ordine E DI FILTRO
		ordinaAnteprime(ordine);

		// Cambia i valori degli input per farli corrispondere alla configurazione
		document.getElementById('sort').value = ordine;
		document.getElementById('ricerca').value = filtroRicerca;
		document.getElementById('tag').value = categoriaAttiva;

		return () => {
			// Quando viene "un-mounted" la pagina, salvare nella sessionStorage la configurazione Filtro/Ordine usata
			window.sessionStorage.setItem(
				'lastOrderedFilter',
				JSON.stringify({
					ordine,
					ordineIsCrescente,
					filtroRicerca,
					categoriaAttiva
				})
			);
		};
	});

	let anteprimeOrdinate = data.anteprime;
	let anteprimeFiltrate = $state(data.anteprime);

	const filtraAnteprime = (testo) => {
		filtroRicerca = testo.toLowerCase();
		aggiornaFiltro();
	};

	const ordinaAnteprime = (sort) => {
		const dateComp = (a, b) => {
			return a.dataCreazione < b.dataCreazione;
		};
		const alphaComp = (a, b) => {
			return a.titolo > b.titolo;
		};
		const lenComp = (a, b) => {
			return a.caratteri > b.caratteri;
		};

		ordine = sort;

		switch (sort) {
			case 'date':
				anteprimeOrdinate = data.anteprime.sort(dateComp);
				break;
			case 'alpha':
				anteprimeOrdinate = data.anteprime.sort(alphaComp);
				break;
			case 'len':
				anteprimeOrdinate = data.anteprime.sort(lenComp);
				break;
		}
		if (!ordineIsCrescente) anteprimeOrdinate = anteprimeOrdinate.reverse();
		aggiornaFiltro();
	};

	const invertiOrdine = () => {
		anteprimeOrdinate = anteprimeOrdinate.reverse();
		ordineIsCrescente = !ordineIsCrescente;
		aggiornaFiltro();
	};

	const filtraCategoria = (categoria) => {
		categoriaAttiva = categoria;
		aggiornaFiltro();
	};

	const aggiornaFiltro = () => {
		if (categoriaAttiva)
			anteprimeFiltrate = anteprimeOrdinate
				.filter(({ categorie }) => !categorie.every((cat) => cat !== categoriaAttiva))
				.filter(
					(anteprima) =>
						anteprima.titolo.toLowerCase().includes(filtroRicerca) ||
						anteprima.testo.toLowerCase().includes(filtroRicerca)
				);
		else
			anteprimeFiltrate = anteprimeOrdinate.filter(
				(anteprima) =>
					anteprima.titolo.toLowerCase().includes(filtroRicerca) ||
					anteprima.testo.toLowerCase().includes(filtroRicerca)
			);
	};
</script>

<header class="container">
	<h1 class="display-2">Appunti</h1>
</header>
<main>
	<div class="container">
		<input
			id="ricerca"
			type="text"
			class="form-control fs-2 mt-4"
			placeholder="Search"
			oninput={(e) => filtraAnteprime(e.target.value)}
		/>
		<div class="row align-items-end mt-2">
			<div class="col">
				<label for="sort" class="fs-6">Ordina</label>
				<select id="sort" class="form-select fs-6" oninput={(e) => ordinaAnteprime(e.target.value)}>
					<option value="date" selected>Data</option>
					<option value="alpha">Alfabetico</option>
					<option value="len">Lunghezza</option>
				</select>
			</div>
			<div class="col">
				<label for="tag">Categoria</label>
				<select id="tag" class="form-select" oninput={(e) => filtraCategoria(e.target.value)}>
					<option value="" selected>Nessuna</option>
					<option value="test1">Test1</option>
					<option value="test2">Test2</option>
				</select>
			</div>
			<div class="col-2">
				<input
					id="invertOrderCheckbox"
					type="checkbox"
					class="btn-check"
					autocomplete="off"
					onclick={() => invertiOrdine()}
				/>
				<label class="btn" for="invertOrderCheckbox" style="border: none;"
					><img
						src={ordineIsCrescente ? up : down}
						alt={ordineIsCrescente ? 'Growing' : 'Decreasing'}
					/></label
				>
			</div>
		</div>
	</div>
	<div class="container mt-4">
		<div class="row g-4">
			{#each anteprimeFiltrate as anteprima (anteprima.id)}
				<div class="col">
					<div class="card" style="max-width: 400px; min-width: 100px; position: relative;">
						<a class="card-link" href="/appunti/{anteprima.id}" aria-label="continue reading"></a>
						<div class="card-body">
							<h5 class="card-title">{anteprima.titolo || 'No title'}</h5>
							<p class="card-text">{anteprima.testo || 'No testo'}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="position-fixed" style="bottom: 40px; right: 30px">
		<form method="POST" action="?/create">
			<input name="titolo" type="hidden" value="" />
			<input name="testo" type="hidden" value="" />
			<button class="btn btn-primary float-end rounded-circle p-1"
				><img width="50" height="50" src={plus} alt="Add Note" /></button
			>
		</form>
	</div>
</main>

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

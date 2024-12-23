<script>
	import { onMount } from 'svelte';

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

<header>
	<h2>Appunti</h2>
	<button>W</button>
</header>
<main>
	<div>
		<input
			id="ricerca"
			type="text"
			placeholder="Search"
			oninput={(e) => filtraAnteprime(e.target.value)}
		/>
		<label for="sort">Sort</label>
		<select name="sort" id="sort" oninput={(e) => ordinaAnteprime(e.target.value)}>
			<option value="date" selected>Data</option>
			<option value="alpha">Alfabetico</option>
			<option value="len">Lunghezza</option>
		</select>
		<button onclick={() => invertiOrdine()}>Crescente: {ordineIsCrescente ? 'si' : 'no'}</button>
		<label for="tag">Categoria</label>
		<select name="tag" id="tag" oninput={(e) => filtraCategoria(e.target.value)}>
			<option value="" selected>Nessuna</option>
			<option value="test1">Test1</option>
			<option value="test2">Test2</option>
		</select>
	</div>
	<div>
		{#each anteprimeFiltrate as anteprima}
			<div>
				<a href="/appunti/{anteprima.id}"><h3>{anteprima.titolo || 'No title'}</h3></a>
				<p>{anteprima.testo || 'No testo'}</p>
			</div>
		{/each}
	</div>
	<form method="POST" action="?/create">
		<input name="titolo" type="hidden" value="" />
		<input name="testo" type="hidden" value="" />
		<input type="submit" value="Aggiungi" />
	</form>
</main>

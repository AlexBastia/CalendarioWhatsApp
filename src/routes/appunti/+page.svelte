<script>
	let { data } = $props();
</script>

<h1>Appunti</h1>
<div>
	{#each data.anteprime as anteprima}
		<div>
			<a href="/appunti/{anteprima.id}"><h3>{anteprima.titolo}</h3></a>
			<p>{anteprima.testo}</p>
		</div>
	{/each}
</div>

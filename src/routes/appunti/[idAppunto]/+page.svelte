<script>
	let { data } = $props();

	const abrMonth = [
		'Gen',
		'Feb',
		'Mar',
		'Apr',
		'Mag',
		'Giu',
		'Lug',
		'Ago',
		'Set',
		'Ott',
		'Nov',
		'Dic'
	];

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const currentDate = new Date();

		const time = `${date.getHours()}:${date.getMinutes()}`;
		if (currentDate.getFullYear() !== date.getFullYear())
			return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
		return `${abrMonth[date.getMonth()]} ${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
	};

	const copyText = () => {
		navigator.clipboard.writeText(data.appunto.testo);
	};
</script>

<header>
	<a href="/appunti">back</a>
	<div>
		<button onclick={() => copyText()}>Copia</button>
		<form method="POST" action="/appunti?/create">
			<input name="titolo" type="hidden" value={data.appunto.titolo} />
			<input name="testo" type="hidden" value={data.appunto.testo} />
			<input type="submit" value="Duplica" />
		</form>
		<form method="POST" action="/appunti?/delete">
			<input name="id" type="hidden" value={data.appunto._id} />
			<input type="submit" value="Elimina" />
		</form>
	</div>
</header>
<form method="POST" action="/appunti?/update">
	<input name="id" type="hidden" value={data.appunto._id} />
	<div>
		<input name="titolo" type="text" value={data.appunto.titolo} />
		<p>{formatDate(data.appunto.dataCreazione)} | {formatDate(data.appunto.dataUltimaModifica)}</p>
	</div>
	<textarea name="testo" value={data.appunto.testo}></textarea>
	<input name="categorie" type="hidden" value={data.appunto.categorie} />
	<input type="submit" value="Salva" />
</form>

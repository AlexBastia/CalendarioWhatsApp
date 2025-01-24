<script>
	let { data } = $props();
	import back from '$lib/assets/svgs/arrow-left.svg';
	import copy from '$lib/assets/svgs/clipboard.svg';
	import duplicate from '$lib/assets/svgs/copy.svg';
	import trash from '$lib/assets/svgs/trash-2.svg';
	import check from '$lib/assets/svgs/check.svg';

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

<header class="container">
	<div class="row align-items-center">
		<div class="col-4">
			<a href="/appunti"><img src={back} alt="Go back" /></a>
		</div>
		<div class="col">
			<button class="btn" onclick={() => copyText()}> <img src={copy} alt="Copy text" /></button>
		</div>
		<div class="col">
			<form method="POST" action="/appunti?/create">
				<input name="titolo" type="hidden" value={data.appunto.titolo} />
				<input name="testo" type="hidden" value={data.appunto.testo} />
				<input name="duplica" type="hidden" value={true} />
				<button class="btn"><img src={duplicate} alt="Duplicate" /></button>
			</form>
		</div>
		<div class="col">
			<form method="POST" action="/appunti?/delete">
				<input name="id" type="hidden" value={data.appunto._id} />
				<button class="btn"><img src={trash} alt="Delete" /></button>
			</form>
		</div>
	</div>
</header>
<main class="container">
	<form method="POST" action="/appunti?/update">
		<input name="id" type="hidden" value={data.appunto._id} />
		<div>
			<textarea
				class="w-100 fs-1 border-0"
				name="titolo"
				value={data.appunto.titolo}
				placeholder="Titolo"
				maxlength="50"
				style="resize: none; outline: none;"
			></textarea>
			<p class="text-muted fs-6">
				{formatDate(data.appunto.dataCreazione)} | {formatDate(data.appunto.dataUltimaModifica)}
			</p>
		</div>
		<textarea
			class="w-100 border-0"
			name="testo"
			value={data.appunto.testo}
			placeholder="Testo..."
			maxlength="1000"
			style="outline: 0; resize: none; height: 70vh;"
		></textarea>
		<input name="categorie" type="hidden" value={data.appunto.categorie} />
		<button
			class="btn btn-primary position-fixed float-end rounded-circle p-1"
			aria-label="Save and go back"
			style="bottom: 40px; right: 30px"
		>
			<img src={check} alt="Check" />
		</button>
	</form>
</main>

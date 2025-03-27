<script>
	import { onMount } from 'svelte';
	import WhatsappIcon from '$lib/assets/svgs/whatsapp.svg';
	import PlayIcon from '$lib/assets/svgs/playfill.svg';
	import PauseIcon from '$lib/assets/svgs/pause.svg';

	let timerStudio = new Date('2022-01-01');
	let timerPausa = new Date('2022-01-01');
	let totaleStudio = new Date('2022-01-01');
	let totalePausa = new Date('2022-01-01');
	let inPausa = false;
	let timerAttivo = false;

	let r;
	let c;
	let dislocamento = 0;
	let cicloCorrente = 0;

	r = 45;
	$: c = 2 * Math.PI * r;

    let tempStudio;
    let tempPausa;
    let tempCicli;

	totaleStudio.setMinutes(0);
	totalePausa.setMinutes(0);
	totaleStudio.setSeconds(2);
	totalePausa.setSeconds(1);

	let cicli;
	let intervallo;
	let displayTime = '30:00';

	cicli = 5;

	function updateDisplayTime(orario) {
		let minutes = orario.getMinutes().toString().padStart(2, '0');
		let seconds = orario.getSeconds().toString().padStart(2, '0');
		displayTime = `${minutes}:${seconds}`;
	}

	function updateDislocamento(orario, totale) {
		let totalSeconds = totale.getMinutes() * 60 + totale.getSeconds();
		let remainingSeconds = orario.getMinutes() * 60 + orario.getSeconds();
		dislocamento = c * (1 - remainingSeconds / totalSeconds);
	}

	function eseguiTimer(orario, totale, callback) {
		console.log(orario);
		orario.setMinutes(totale.getMinutes());
		orario.setSeconds(totale.getSeconds());

		updateDisplayTime(orario);
		updateDislocamento(orario, totale);

		intervallo = setInterval(() => {
			if (inPausa == false) {
				if (orario.getMinutes() != 0 || orario.getSeconds() != 0) {
					orario.setSeconds(orario.getSeconds() - 1);
					updateDisplayTime(orario);
					updateDislocamento(orario, totale);
				} else {
					clearInterval(intervallo);
					if (callback) callback();
				}
			}
		}, 1000);
	}

	function eseguiCiclo(contaCicli) {
		cicloCorrente = contaCicli;
		if (contaCicli > 0) {
			eseguiTimer(timerStudio, totaleStudio, () => {
				eseguiTimer(timerPausa, totalePausa, () => {
					cicloCorrente--;
					eseguiCiclo(contaCicli - 1);
				});
			});
		} else {
			console.log('Cicli terminati');
			timerAttivo = false;
		}
	}
</script>

<div
	class="container d-flex flex-column align-items-center justify-content-center"
	style="height: 100vh;"
>
	<!-- Bottone per le impostazioni del timer -->
	<button
		type="button"
		class="btn btn-primary mb-3"
		data-bs-toggle="modal"
		data-bs-target="#settingsModal"
	>
		Impostazioni Timer
	</button>

	<!-- Modal per le impostazioni del timer -->
	<div
		class="modal fade"
		id="settingsModal"
		tabindex="-1"
		aria-labelledby="settingsModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="settingsModalLabel">Impostazioni Timer</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
					></button>
				</div>
				<div class="modal-body">
					<!-- Contenuto delle impostazioni del timer -->
					<div class="mb-3">
						<label for="studioTime" class="form-label">Tempo di Studio (minuti)</label>
						<input
							type="number"
							class="form-control"
							id="studioTime"
							bind:value={tempStudio}
							min="1"
						/>
					</div>
					<div class="mb-3">
						<label for="pausaTime" class="form-label">Tempo di Pausa (minuti)</label>
						<input
							type="number"
							class="form-control"
							id="pausaTime"
							bind:value={tempPausa}
							min="1"
						/>
					</div>
					<div class="mb-3">
						<label for="cicliCount" class="form-label">Numero di Cicli</label>
						<input type="number" class="form-control" id="cicliCount" bind:value={cicli} min="1" />
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
					<button
						type="button"
						class="btn btn-primary"
                        data-bs-dismiss="modal"
						on:click={() => {
                            totaleStudio.setMinutes(tempStudio);
                            totaleStudio.setSeconds(0);
                            totalePausa.setMinutes(tempPausa);
                            totalePausa.setSeconds(0);

                            clearInterval(intervallo);
							updateDisplayTime(totaleStudio);
							updateDislocamento(totaleStudio, totaleStudio);
						}}>
                        Salva Impostazioni</button
					>
				</div>
			</div>
		</div>
	</div>
	<!-- SVG -->
	<svg viewBox="0 0 100 100" width="400" height="400">
		<!-- Cerchio di sfondo con gradiente -->
		<circle cx="50" cy="50" {r} fill="white" />

		<!-- Cerchio grigio -->
		<circle cx="50" cy="50" {r} fill="none" stroke="gray" stroke-width="2" />

		<!-- Cerchio nero animato -->
		<circle
			cx="50"
			cy="50"
			{r}
			fill="none"
			stroke="black"
			stroke-width="2"
			stroke-linecap="round"
			stroke-dasharray={c}
			stroke-dashoffset={dislocamento}
			transform="rotate(-90 50 50)"
		/>

		<!-- Testo del timer -->
		<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20" fill="black"
			>{displayTime}</text
		>
		{#if timerAttivo}
			<text x="50%" y="70%" text-anchor="middle" dy=".3em" font-size="10" fill="black"
				>{cicloCorrente}/{cicli}</text
			>
		{/if}
	</svg>

	<!-- Bottone per iniziare il timer -->
	{#if !timerAttivo}
		<button
			type="button"
			id="iniziaPomodoro"
			class="btn p-5 m-2 rounded-circle"
			aria-label="Inizia Pomodoro"
			on:click={() => {
				timerAttivo = true;
				eseguiCiclo(cicli);
			}}
		>
			<img src={WhatsappIcon} alt="Inizia Pomodoro" />
		</button>
	{/if}

	<!-- Bottone per fermare il timer -->
	{#if timerAttivo}
		<div class="d-flex justify-content-around">
			<button
				type="button"
				id="pausa"
				class="btn p-5 m-2 rounded-circle"
				aria-label="Ferma Pomodoro"
				on:click={() => {
					inPausa = !inPausa;
				}}
			>
				{#if inPausa}
					<img src={PlayIcon} alt="Ferma Pomodoro" />
				{:else}
					<img src={PauseIcon} alt="Ferma Pomodoro" />
				{/if}
			</button>
			<button
				type="button"
				id="fermaPomodoro"
				class="btn p-5 m-2 rounded-circle"
				aria-label="Ferma Pomodoro"
				on:click={() => {
					clearInterval(intervallo);
					inPausa = false;
					updateDisplayTime(totaleStudio);
					updateDislocamento(totaleStudio, totaleStudio);
					timerAttivo = false;
				}}
			>
				<img src={WhatsappIcon} alt="Ferma Pomodoro" />
			</button>
			<button
				type="button"
				id="rincominciaCiclo"
				class="btn p-5 m-2 rounded-circle"
				aria-label="Rincomincia Ciclo"
				on:click={() => {
					clearInterval(intervallo);
					inPausa = false;
					updateDisplayTime(totaleStudio);
					updateDislocamento(totaleStudio, totaleStudio);
					eseguiCiclo(cicloCorrente);
				}}
			>
				<img src={WhatsappIcon} alt="Rincomincia Ciclo" />
			</button>
		</div>
	{/if}
</div>

<style>
	.btn:hover {
		background-color: #e0e0e0;
	}
</style>

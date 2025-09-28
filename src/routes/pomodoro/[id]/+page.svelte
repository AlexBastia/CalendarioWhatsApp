<script>
	import { onMount } from 'svelte';
	import BtnPom from '$lib/components/BtnPom.svelte';
	import WhatsappIcon from '$lib/assets/svgs/whatsapp.svg';
	import PlayIcon from '$lib/assets/svgs/playfill.svg';
	import PauseIcon from '$lib/assets/svgs/pause.svg';
	import { page } from '$app/stores';
	import SharePomodoro from '$lib/components/SharePomodoro.svelte';
	import PomodoroModal from '$lib/components/pomodoroModal.svelte';
	import { initNotifiche, mostraNotifica, presetsPomodoro } from '$lib/utils/notification.js';
	import { Task } from '$lib/models/Task';

	let { data } = $props();

	console.log('Page data:', data);

	let shareModal = $state();
	const pomData = $derived(data.pomodoro);
	console.log('Pomodoro data:', data.pomodoro, pomData);

	const eventId = $page.url.searchParams.get('eventId');

	const title = $derived(pomData?.title);
	const cicli = $derived(pomData?.cycles);

	const studioDate = $derived(pomData ? new Date(pomData.timeStudy) : null);
	const pausaDate = $derived(pomData ? new Date(pomData.timeBreak) : null);

	const studioSec = $derived(
		studioDate ? studioDate.getMinutes() * 60 + studioDate.getSeconds() : 0
	);
	const pausaSec = $derived(pausaDate ? pausaDate.getMinutes() * 60 + pausaDate.getSeconds() : 0);

	let secLeft = $state(studioSec);
	let phaseTot = $state(studioSec);
	let paused = $state(false);
	let running = $state(false);
	let curCycle = $state(0);
	let timerId;
	const r = 45;
	const c = 2 * Math.PI * r;
	let offset = $state(0);
	let timeStr = $state('');

	$effect(() => {
		if (pomData) {
			stopTimer();
			fmt(studioSec);
			updateDash(studioSec, studioSec);
		}
	});

	function fmt(totalSec) {
		if (typeof totalSec !== 'number') return;
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	function updateDash(left, total) {
		if (total === 0) {
			offset = 0;
			return;
		}
		offset = c * (1 - left / total);
	}

	async function runPhase(durataSec, msg1, msg2) {
		return new Promise((resolve, reject) => {
			secLeft = durataSec;
			phaseTot = durataSec;
			fmt(secLeft);
			updateDash(secLeft, phaseTot);

			timerId = setInterval(() => {
				console.log(secLeft);
				if (!running) {
					clearInterval(timerId);
					resolve('stopped');
				}
				if (paused) return;

				if (secLeft > 0 && !paused) {
					secLeft--;
					fmt(secLeft);
					updateDash(secLeft, phaseTot);
				}

				if (secLeft <= 0) {
					console.log('fase finita');
					clearInterval(timerId);
					mostraNotifica(msg1, msg2);
					resolve('done');
				}
			}, 1000);
		});
	}

	async function runCycles(startCycle = 1) {
		running = true;

		for (let i = startCycle; i <= cicli; i++) {
			if (!running) break;
			curCycle = i;

			const result = await runPhase(
				studioSec,
				presetsPomodoro.fineStudio.title,
				presetsPomodoro.fineStudio.options
			);
			console.log('Fine studio', result);
			if (!running) break;

			if (i < cicli) {
				const gg = await runPhase(
					pausaSec,
					presetsPomodoro.finePausa.title,
					presetsPomodoro.finePausa.options
				);
				console.log('Fine pausa', gg);
				if (!running) break;
			}
		}

		if (running) {
			mostraNotifica(presetsPomodoro.sessionEnd.title, presetsPomodoro.sessionEnd.options);
			await updateStatus('COMPLETATO');
		}

		running = false;
		curCycle = 0;
		fmt(studioSec);
		updateDash(studioSec, studioSec);
	}

	function stopTimer() {
		running = false;
		paused = false;
		clearInterval(timerId);
		updateStatus('INCOMPLETO');
	}

	async function updateStatus(status) {
		if (!eventId) return;

		const formData = new FormData();
		formData.append('eventId', eventId);
		formData.append('status', status);

		await fetch('/calendario?/updateStatus', {
			method: 'POST',
			body: formData
		});
	}



onMount(async () => {
  initNotifiche();
});
</script>

{#if !pomData}
	<p>Caricamento dati Pomodoro...</p>
	<div class="spinner-border" role="status">
		<span class="visually-hidden">Loading...</span>
	</div>
{:else}
	<!-- Centro verticale e orizzontale con bootstrap utilities -->
	<div class="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
		<!-- Barra superiore di azioni: condividi + impostazioni -->
		<div
			class="w-100 d-flex justify-content-center align-items-center mb-3 px-3"
			style="max-width: 900px;"
		>
			<div class="d-flex align-items-center">
				<BtnPom
					ariaLabel="Condividi Pomodoro"
					iconSrc={WhatsappIcon}
					extraClasses="p-5"
					on:click={() => {
						shareModal.show();
					}}
				></BtnPom>
			</div>

			<div class="d-flex">
				<button
					type="button"
					class="btn btn-primary"
					data-bs-toggle="modal"
					data-bs-target="#settingsModal"
				>
					Impostazioni Timer
				</button>
			</div>
		</div>

		<SharePomodoro
			bind:this={shareModal}
			pomodoro={pomData}
			formAction={`?/sharePomodoro`}
			form={$page.form}
		/>

		<PomodoroModal
			id="settingsModal"
			titleModal="Modifica Impostazioni"
			formMethod="POST"
			formAction={`?/updatePomodoro`}
			title={pomData.title}
			cicli={pomData.cycles}
			timeStudy={new Date(pomData.timeStudy).getMinutes()}
			timeBreak={new Date(pomData.timeBreak).getMinutes()}
		/>

		<!-- Row centrata per l'SVG (responsive width tramite colonne Bootstrap) -->
		<div class="row w-100 justify-content-center mb-3">
			<div class="col-10 col-sm-8 col-md-6 col-lg-6 d-flex justify-content-center">
				<!-- SVG responsive: width 100% mantiene aspect-ratio grazie a viewBox -->
				<svg
					class="w-100"
					viewBox="0 0 100 100"
					preserveAspectRatio="xMidYMid meet"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle cx="50" cy="50" {r} fill="white" />
					<circle cx="50" cy="50" {r} fill="none" stroke="gray" stroke-width="2" />
					<circle
						class="progress-ring"
						cx="50"
						cy="50"
						{r}
						fill="none"
						stroke="black"
						stroke-width="2"
						stroke-linecap="round"
						stroke-dasharray={c}
						stroke-dashoffset={offset}
						transform="rotate(-90 50 50)"
					/>
					<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20" fill="black"
						>{timeStr}</text
					>
					{#if running}
						<text x="50%" y="70%" text-anchor="middle" dy=".3em" font-size="10" fill="black">
							Ciclo: {curCycle} / {cicli}
						</text>
					{/if}
				</svg>
			</div>
		</div>

		<!-- Controlli: responsive stack su mobile, inline su sm+ -->
		<div class="w-100 d-flex justify-content-center mb-3">
			<div class="d-flex gap-2 align-items-center justify-content-center">
				{#if !running}
					<BtnPom
						ariaLabel="Avvia Pomodoro"
						extraClasses="p-5"
						iconSrc={PlayIcon}
						on:click={() => {
							runCycles();
						}}
					/>
				{/if}

				{#if running}
					<BtnPom
						ariaLabel="Pausa/Riprendi"
						extraClasses="p-5"
						iconSrc={paused ? PlayIcon : PauseIcon}
						on:click={() => (paused = !paused)}
					/>
					<BtnPom
						ariaLabel="Ferma Pomodoro"
						extraClasses="p-5"
						iconSrc={WhatsappIcon}
						on:click={stopTimer}
					/>
					<BtnPom
						ariaLabel="Ricomincia Ciclo"
						class="p-5"
						iconSrc={WhatsappIcon}
						on:click={() => {
							clearInterval(timerId);
							runCycles(curCycle);
						}}
					/>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* solo la transizione del dash - rimane necessario per l'animazione */
	.progress-ring {
		transition: stroke-dashoffset 1s linear;
	}

	/* piccola regola per evitare che text dentro svg risulti troppo grande su schermi piccoli */
	@media (max-width: 420px) {
		svg text[font-size='20'] {
			font-size: 14px;
		}
	}
</style>

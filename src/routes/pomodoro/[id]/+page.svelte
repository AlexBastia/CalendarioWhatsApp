<script>
	import { onMount } from 'svelte';
	import BtnPom from '$lib/components/BtnPom.svelte';
	import WhatsappIcon from '$lib/assets/svgs/whatsapp.svg';
	import ReloadIcon from '$lib/assets/svgs/arrow-counterclockwise.svg'
	import StopIcon from '$lib/assets/svgs/square-fill.svg'
	import PlayIcon from '$lib/assets/svgs/playfill.svg';
	import PauseIcon from '$lib/assets/svgs/pause.svg';
	import SettingsIcon from '$lib/assets/svgs/settings.svg'; // Aggiungi questa icona per le impostazioni
	import { page } from '$app/stores';
	import SharePomodoro from '$lib/components/SharePomodoro.svelte';
	import PomodoroModal from '$lib/components/pomodoroModal.svelte';
	import { initNotifiche, mostraNotifica, presetsPomodoro } from '$lib/utils/notification.js';
	import { Task } from '$lib/models/Task';
	import {timingStore} from '$lib/stores/timing.js' 
	import Title from '$lib/components/Title.svelte';

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
	async function setLastTimeUsed(timingStoreValue) {

		console.log('siva')
		const timeToSet = timingStoreValue || new Date();

		try {
			const response = await fetch(`/api/pomodoro/${pomData._id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ time: timeToSet })
			});

			if (!response.ok) {
				throw new Error('Failed to update timeLastUsed');
			}

			console.log('timeLastUsed updated successfully');
		} catch (error) {
			console.error('Error updating timeLastUsed:', error);
		}
	}

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
		console.log('runCycles called with startCycle:', startCycle);
		running = true;
		paused = false;

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
			console.log('aa');
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
		console.log('bb');
	}

	async function updateStatus(status) {
		if (!eventId) return;

		await fetch(`/api/event/${eventId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ stat: status })
		});
	}

	onMount(async () => {
		initNotifiche();
	});
</script>

{#if !pomData}
	<div class="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center">
		<div class="text-center">
			<div class="spinner-border text-primary mb-3" role="status">
				<span class="visually-hidden">Loading...</span>
			</div>
			<p class="text-muted">Caricamento dati Pomodoro...</p>
		</div>
	</div>
{:else}
	<div class="container-fluid min-vh-100 py-3">
		<Title title={pomData.title} backLink={'/pomodoro'}></Title>

		<section class="row justify-content-center mb-4">
			<div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
				<div class="card">
					<div class="card-body">
						<div class="d-flex justify-content-center gap-3 flex-wrap">
							<BtnPom
								ariaLabel="Condividi Pomodoro"
								iconSrc={WhatsappIcon}
								extraClasses="p-4"
								onclick={() => {
									shareModal.show();
								}}
							/>
							
							<!-- Pulsante Impostazioni -->
							<BtnPom
								ariaLabel="Impostazioni Timer"
								iconSrc={SettingsIcon}
								extraClasses="p-4"
								onclick={() => {
									// Bootstrap modal trigger via JavaScript
									const modalElement = document.getElementById('settingsModal');
									const modal = new bootstrap.Modal(modalElement);
									modal.show();
								}}
							/>
						</div>
						
						
					</div>
				</div>
			</div>
		</section>
		
		<section class="row justify-content-center mb-4">
			<div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
				<div class="card shadow-sm">
					<div class="card-body text-center p-4">
						<div class="timer-container mb-3">
							<svg
								class="w-100"
								viewBox="0 0 100 100"
								preserveAspectRatio="xMidYMid meet"
								xmlns="http://www.w3.org/2000/svg"
								style="max-height: 300px;"
							>
								<!-- Cerchio di sfondo -->
								<circle cx="50" cy="50" {r} fill="white" />
								<circle cx="50" cy="50" {r} fill="none" stroke="#e9ecef" stroke-width="3" />
								
								<!-- Cerchio di progresso -->
								<circle
									class="progress-ring"
									cx="50"
									cy="50"
									{r}
									fill="none"
									stroke={running ? (paused ? '#ffc107' : '#198754') : '#6c757d'}
									stroke-width="3"
									stroke-linecap="round"
									stroke-dasharray={c}
									stroke-dashoffset={offset}
									transform="rotate(-90 50 50)"
								/>
								
								<!-- Tempo rimanente -->
								<text 
									x="50%" 
									y="45%" 
									text-anchor="middle" 
									dy=".3em" 
									font-size="16" 
									font-weight="bold"
									fill="#212529"
								>
									{timeStr}
								</text>
								
								<!-- Informazioni ciclo -->
								{#if running}
									<text 
										x="50%" 
										y="65%" 
										text-anchor="middle" 
										dy=".3em" 
										font-size="8" 
										fill="#6c757d"
									>
										Ciclo {curCycle} di {cicli}
									</text>
								{/if}
							</svg>
						</div>

						
					</div>
				</div>
			</div>
		</section>

		

		<!-- Controls Section: Pulsanti di Controllo Timer -->
		<section class="row justify-content-center">
			<div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
				<div class="card">
					<div class="card-body">
						<div class="d-flex justify-content-center gap-3 flex-wrap">
							{#if !running}
								<!-- Pulsante Start -->
								<BtnPom
									ariaLabel="Avvia Pomodoro"
									extraClasses="p-4"
									iconSrc={PlayIcon}
									onclick={async () => {
										console.log('Starting runCycles from button click');
										setLastTimeUsed($timingStore ? $timingStore : new Date())
										runCycles();
									}}
								/>
							{:else}
								<!-- Controlli durante l'esecuzione -->
								<!-- Pausa/Riprendi -->
								<BtnPom
									ariaLabel={paused ? "Riprendi" : "Pausa"}
									extraClasses={paused ? "p-4" : "p-4"}
									iconSrc={paused ? PlayIcon : PauseIcon}
									onclick={() => (paused = !paused)}
								/>
								
								<!-- Stop -->
								<BtnPom
									ariaLabel="Ferma Pomodoro"
									extraClasses="p-4"
									iconSrc={StopIcon}
									onclick={() => {
										stopTimer();
										updateStatus('INCOMPLETO');
									}}
								/>
								
								<!-- Ricomincia Ciclo -->
								<BtnPom
									ariaLabel="Ricomincia Ciclo Corrente"
									extraClasses="p-4"
									iconSrc={ReloadIcon}
									onclick={() => {
										clearInterval(timerId);
										runCycles(curCycle);
									}}
								/>
							{/if}
						</div>
						
						
					</div>
				</div>
			</div>
		</section>
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
{/if}

<style>
	/* Animazione per il progresso del timer */
	.progress-ring {
		transition: stroke-dashoffset 1s linear;
	}

	/* Responsive del timer SVG */
	.timer-container {
		position: relative;
		width: 100%;
		max-width: 300px;
		margin: 0 auto;
	}

	/* Miglioramenti tipografici per mobile */
	@media (max-width: 576px) {
		svg text[font-size='16'] {
			font-size: 14px;
		}
		
		svg text[font-size='8'] {
			font-size: 7px;
		}
		
		.h4 {
			font-size: 1.1rem !important;
		}
	}

	/* Animazioni per i badge */
	.badge {
		transition: all 0.3s ease;
	}

	/* Card shadows responsive */
	@media (min-width: 768px) {
		.card.shadow-sm {
			box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
		}
	}
</style>
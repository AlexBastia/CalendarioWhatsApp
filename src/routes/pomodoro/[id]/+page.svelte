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

let { data } = $props();

let shareModal = $state();
const pomData = $derived(data.pomodoro && data.pomodoro.length > 0 ? data.pomodoro[0] : null);

const eventId = $page.url.searchParams.get('eventId');

const title = $derived(pomData?.title);
const cicli = $derived(pomData?.cycles);

const studioDate = $derived(pomData ? new Date(pomData.timeStudy) : null);
const pausaDate = $derived(pomData ? new Date(pomData.timeBreak) : null);

const studioSec = $derived(studioDate ? (studioDate.getMinutes() * 60 + studioDate.getSeconds()) : 0);
const pausaSec = $derived(pausaDate ? (pausaDate.getMinutes() * 60 + pausaDate.getSeconds()) : 0);

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

function runPhase(durataSec) {
  return new Promise((resolve) => {
    secLeft = durataSec;
    phaseTot = durataSec;
    fmt(secLeft);
    updateDash(secLeft, phaseTot);

    timerId = setInterval(() => {
      if (!running) {
        clearInterval(timerId);
        return;
      }
      if (paused) return;

      if (secLeft > 0) {
        secLeft--;
        fmt(secLeft);
        updateDash(secLeft, phaseTot);
      }

      if (secLeft <= 0) {
        clearInterval(timerId);
        resolve();
      }
    }, 1000);
  });
}

async function runCycles(startCycle = 1) {
  running = true;

  for (let i = startCycle; i <= cicli; i++) {
    if (!running) break;
    curCycle = i;

    await runPhase(studioSec);
    if (!running) break;
    mostraNotifica(presetsPomodoro.fineStudio.title, presetsPomodoro.fineStudio.options);

    if (i < cicli) {
      await runPhase(pausaSec);
      if (!running) break;
      mostraNotifica(presetsPomodoro.finePausa.title, presetsPomodoro.finePausa.options);
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
  <div class="container d-flex flex-column align-items-center justify-content-center" style="height: 100vh;">

    <BtnPom ariaLabel="Condividi Pomodoro"
        iconSrc={WhatsappIcon}
        on:click={() => { shareModal.show() }}>
    </BtnPom>

    <!-- TODO: METTERE LO STILE DEL BOTTONE CON BTN-POM -->

    <button type="button" class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#settingsModal">
      Impostazioni Timer
    </button>

    <SharePomodoro bind:this={shareModal} pomodoro={pomData} formAction={`?/sharePomodoro`} form={$page.form} />

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

    <svg viewBox="0 0 100 100" width="400" height="400">
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
        stroke-offset={offset}
        transform="rotate(-90 50 50)"
      />
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20" fill="black">{timeStr}</text>
      {#if running}
        <text x="50%" y="70%" text-anchor="middle" dy=".3em" font-size="10" fill="black">
          Ciclo: {curCycle} / {cicli}
        </text>
      {/if}
    </svg>

    {#if !running}
      <div class="d-flex justify-content-around">
        <BtnPom ariaLabel="Avvia Pomodoro" iconSrc={PlayIcon} on:click={() => { runCycles(); }} />
      </div>
    {/if}

    {#if running}
      <div class="d-flex justify-content-around">
        <BtnPom ariaLabel="Pausa/Riprendi" iconSrc={paused ? PlayIcon : PauseIcon} on:click={() => (paused = !paused)} />
        <BtnPom ariaLabel="Ferma Pomodoro" iconSrc={WhatsappIcon} on:click={stopTimer} />
        <BtnPom
          ariaLabel="Ricomincia Ciclo"
          iconSrc={WhatsappIcon}
          on:click={() => {
            clearInterval(timerId);
            runCycles(curCycle);
          }}
        />
      </div>
    {/if}
  </div>
{/if}

<style>
.btn:hover {
  background-color: #e0e0e0;
}

.progress-ring {
  transition: stroke-offset 1s linear;
}
</style>
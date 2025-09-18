<script>
    import { onMount } from 'svelte';
    import WhatsappIcon from '$lib/assets/svgs/whatsapp.svg';
    import PlayIcon from '$lib/assets/svgs/playfill.svg';
    import PauseIcon from '$lib/assets/svgs/pause.svg';
    import { page } from '$app/stores';
    import PomodoroModal from '$lib/components/pomodoroModal.svelte';
    import { initNotifiche, mostraNotifica, presetsPomodoro } from '$lib/utils/notification.js';

    let { data } = $props();
    // 2. Usiamo $effect per il console.log reattivo
    $effect(() => {
        console.log('Dati caricati (con $effect):', data);
    });
    
    // 3. Tutte le dichiarazioni reattive (:) diventano costanti con $derived
    const pomData = $derived(data.pomodoro && data.pomodoro.length > 0 ? data.pomodoro[0] : null);

    const eventId = $page.url.searchParams.get('eventId');

    const title = $derived(pomData?.title);
    const cicli = $derived(pomData?.cycles);
    const totaleStudioDate = $derived(pomData ? new Date(pomData.timeStudy) : null);
    const totalePausaDate = $derived(pomData ? new Date(pomData.timeBreak) : null);

    const durataStudioSecondi = $derived(totaleStudioDate ? (totaleStudioDate.getMinutes() * 60 + totaleStudioDate.getSeconds()) : 0);
    const durataPausaSecondi = $derived(totalePausaDate ? (totalePausaDate.getMinutes() * 60 + totalePausaDate.getSeconds()) : 0);

    // Variabili di stato (queste rimangono 'let' perché le modifichiamo direttamente)
    let secondiRimanenti = $state(durataStudioSecondi);
    let faseCorrenteSecondi = $state(durataStudioSecondi);
    let inPausa = $state(false);
    let timerAttivo = $state(false);
    let cicloCorrente = $state(0);
    let intervallo; // Questo non ha bisogno di essere reattivo

    // Variabili per l'interfaccia (SVG)
    const r = 45;
    const c = 2 * Math.PI * r;
    let dislocamento = $state(0);
    let tempoVisualizzato = $state('');

    // 4. Il blocco reattivo 'if' diventa un $effect
    $effect(() => {
        if (pomData) {
            fermaTutto();
            console.log('Aggiornamento pomData rilevato (con $effect):', pomData);
            aggiornaTempoVisualizzato(durataStudioSecondi);
            aggiornaDislocamento(durataStudioSecondi, durataStudioSecondi);
        }
    });
    
    
    // --- Le tue funzioni rimangono invariate ---
    function aggiornaTempoVisualizzato(totaleSecondi) {
        if (typeof totaleSecondi !== 'number') return;
        const minuti = Math.floor(totaleSecondi / 60);
        const secondi = totaleSecondi % 60;
        tempoVisualizzato = `${String(minuti).padStart(2, '0')}:${String(secondi).padStart(2, '0')}`;
    }

    function aggiornaDislocamento(rimanenti, totali) {
        if (totali === 0) {
            dislocamento = 0;
            return;
        }
        dislocamento = c * (1 - rimanenti / totali);
    }

    function eseguiFase(durataSecondi) {
        return new Promise((resolve) => {
            secondiRimanenti = durataSecondi;
            faseCorrenteSecondi = durataSecondi;
            aggiornaTempoVisualizzato(secondiRimanenti);
            aggiornaDislocamento(secondiRimanenti, faseCorrenteSecondi);

            intervallo = setInterval(() => {
                if (!timerAttivo) {
                    clearInterval(intervallo);
                    return;
                }
                if (inPausa) return;
                
                if (secondiRimanenti > 0) {
                    secondiRimanenti--;
                    aggiornaTempoVisualizzato(secondiRimanenti);
                    aggiornaDislocamento(secondiRimanenti, faseCorrenteSecondi);
                }
                
                if (secondiRimanenti <= 0) {
                    clearInterval(intervallo); 
                    resolve();
                }
            }, 1000);
        });
    }

    async function eseguiCicli(cicloIniziale = 1) {
        timerAttivo = true;
        for (let i = cicloIniziale; i <= cicli; i++) {
            if (!timerAttivo) break;
            cicloCorrente = i;

            await eseguiFase(durataStudioSecondi);
            if (!timerAttivo) break;
            mostraNotifica(presetsPomodoro.fineStudio.title, presetsPomodoro.fineStudio.options);

            if (i < cicli) {
                await eseguiFase(durataPausaSecondi);
                if (!timerAttivo) break;
                mostraNotifica(presetsPomodoro.finePausa.title, presetsPomodoro.finePausa.options);
            }
        }
        
        if (timerAttivo) {
            mostraNotifica(presetsPomodoro.sessionEnd.title, presetsPomodoro.sessionEnd.options);
            await aggiornaStatoEvento('COMPLETATO');
        }
        
        // Reset a fine ciclo o dopo fermaTutto
        timerAttivo = false;
        cicloCorrente = 0;
        aggiornaTempoVisualizzato(durataStudioSecondi);
        aggiornaDislocamento(durataStudioSecondi, durataStudioSecondi);
    }

    function fermaTutto() {
        timerAttivo = false;
        inPausa = false;
        clearInterval(intervallo); 
        aggiornaStatoEvento('INCOMPLETO');
        // Il reset viene gestito alla fine di eseguiCicli
    }

    async function aggiornaStatoEvento(status) {
        if (!eventId) return;

        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('status', status);

        await fetch('/calendario?/updateStatus', {
            method: 'POST',
            body: formData
        });
    }

    onMount(async ()=>{
        initNotifiche();
    });
</script>

{#if !pomData}
    <p>Caricamento dati Pomodoro...</p>
    <!-- Potresti aggiungere uno spinner di caricamento qui -->
    <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{:else}

<div
    class="container d-flex flex-column align-items-center justify-content-center"
    style="height: 100vh;"
>
    <button
        type="button"
        class="btn btn-primary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#settingsModal"
    >
        Impostazioni Timer
    </button>

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
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20" fill="black">{tempoVisualizzato}</text>
        {#if timerAttivo}
            <text x="50%" y="70%" text-anchor="middle" dy=".3em" font-size="10" fill="black">
                Ciclo: {cicloCorrente} / {cicli}
            </text>
        {/if}
    </svg>

    {#if !timerAttivo}
        <button
            type="button"
            class="btn p-5 m-2 rounded-circle"
            aria-label="Inizia Pomodoro"
            on:click={() => eseguiCicli()}
        >
            <img src={PlayIcon} alt="Inizia Pomodoro" />
        </button>
    {/if}

    {#if timerAttivo}
        <div class="d-flex justify-content-around">
            <button
                type="button"
                class="btn p-5 m-2 rounded-circle"
                aria-label="Pausa/Riprendi"
                on:click={() => (inPausa = !inPausa)}
            >
                {#if inPausa}
                    <img src={PlayIcon} alt="Riprendi Pomodoro" />
                {:else}
                    <img src={PauseIcon} alt="Metti in Pausa Pomodoro" />
                {/if}
            </button>
            <button
                type="button"
                class="btn p-5 m-2 rounded-circle"
                aria-label="Ferma Pomodoro"
                on:click={fermaTutto}
            >
                <img src={WhatsappIcon} alt="Ferma Pomodoro" />
            </button>
            <button
                type="button"
                class="btn p-5 m-2 rounded-circle"
                aria-label="Ricomincia Ciclo"
                on:click={() => {
                    clearInterval(intervallo); // CORRETTO: clearInterval
                    eseguiCicli(cicloCorrente);
                }}
            >
                <img src={WhatsappIcon} alt="Ricomincia Ciclo" />
            </button>
        </div>
    {/if}
</div>
{/if}

<style>
    .btn:hover {
        background-color: #e0e0e0;
    }
</style>

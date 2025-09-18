<script>
    import { onMount } from 'svelte';
    import WhatsappIcon from '$lib/assets/svgs/whatsapp.svg';
    import PlayIcon from '$lib/assets/svgs/playfill.svg';
    import PauseIcon from '$lib/assets/svgs/pause.svg';
    import { page } from '$app/stores';
    import FloatingButton from '$lib/components/btn.svelte';
    import PomodoroCard from '$lib/components/pomodoroCard.svelte';
    import PomodoroModal from '$lib/components/pomodoroModal.svelte';
    import { initNotifiche, mostraNotifica, presetsPomodoro } from '$lib/utils/notification.js'; // CORRETTO: 'notifications.js' (plurale)

    let { data } = $$props;
    let pomData = data.pomodoro[0];
    const eventId = $page.url.searchParams.get('eventId');

    // Dati iniziali dal DB
    let title = pomData.title;
    let cicli = pomData.cycles;

    // 1. Convertiamo le durate da Date a un numero intero di secondi una sola volta.
    const totaleStudioDate = new Date(pomData.timeStudy);
    const totalePausaDate = new Date(pomData.timeBreak);

    let durataStudioSecondi = totaleStudioDate.getMinutes() * 60 + totaleStudioDate.getSeconds();
    let durataPausaSecondi = totalePausaDate.getMinutes() * 60 + totalePausaDate.getSeconds();

    // 2. Usiamo una singola variabile per il conto alla rovescia.
    let secondiRimanenti = durataStudioSecondi;
    let faseCorrenteSecondi = durataStudioSecondi; // Per calcolare il dislocamento

    // Variabili di stato (invariate)
    let inPausa = false;
    let timerAttivo = false;
    let cicloCorrente = 0;
    let intervallo;

    // Variabili per l'interfaccia (invariate)
    let tempStudio = totaleStudioDate.getMinutes();
    let tempPausa = totalePausaDate.getMinutes();
    let r = 45;
    let c = 2 * Math.PI * r;
    let dislocamento = 0;
    let tempoVisualizzato;

    // 3. Le funzioni di aggiornamento ora lavorano con i secondi.
    function aggiornaTempoVisualizzato(totaleSecondi) {
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

    aggiornaTempoVisualizzato(secondiRimanenti);

    function eseguiFase(durataSecondi) {
        return new Promise((resolve) => {
            secondiRimanenti = durataSecondi;
            faseCorrenteSecondi = durataSecondi;
            aggiornaTempoVisualizzato(secondiRimanenti);
            aggiornaDislocamento(secondiRimanenti, faseCorrenteSecondi);

            intervallo = setInterval(() => {
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
            cicloCorrente = i;

            await eseguiFase(durataStudioSecondi);
            mostraNotifica(presetsPomodoro.fineStudio.title, presetsPomodoro.fineStudio.options);

            if (i < cicli) {
                await eseguiFase(durataPausaSecondi);
                mostraNotifica(presetsPomodoro.finePausa.title, presetsPomodoro.finePausa.options);
            }
        }

        mostraNotifica(presetsPomodoro.sessionEnd.title, presetsPomodoro.sessionEnd.options);
        timerAttivo = false;
        cicloCorrente = 0;
        console.log('Sessione terminata');
        aggiornaTempoVisualizzato(durataStudioSecondi);
        aggiornaDislocamento(durataStudioSecondi, durataStudioSecondi);
        await aggiornaStatoEvento('COMPLETATO');
    }

    function fermaTutto() {
        clearInterval(intervallo); 
        timerAttivo = false;
        inPausa = false;
        cicloCorrente = 0;
        secondiRimanenti = durataStudioSecondi;
        aggiornaTempoVisualizzato(secondiRimanenti);
        aggiornaDislocamento(secondiRimanenti, durataStudioSecondi);
        aggiornaStatoEvento('INCOMPLETO');
    }

    async function aggiornaStatoEvento(status) {
        if (!eventId) return; // Se non c'è un eventId, non fare nulla

        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('status', status);

        // Invia i dati all'azione 'updateStatus'
        await fetch('/calendario?/updateStatus', {
            method: 'POST',
            body: formData
        });
    }

    onMount(async ()=>{
        initNotifiche();
    });
</script>

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
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="studioTime" class="form-label">Tempo di Studio (minuti)</label>
                        <input type="number" class="form-control" id="studioTime" bind:value={tempStudio} min="1"/>
                    </div>
                    <div class="mb-3">
                        <label for="pausaTime" class="form-label">Tempo di Pausa (minuti)</label>
                        <input type="number" class="form-control" id="pausaTime" bind:value={tempPausa} min="1"/>
                    </div>
                    <div class="mb-3">
                        <label for="cicliCount" class="form-label">Numero di Cicli</label>
                        <input type="number" class="form-control" id="cicliCount" bind:value={cicli} min="1"/>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        data-bs-dismiss="modal"
                        on:click={() => {
                            durataStudioSecondi = tempStudio * 60;
                            durataPausaSecondi = tempPausa * 60;
                            fermaTutto();
                        }}
                    >
                        Salva Impostazioni
                    </button>
                </div>
            </div>
        </div>
    </div>

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

<style>
    .btn:hover {
        background-color: #e0e0e0;
    }
</style>
<script>
    import { timingStore } from '$lib/stores/timing.js';
    import { format } from 'date-fns'; 

    // 1. Questa variabile rimane il nostro "orologio" principale (oggetto Date)
    let currentTime = $derived($timingStore ? $timingStore : new Date());

    // 2. Creiamo due variabili separate per le stringhe degli input
    let dateInput = $state(format(currentTime, 'yyyy-MM-dd'));
    let timeInput = $state(format(currentTime, 'HH:mm'));

    // 3. Usiamo $effect per mantenere le stringhe sincronizzate con l'orologio
    // Funzione per applicare le modifiche allo store
    async function applyChanges() {
        const combinedString = `${dateInput}T${timeInput}`;
        const newDate = new Date(combinedString);
        
        if (!isNaN(newDate.getTime())) {
            // Aggiorna lo store locale (la UI sarà istantanea)
            timingStore.setTime(newDate);
            console.log("Nuovo orario impostato:", newDate);

            // INVIA IL NUOVO ORARIO AL SERVER
            try {
                await fetch('/api/virtual-time', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ virtualTime: newDate.toISOString() })
                });
            } catch (err) {
                console.error("Errore nel salvare l'orario sul server:", err);
            }
        }
    }

    // 3. Funzione per resettare e SALVARE il reset
    async function handleReset() {
        // Resetta lo store locale
        timingStore.resetTime();
        console.log($timingStore)

        try {
            await fetch('/api/virtual-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ virtualTime: null }) // Invia null per resettare
            });
        } catch (err) {
            console.error("Errore nel resettare l'orario sul server:", err);
        }
    }
</script>

<!-- Mobile First: Layout verticale su mobile -->
<div class="time-machine-container bg-dark text-light border-top border-secondary p-2 d-block d-lg-none">
    <div class="container-fluid">
        <!-- Riga 1: Titolo e orario corrente -->
        <div class="row g-1 mb-2">
            <div class="col-6">
                <div class="d-flex align-items-center">
                    <i class="bi bi-clock-history me-2"></i>
                    <small class="fw-bold">Time Machine</small>
                </div>
            </div>
            <div class="col-6">
                <div class="badge bg-secondary w-100 text-center small">
                    {format(currentTime, 'dd/MM HH:mm')}
                </div>
            </div>
        </div>
        
        <!-- Riga 2: Controlli -->
        <div class="row g-1">
            <div class="col-4">
                <input 
                    type="date" 
                    class="form-control form-control-sm" 
                    bind:value={dateInput} 
                />
            </div>
            <div class="col-3">
                <input 
                    type="time" 
                    class="form-control form-control-sm" 
                    bind:value={timeInput} 
                />
            </div>
            <div class="col-3">
                <button 
                    class="btn btn-primary btn-sm w-100" 
                    onclick={applyChanges}
                >
                    Applica
                </button>
            </div>
            <div class="col-2">
                <button 
                    class="btn btn-outline-secondary btn-sm w-100 p-1" 
                    onclick={handleReset}
                    title="Reset"
                >
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Desktop: Layout orizzontale centrato -->
<div class="time-machine-container bg-dark text-light border border-secondary rounded p-3 d-none d-lg-block mx-auto my-3">
    <div class="d-flex align-items-center gap-3 justify-content-center flex-wrap">
        <!-- Titolo -->
        <div class="d-flex align-items-center">
            <i class="bi bi-clock-history me-2"></i>
            <span class="fw-bold">Time Machine</span>
        </div>
        
        <!-- Orario corrente -->
        <div class="badge bg-secondary fs-6">
            {format(currentTime, 'dd/MM/yyyy HH:mm')}
        </div>
        
        <!-- Controlli -->
        <div class="d-flex gap-2">
            <input 
                type="date" 
                class="form-control form-control-sm" 
                bind:value={dateInput} 
                style="width: 150px;"
            />
            <input 
                type="time" 
                class="form-control form-control-sm" 
                bind:value={timeInput} 
                style="width: 120px;"
            />
        </div>
        
        <!-- Pulsanti -->
        <div class="d-flex gap-2">
            <button 
                class="btn btn-primary btn-sm" 
                onclick={applyChanges}
            >
                Applica
            </button>
            <button 
                class="btn btn-outline-secondary btn-sm" 
                onclick={handleReset}
                title="Reset all'ora reale"
            >
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    </div>
</div>

<style>
    .time-machine-container {
        max-width: 900px;
    }
    
    /* Mobile: occupa tutta la larghezza in basso */
    @media (max-width: 991px) {
        .time-machine-container {
            max-width: 100%;
        }
    }
</style>
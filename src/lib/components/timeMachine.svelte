<script>
    import { timingStore } from '$lib/stores/timing.js';
    import { format } from 'date-fns'; 

    // 1. Questa variabile rimane il nostro "orologio" principale (oggetto Date)
    let currentTime = $derived($timingStore);

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

<div class="p-3 shadow rounded position-fixed z-3 bg-black dimension-time-machine text-light">
    <h6 class="text-center mb-3">
        <i class="bi bi-clock-history"></i> Time Machine
    </h6>
    
    <div class="current-time-display text-center mb-3">
        <span class="badge bg-secondary fs-6">
            {format(currentTime, 'dd/MM/yyyy HH:mm')}
        </span>
    </div>

    <div class="controls d-flex gap-2 mb-2">
        <input 
            type="date" 
            class="form-control" 
            bind:value={dateInput} 
        />
        <input 
            type="time" 
            class="form-control" 
            bind:value={timeInput} 
        />
    </div>
    
    <div class="d-grid gap-2">
        <button 
            class="btn btn-primary" 
            onclick={applyChanges}
        >
            Applica
        </button>
        <button 
            class="btn btn-outline-secondary" 
            onclick={handleReset}
        >
            Reset all'ora reale
        </button>
    </div>
</div>

<style>
    .dimension-time-machine {
        bottom: 1rem;
        left: 1rem;
        width: 300px; /* Larghezza fissa per leggibilità */
    }
</style>
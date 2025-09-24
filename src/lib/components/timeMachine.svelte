<script>
    import { timingStore } from '$lib/stores/timing.js';
    import { format } from 'date-fns'; // Rimosso parse che non era usato
    import { get } from 'svelte/store';

    // Otteniamo il valore iniziale dallo store
    let currentTime = $state(($timingStore));
    
    // Variabili locali per gli input
    let dateInput = $state($timingStore)
    let timeInput = $state($timingStore)

    // Sottoscrizione allo store per aggiornamenti esterni
    $effect(() => {
        const unsubscribe = timingStore.subscribe(value => {
            currentTime = value;
            dateInput = format(value, 'yyyy-MM-dd');
            timeInput = format(value, 'HH:mm');
        });
        
        // Cleanup function
        return () => unsubscribe();
    });

    // Funzione per applicare le modifiche allo store
    function applyChanges() {
        // Combiniamo data e ora dalle stringhe degli input in un unico oggetto Date
        const combinedString = `${dateInput}T${timeInput}`;
        const newDate = new Date(combinedString);
        
        // Verifichiamo che la data sia valida
        if (!isNaN(newDate.getTime())) {
            timingStore.setTime(newDate);
        } else {
            console.error('Data non valida');
        }
    }

    // Funzione per il reset
    function handleReset() {
        timingStore.resetTime();
    }
</script>

<div class="p-3 shadow rounded position-fixed z-3 bg-black dimension-time-machine text-light">
    <h6 class="text-center mb-3">
        <i class="bi bi-clock-history"></i> Time Machine
    </h6>
    
    <div class="current-time-display text-center mb-3">
        <span class="badge bg-secondary fs-6">
            {format(currentTime, 'dd/MM/yyyy HH:mm:ss')}
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
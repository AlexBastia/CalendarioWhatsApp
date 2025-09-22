<script>
	import { form } from '$app/server';
    import {timingStore} from '$lib/stores/timingStore.js';
    import { format, parse } from "date-fns";
    
    let timeInput = format($timingStore, "HH:mm");
    let dateInput = format($timingStore, "yyyy-MM-dd");

    // appllicare modifiche allo store quando si cambia l'input
    function updateStore

</script>

<div class="d-flex gap-2">
    <div class="col">
        <label for="time" class="form-label">Ora</label>
        <input 
            type="time" 
            id="time" 
            class="form-control" 
            bind:value={timeInput} 
            on:change={() => updateStore()}
            >
    </div>
    <div class="col">
        <label for="date" class="form-label">Data</label>
        <input 
            type="date" 
            id="date" 
            class="form-control" 
            bind:value={dateInput} 
            on:change={() => updateStore()}
            >
    </div>

</div>
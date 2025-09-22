<script>
    import { goto } from '$app/navigation';
    // Definiamo le "props" che il componente può ricevere
    export let event = {
        // Valori di default per un evento nuovo
        title: '',
        note: '',
        allDay: false,
        eventType: 'STANDARD',
        place: 'Villaggio della Foglia'
    };
    export let formAction;
    export let pomodoroPresets = [];
</script>

<form method="POST" action={formAction}>
    {#if event._id}
        <input name="id" type="hidden" value={event._id} />
    {/if}

    <div class="form-row">
        <div class="col-md-4 mb-3">
            <label for="title">Titolo evento</label>
            <input type="text" class="form-control" id="title" name="title" placeholder="Titolo" bind:value={event.title} required>
        </div>
        <div class="col-md-4 mb-3">
            <label for="note">Descrizione</label>
            <input type="text" class="form-control" id="note" name="note" placeholder="Descrizione" bind:value={event.note}>
        </div>
    </div>

    <div class="mb-3">
        <label for="eventType" class="form-label">Tipo di Evento</label>
        <select class="form-select" name="eventType" bind:value={event.eventType}>
            <option value="STANDARD">Standard</option>
            <option value="POMODORO">Pomodoro</option>
        </select>
    </div>

    {#if event.eventType === 'POMODORO'}
        <div class="mb-3">
            <label for="pomodoroPreset" class="form-label">Preset Pomodoro</label>
            <select class="form-select" name="pomodoroPreset" bind:value={event.pomodoroPreset} required>
                <option value="" disabled selected>Scegli un preset...</option>
                {#each pomodoroPresets as preset}
                    <option value={preset._id}>{preset.title}</option>
                {/each}
            </select>
        </div>
    {/if}

    <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="allDay" name="allDay" bind:checked={event.allDay}>
        <label class="form-check-label" for="allDay">Tutto il giorno</label>
    </div>

    <div class="row">
        <div class="col-md-4 mb-3">
            <label for="dateStart" class="form-label">Data inizio</label>
            <input type="date" id="dateStart" name="dateStart" class="form-control" bind:value={event.dateStart} required>
            <input type="time" id="timeStart" name="timeStart" disabled={event.allDay}>
        </div>
        <div class="col-md-4 mb-3">
            <label for="timeEnd" class="form-label">Ora fine</label>
            <input type="time" id="timeEnd" name="timeEnd" disabled={event.allDay}>
        </div>
    </div>

    <div class="form-row">
        <div class="col-md-6 mb-3">
            <label for="location">Posto</label>
            <input type="text" class="form-control" id="location" name="location" placeholder="Posto" bind:value={event.place} required>
        </div>
    </div>

    <div class="d-flex align-items-center gap-2 mt-4">
        <button class="btn btn-primary" type="submit">Salva Evento</button>

        {#if event.eventType === 'POMODORO' && event._id}
            <button type="button" class="btn btn-success" on:click={() => goto(`/pomodoro/${event.pomodoroPreset}?eventId=${event._id}`)}>
                Avvia Sessione Pomodoro
            </button>
        {/if}
    </div>

</form>
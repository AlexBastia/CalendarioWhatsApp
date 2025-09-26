<script>
    import { goto } from '$app/navigation';
    import { timingStore } from '$lib/stores/timing';
    // Definiamo le "props" che il componente può ricevere

    let {event = {
        // Valori di default per un evento nuovo
        _id: null,
        title: '',
        note: '',
        allDay: false,
        eventType: 'STANDARD',
        place: '',
        dateStart: $timingStore? $timingStore: new Date().toISOString().slice(0, 10), // Default a oggi
        timeStart: '09:00',
        timeEnd: '10:00'
    }, formAction, pomodoroPresets = []} = $props();

    // Funzione per gestire l'annullamento, torna alla pagina precedente o a una home
    function handleCancel() {
        // Puoi personalizzare il redirect, ad esempio a '/calendario'
        history.back();
    }
</script>

<div class="card shadow-sm">
    <div class="card-header bg-light">
        <h4 class="my-1">{#if event._id}Modifica Evento{:else}Crea Nuovo Evento{/if}</h4>
    </div>
    <div class="card-body">
        <form method="POST" action={formAction} class="needs-validation" novalidate>
            {#if event._id}
                <input name="id" type="hidden" value={event._id} />
            {/if}

            <div class="row g-3">
                <div class="col-12">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="title" name="title" placeholder="Titolo dell'evento" bind:value={event.title} required>
                        <label for="title">Titolo</label>
                    </div>
                </div>
                <div class="col-12">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="note" name="note" placeholder="Aggiungi una descrizione" bind:value={event.note}>
                        <label for="note">Descrizione (opzionale)</label>
                    </div>
                </div>

                <hr class="my-3">

                <div class="col-md-6">
                    <div class="form-floating">
                        <select class="form-select" id="eventType" name="eventType" bind:value={event.eventType}>
                            <option value="STANDARD">📅 Evento Standard</option>
                            <option value="POMODORO">🍅 Sessione Pomodoro</option>
                        </select>
                        <label for="eventType">Tipo di Evento</label>
                    </div>
                </div>

                {#if event.eventType === 'POMODORO'}
                    <div class="col-md-6">
                        <div class="form-floating">
                            <select class="form-select" id="pomodoroPreset" name="pomodoroPreset" bind:value={event.pomodoroPreset} required>
                                <option value="" disabled selected>Scegli un preset...</option>
                                {#each pomodoroPresets as preset}
                                    <option value={preset._id}>{preset.title}</option>
                                {/each}
                            </select>
                            <label for="pomodoroPreset">Preset Pomodoro</label>
                        </div>
                    </div>
                {/if}
                
                <div class="col-12">
                    <div class="form-floating">
                        <input type="text" class="form-control" id="location" name="location" placeholder="Es: Aula 2.3, Casa, Online" bind:value={event.place} required>
                        <label for="location">Luogo</label>
                    </div>
                </div>

                <hr class="my-3">

                <div class="col-12">
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="allDay" name="allDay" bind:checked={event.allDay}>
                        <label class="form-check-label" for="allDay">Tutto il giorno</label>
                    </div>
                </div>

                <div class="col-md-5">
                    <label for="dateStart" class="form-label">Data</label>
                    <input type="date" id="dateStart" name="dateStart" class="form-control form-control-lg" bind:value={event.dateStart} required>
                </div>

                <div class="col-md-3">
                    <label for="timeStart" class="form-label">Inizio</label>
                    <input type="time" id="timeStart" name="timeStart" class="form-control form-control-lg" bind:value={event.timeStart} disabled={event.allDay}>
                </div>

                <div class="col-md-3">
                    <label for="timeEnd" class="form-label">Fine</label>
                    <input type="time" id="timeEnd" name="timeEnd" class="form-control form-control-lg" bind:value={event.timeEnd} disabled={event.allDay}>
                </div>
            </div>

            <hr class="my-4">
            <div class="d-flex justify-content-end align-items-center gap-2">
                <button type="button" class="btn btn-secondary" onclick={handleCancel}>Annulla</button>

                {#if event.eventType === 'POMODORO' && event._id}
                    <button type="button" class="btn btn-success" onclick={() => goto(`/pomodoro/${event.pomodoroPreset}?eventId=${event._id}`)}>
                        <i class="bi bi-play-circle-fill me-2"></i>Avvia Sessione
                    </button>
                {/if}

                <button class="btn btn-primary" type="submit">
                    <i class="bi bi-check-lg me-2"></i>Salva Evento
                </button>
            </div>
        </form>
    </div>
</div>
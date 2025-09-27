<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { timingStore } from '$lib/stores/timing';

  // props
  let {
    event = {
      _id: null,
      title: '',
      note: '',
      allDay: false,
      eventType: 'STANDARD',
      place: '',
      dateStart: '', // inizializziamo dopo
      timeStart: '09:00',
      timeEnd: '10:00',
      pomodoroPreset: null
    },
    formAction,
    pomodoroPresets = [],
    deleteAction
  } = $props();



  // variabile locale reattiva su cui bindare
  let e = $state({ ...event });

  function handleCancel() {
    history.back();
  }
</script>

<div class="card shadow-sm">
  <div class="card-header bg-light">
    <h4 class="my-1">{#if e._id}Modifica Evento{:else}Crea Nuovo Evento{/if}</h4>
  </div>

  <div class="card-body">
    <!-- MAIN FORM: bind sui campi locali 'e' -->
    <form method="POST" action={formAction} class="needs-validation" novalidate >
      {#if e._id}
        <input name="id" type="hidden" value={e._id} />
      {/if}

      <div class="row g-3">
        <div class="col-12">
          <div class="form-floating">
            <input type="text" class="form-control" id="title" name="title" placeholder="Titolo" bind:value={e.title} required />
            <label for="title">Titolo</label>
          </div>
        </div>

        <div class="col-12">
          <div class="form-floating">
            <input type="text" class="form-control" id="note" name="note" placeholder="Descrizione" bind:value={e.note} />
            <label for="note">Descrizione (opzionale)</label>
          </div>
        </div>

        <hr class="my-3" />

        <div class="col-md-6">
          <div class="form-floating">
            <!-- bind su e.eventType (variabile locale) -->
            <select class="form-select" id="eventType" name="eventType" bind:value={e.eventType}>
              <option value="STANDARD">📅 Evento Standard</option>
              <option value="POMODORO">🍅 Sessione Pomodoro</option>
            </select>
            <label for="eventType">Tipo di Evento</label>
          </div>
        </div>

        {#if e.eventType === 'POMODORO'}
          <div class="col-md-6">
            <div class="form-floating">
              <select class="form-select" id="pomodoroPreset" name="pomodoroPreset" bind:value={e.pomodoroPreset} required>
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
            <input type="text" class="form-control" id="location" name="location" placeholder="Luogo" bind:value={e.place} required />
            <label for="location">Luogo</label>
          </div>
        </div>

        <hr class="my-3" />

        <div class="col-12">
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="allDay" name="allDay" bind:checked={e.allDay} />
            <label class="form-check-label" for="allDay">Tutto il giorno</label>
          </div>
        </div>

        <div class="col-md-5">
          <label for="dateStart" class="form-label">Data</label>
          <input type="date" id="dateStart" name="dateStart" class="form-control form-control-lg" bind:value={e.dateStart} required />
        </div>

        <div class="col-md-3">
          <label for="timeStart" class="form-label">Inizio</label>
          <input type="time" id="timeStart" name="timeStart" class="form-control form-control-lg" bind:value={e.timeStart} disabled={e.allDay} />
        </div>

        <div class="col-md-3">
          <label for="timeEnd" class="form-label">Fine</label>
          <input type="time" id="timeEnd" name="timeEnd" class="form-control form-control-lg" bind:value={e.timeEnd} disabled={e.allDay} />
        </div>
      </div>

      <hr class="my-4" />
      <div class="d-flex justify-content-end align-items-center gap-2">
        <button type="button" class="btn btn-secondary" on:click={handleCancel}>Annulla</button>

        {#if e.eventType === 'POMODORO' && e._id}
          <button type="button" class="btn btn-success" on:click={() => goto(`/pomodoro/${e.pomodoroPreset}?eventId=${e._id}`)}>
            <i class="bi bi-play-circle-fill me-2"></i>Avvia Sessione
          </button>
        {/if}

        <button class="btn btn-primary" type="submit">
          <i class="bi bi-check-lg me-2"></i>Salva Evento
        </button>
      </div>
    </form>

    {#if e._id}
      <div class="mt-3 d-flex justify-content-end">
        <!-- action deve essere passato come valore (senza virgolette) -->
        <form action={deleteAction} method="POST">
          <input type="hidden" name="id" value={e._id} />
          <button type="submit" class="btn btn-danger">
            <i class="bi bi-trash me-1"></i>Elimina
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>

<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { timingStore } from '$lib/stores/timing';

<<<<<<< HEAD
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
=======
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
        timeEnd: '10:00',
        ripetizione: {
            isRepeatable: false,
            frequenza: '',
            giorniSettimana: [],
            nthWeekday: { week: null, weekday: null },
            endCondition: { type: 'MAI', nVolte: null, lastDate: '' }
        }
        
    }, formAction, pomodoroPresets = []} = $props();
    // Funzione per gestire l'annullamento, torna alla pagina precedente o a una home
    function handleCancel() {
        // Puoi personalizzare il redirect, ad esempio a '/calendario'
        history.back();
    }
    // reset campi non rilevanti
    $effect(() => {
        if (!event.ripetizione.isRepeatable) {
            event.ripetizione.frequenza = '';
            event.ripetizione.giorniSettimana = [];

            if (event.ripetizione.monthlyMode === 'nthWeekday' && event.dateStart) {
                const date = new Date(event.dateStart);
                event.ripetizione.nthWeekday.weekday = date.getDay();
                event.ripetizione.nthWeekday.week = Math.ceil(date.getDate() / 7);
            }

            event.ripetizione.endCondition = { 
                type: 'MAI', 
                nVolte: null, 
                lastDate: '' 
            };
        }

        if (event.ripetizione.frequenza !== 'SETTIMANALE') {
            event.ripetizione.giorniSettimana = [];
        }
    });

>>>>>>> 7b57e11761663d9be02e694b73c867e1383db5c9
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

<<<<<<< HEAD
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
=======
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
                
                <div class="col-12">
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="isRepeatable" name="isRepeatable" bind:checked={event.ripetizione.isRepeatable}>
                        <label class="form-check-label" for="isRepeatable">Evento ricorrente</label>
                    </div>
                </div>


                {#if event.ripetizione.isRepeatable}
                    <div class="col-md-6">
                        <div class="form-floating">
                            <select class="form-select" id="frequenza" name="frequenza" bind:value={event.ripetizione.frequenza} required>
                                <option value="" disabled selected>Scegli la frequenza...</option>
                                <option value="GIORNALIERO">Ogni giorno</option>
                                <option value="SETTIMANALE">Ogni settimana</option>
                                <option value="MENSILE">Ogni mese</option>
                                <option value="ANNUALE">Ogni anno</option>
                            </select>
                            <label for="frequenza">Frequenza</label>
                        </div>
                    </div>     

                    {#if event.ripetizione.frequenza === 'SETTIMANALE'}
                        <fieldset class="col-12">
                            <legend class="form-label">Giorni della settimana</legend>
                            <div class="d-flex gap-2 flex-wrap">
                                {#each ['D','L','M','M','G','V','S'] as day, i}
                                    <div class="form-check">
                                        <input
                                            type="checkbox"
                                            class="form-check-input"
                                            id={`day${i}`}
                                            value={i}
                                            onchange={(e) => {
                                                if (e.currentTarget.checked) {
                                                    event.ripetizione.giorniSettimana = [
                                                        ...event.ripetizione.giorniSettimana,
                                                        i
                                                    ];
                                                } else {
                                                    event.ripetizione.giorniSettimana =
                                                        event.ripetizione.giorniSettimana.filter(
                                                            (d) => d !== i
                                                        );
                                                }
                                            }}
                                            checked={event.ripetizione.giorniSettimana.includes(i)}
                                        />
                                        <label for={`day${i}`} class="form-check-label">{day}</label>
                                    </div>
                                {/each}
                            </div>
                        </fieldset>
                    {/if}

                    {#if event.ripetizione.frequenza === 'MENSILE'}
                        <fieldset class="mb-3">
                        <legend class="form-label">Ripetizione mensile</legend>

                        <div class="form-check">
                            <input 
                            class="form-check-input"
                            type="radio"
                            id="monthlyDayOfMonth"
                            name="monthlyMode"
                            value="dayOfMonth"
                            bind:group={event.ripetizione.monthlyMode}
                            />
                            <label class="form-check-label" for="monthlyDayOfMonth">
                            Ogni {new Date(event.dateStart).getDate()} del mese
                            </label>
                        </div>

                        <div class="form-check">
                            <input 
                            class="form-check-input"
                            type="radio"
                            id="monthlyNthWeekday"
                            name="monthlyMode"
                            value="nthWeekday"
                            bind:group={event.ripetizione.monthlyMode}
                            />
                            <label class="form-check-label" for="monthlyNthWeekday">
                            Ogni 
                            {Math.ceil(new Date(event.dateStart).getDate() / 7)}°
                            {['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'][new Date(event.dateStart).getDay()]}
                            del mese
                            </label>
                        </div>
                        </fieldset>

                    {/if}


                    <div class="col-md-6">
                        <div class="form-floating">
                            <select class="form-select" id="endType" name="endType" bind:value={event.ripetizione.endCondition.type}>
                                <option value="MAI">Mai</option> <!-- Fixed: was "NEVER" -->
                                <option value="N_VOLTE">Dopo N occorrenze</option> <!-- Fixed: was "AFTER" -->
                                <option value="FINO AL">Fino a data</option> <!-- Fixed: was "UNTIL" -->
                            </select>
                            <label for="endType">Termina</label>
                        </div>
                    </div>

                    {#if event.ripetizione.endCondition.type === 'N_VOLTE'} <!-- Fixed -->
                        <div class="col-md-6">
                            <div class="form-floating">
                                <input type="number" min="1" class="form-control" id="nVolte" name="nVolte"
                                    bind:value={event.ripetizione.endCondition.nVolte}> <!-- Fixed: was count -->
                                <label for="nVolte">Numero di ripetizioni</label>
                            </div>
                        </div>
                    {/if}

                    {#if event.ripetizione.endCondition.type === 'FINO AL'} <!-- Fixed -->
                        <div class="col-md-6">
                            <div class="form-floating">
                                <input type="date" class="form-control" id="endDate" name="endDate"
                                    bind:value={event.ripetizione.endCondition.endDate}> <!-- Fixed: was until -->
                                <label for="endDate">Data fine</label>
                            </div>
                        </div>
                    {/if}   
                {/if}

>>>>>>> 7b57e11761663d9be02e694b73c867e1383db5c9
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

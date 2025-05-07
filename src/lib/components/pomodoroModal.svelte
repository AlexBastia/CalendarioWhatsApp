<script>
    import { enhance } from '$app/forms'; // Per progressive enhancement con SvelteKit
    import {onDestroy} from 'svelte'; // Per la pulizia del backdrop del modale

    // Rimuove il backdrop del modale quando il componente viene distrutto
    onDestroy(() => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    });
  
    /** L'ID univoco per il modale Bootstrap (es. "createPomodoro") */
    export let id;
  
    /** Il titolo da visualizzare nell'header del modale (es. "Crea Pomodoro") */
    export let titleModal;
  
    /** L'URL a cui il form invierà i dati */
    export let formAction;
  
    /** Il metodo HTTP per l'invio del form (default: "POST") */
    export let formMethod = 'POST';
  
    // Valori per i campi del form, con nomi allineati alle aspettative del server.
    // Questi default sono adatti per la creazione. Per la modifica,
    // passerai i valori esistenti come props.
  
    /** Titolo della sessione Pomodoro (corrisponde a `name="title"` nel form) */
    export let title = '';
    /** Durata della sessione di studio in minuti (corrisponde a `name="timeStudy"` nel form) */
    export let timeStudy = 25; // Precedentemente tempStudio
    /** Durata della pausa in minuti (corrisponde a `name="timeBreak"` nel form) */
    export let timeBreak = 5;   // Precedentemente tempPausa
    /** Numero di cicli studio/pausa (corrisponde a `name="cycles"` nel form) */
    export let cicli = 4;
  
    /** Testo per il pulsante di submit del form (default: "Salva") */
    export let submitButtonText = 'Salva';
  
    // Genera ID univoci per gli elementi del form per l'accessibilità (aria-labelledby, label for)
    const modalLabelId = `${id}Label`;
    const inputTitleId = `${id}-title`;
    const inputTimeStudyId = `${id}-timeStudy`; // Aggiornato da inputTempStudioId
    const inputTimeBreakId = `${id}-timeBreak`;   // Aggiornato da inputTempPausaId
    const inputCicliId = `${id}-cicli`;
  
    
  </script>
  
  <div class="modal fade" id={id} tabindex="-1" aria-labelledby={modalLabelId} aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id={modalLabelId}>{titleModal}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form method={formMethod} action={formAction} use:enhance>
          <div class="modal-body">
            <div class="mb-3">
              <label for={inputTitleId} class="form-label">Titolo sessione</label>
              <input type="text" class="form-control" id={inputTitleId} name="title" bind:value={title} required placeholder="Es. Studio Sviluppo Web" />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for={inputTimeStudyId} class="form-label">Tempo studio (minuti)</label>
                <input type="number" class="form-control" id={inputTimeStudyId} name="timeStudy" bind:value={timeStudy} min="1" required />
              </div>
              <div class="col-md-6 mb-3">
                <label for={inputTimeBreakId} class="form-label">Tempo pausa (minuti)</label>
                <input type="number" class="form-control" id={inputTimeBreakId} name="timeBreak" bind:value={timeBreak} min="1" required />
              </div>
            </div>
            <div class="mb-3">
              <label for={inputCicliId} class="form-label">Numero di cicli</label>
              <input type="number" class="form-control" id={inputCicliId} name="cycles" bind:value={cicli} min="1" required />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button type="submit" class="btn btn-primary">{submitButtonText}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <style>
    /* Eventuali stili specifici per questo modale, se necessari.
       Bootstrap dovrebbe già gestire la maggior parte dello styling. */
    .form-label {
      font-weight: 500;
    }
  </style>
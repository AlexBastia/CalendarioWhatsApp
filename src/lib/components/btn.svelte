<script>
    /**
     * L'etichetta ARIA per il pulsante, importante per l'accessibilità.
     * @type {string}
     * @default "Attiva azione"
     */
    export let ariaLabel = "Attiva azione";
  
    /**
     * Il selettore CSS per il modale Bootstrap da attivare (es. "#createPomodoro" o ".my-modal-class").
     * Questo è un attributo obbligatorio per il corretto funzionamento del pulsante.
     * @type {string}
     * @required
     */
    export let modalTarget;
  
    // Un piccolo controllo per assicurarsi che modalTarget sia fornito durante l'uso del componente
    if (!modalTarget) {
      console.warn(
        "Componente FloatingButton: la prop 'modalTarget' è richiesta ma non è stata fornita. Il pulsante potrebbe non funzionare come previsto."
      );
    }
  </script>
  
  <div class="position-fixed" style="bottom: 1em; right: 0.6em; z-index: 1050;"> 
    <div class="btn-group float-end">
      <button
        type="button"
        class="btn text-primary bg-light rounded-circle p-0"
        style="font-size: 4em; line-height: 64px;"
        aria-label={ariaLabel}
        data-bs-toggle="modal"
        data-bs-target={modalTarget}
        disabled={!modalTarget}
      >
        <i class="bi bi-plus-circle-fill"></i>
      </button>
    </div>
  </div>
    
<style>
    button:disabled {
      cursor: not-allowed;
    }
</style>
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
    /*
      La combinazione di classi Bootstrap (`rounded-circle`, `p-0`) e gli stili inline
      (`font-size: 4em; line-height: 64px;`) dovrebbe rendere il pulsante circolare
      e dimensionato correttamente attorno all'icona.
      L'icona `bi-plus-circle-fill` dovrebbe scalare con `font-size`.
      `line-height: 64px` imposta l'altezza del box del pulsante a 64px.
      Se `font-size: 4em` (assumendo un font base di 16px, quindi 64px) fa sì che l'icona
      sia larga e alta 64px, il pulsante sarà un cerchio perfetto.
      Questo è il comportamento tipico per le icone Bootstrap.
    */
    button:disabled {
      cursor: not-allowed;
      /* Bootstrap dovrebbe già applicare stili per i pulsanti disabilitati,
         ma puoi aggiungere ulteriori personalizzazioni qui se necessario. */
    }
  </style>
<script>
    /** Titolo del Pomodoro */
    export let title;
    /** Stringa che descrive la durata della sessione di studio (es. "25 minuti") */
    export let durata;
    /** Stringa che descrive la durata della pausa (es. "5 minuti") */
    export let pausa;
    /** Numero di cicli */
    export let cicli;
    /** Funzione da eseguire al click sulla card (es. per navigazione) */
    export let onClick = () => {};
    /** Classe dell'icona principale della card (es. "bi-clock-fill") */
    export let icon = '';
    /** Funzione da eseguire per modificare il Pomodoro */
    export let onEdit = () => {};
    /** Funzione da eseguire per eliminare il Pomodoro */
    export let onDelete = () => {};
  </script>
  
  <div class="card h-100 pomodoro-card shadow-sm">
    <button
      type="button"
      class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2 p-1 pomodoro-card-action-btn delete-btn"
      aria-label="Elimina Pomodoro"
      title="Elimina Pomodoro"
      on:click|stopPropagation={onDelete}
    >
      <i class="bi bi-trash-fill" style="font-size: 1rem;"></i>
    </button>
  
    <div
      class="card-body d-flex flex-column"
      on:click={onClick}
      on:keydown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabindex="0"
      aria-label={`Dettagli per ${title}`}
    >
      <div class="flex-grow-1 mb-3">
        <h5 class="card-title mb-3 text-primary">
          {#if icon}<i class="bi {icon} me-2"></i>{/if}
          {title}
        </h5>
        <p class="card-text small mb-1">
          <i class="bi bi-play-circle-fill me-1 text-success"></i>
          <strong>Studio:</strong> {durata}
        </p>
        <p class="card-text small mb-1">
          <i class="bi bi-pause-circle-fill me-1 text-warning"></i>
          <strong>Pausa:</strong> {pausa}
        </p>
        <p class="card-text small mb-0">
          <i class="bi bi-arrow-repeat me-1 text-info"></i>
          <strong>Cicli:</strong> {cicli}
        </p>
      </div>
  
      <div class="mt-auto text-end">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary pomodoro-card-action-btn edit-btn"
          on:click|stopPropagation={onEdit}
          aria-label="Modifica Pomodoro"
          title="Modifica Pomodoro"
        >
          <i class="bi bi-pencil-square me-1"></i>Modifica
        </button>
      </div>
    </div>
  </div>
  
  <style>
    .pomodoro-card {
      transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
      border-radius: 0.5rem; /* Angoli leggermente più arrotondati */
      /* position: relative; è implicito per .card ma meglio esserne sicuri per l'absolute positioning dei figli */
    }
  
    .pomodoro-card .card-body {
      /* Aggiunge padding in alto per non sovrapporsi al pulsante elimina */
      /* Il pulsante è m-2 (0.5rem) e p-1. Un po' di spazio in più. */
      padding-top: 2.8rem;
      cursor: pointer; /* Indica che l'area è cliccabile */
    }
  
    .pomodoro-card:hover,
    .pomodoro-card:focus-within { /* focus-within per accessibilità da tastiera */
      transform: translateY(-4px);
      box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.12), 0 0.1rem 0.3rem rgba(0,0,0,0.08) !important;
    }
  
    .pomodoro-card:active {
      transform: translateY(-2px);
      box-shadow: 0 0.2rem 0.4rem rgba(0,0,0,0.1) !important;
    }
  
    .pomodoro-card-action-btn {
      z-index: 2; /* Assicura che i pulsanti siano sopra altro contenuto se ci fossero sovrapposizioni */
      transition: background-color 0.15s ease-out, border-color 0.15s ease-out;
    }
  
    .pomodoro-card-action-btn.delete-btn {
      /* Stile più discreto per il cestino, ma visibile */
      background-color: rgba(255, 255, 255, 0.7); /* Leggera trasparenza se sopra immagini/colori */
      backdrop-filter: blur(2px); /* Effetto frosted glass se il browser supporta */
    }
    .pomodoro-card-action-btn.delete-btn:hover {
      background-color: var(--bs-danger);
      color: white;
      border-color: var(--bs-danger-border-subtle) !important;
    }
    .pomodoro-card-action-btn.edit-btn:hover {
       background-color: var(--bs-secondary);
       color: white;
    }
  
  
    .card-title {
      font-weight: 500; /* Un po' meno bold del default h5 per un look più pulito */
    }
  
    .card-text.small {
      color: #555; /* Testo leggermente più scuro per leggibilità */
      display: flex; /* Per allineare icona e testo */
      align-items: center; /* Allinea verticalmente icona e testo */
    }
    .card-text.small i {
      font-size: 0.9em; /* Icone leggermente più piccole del testo */
      margin-right: 0.4em !important;
    }
    .card-text.small strong {
      margin-right: 0.3em;
      font-weight: 500;
    }
  </style>
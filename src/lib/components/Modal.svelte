<script>
  import { onMount, onDestroy } from 'svelte';

  export let id;
  export let title = 'Titolo Modale';

  let modalElement;
  let modalInstance = null;

  onMount(() => {
    if (typeof bootstrap !== 'undefined' && modalElement) {
      modalInstance = new bootstrap.Modal(modalElement);

      // Assicuriamoci di ripulire correttamente al termine della chiusura
      modalElement.addEventListener('hidden.bs.modal', () => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
      });
    }
  });

  export function show() {
    if (!modalInstance || !modalElement) return;
    try {
      modalInstance.show();
    } catch (e) {
      console.warn('Modal show failed', e);
    }
  }

  export function hide({ disableFadeBeforeHide = true } = {}) {
    // Se non c'è l'istanza, esci subito
    if (!modalInstance) return;

    // Se necessario, rimuoviamo la classe fade così lo hide() è sincrono senza animazione
    // utile per evitare che il modal venga smontato mentre è in transizione
    try {
      if (disableFadeBeforeHide && modalElement && modalElement.classList.contains('fade')) {
        modalElement.classList.remove('fade');
      }
    } catch (e) {
      // ignore
    }

    try {
      modalInstance.hide();
    } catch (e) {
      // Se Bootstrap fallisce (es. elemento già rimosso), eseguiamo una pulizia di fallback
      console.warn('Modal hide failed, doing fallback cleanup', e);
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(b => b.remove());
      document.body.classList.remove('modal-open');
    }
  }

  onDestroy(() => {
    try {
      if (modalInstance) {
        try { modalInstance.dispose(); } catch(e){ /* ignore */ }
        modalInstance = null;
      }
    } finally {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(b => b.remove());
      document.body.classList.remove('modal-open');
    }
  });
</script>

<div class="modal fade" id={id} tabindex="-1" aria-labelledby={`${id}Label`} aria-hidden="true" bind:this={modalElement}>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id={`${id}Label`}>{title}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
        </slot>
      </div>
    </div>
  </div>
</div>

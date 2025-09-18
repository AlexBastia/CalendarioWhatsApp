<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';

	// Props esistenti (invariate)
	export let id;
	export let titleModal;
	export let formAction;
	export let formMethod = 'POST';
	export let title = '';
	export let timeStudy = 25;
	export let timeBreak = 5;
	export let cicli = 4;
	export let submitButtonText = 'Salva';

    let modalElement;
    let modalInstance = null;

    // 3. Aggiungi onMount per creare l'istanza del modale
    onMount(() => {
        if (typeof bootstrap !== 'undefined' && modalElement) {
            modalInstance = new bootstrap.Modal(modalElement);
        }
    });

    // 4. Aggiungi onDestroy come rete di sicurezza per la pulizia
    onDestroy(() => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
    });



</script>

<div class="modal fade" {id} tabindex="-1" aria-labelledby="{id}Label" aria-hidden="true" bind:this={modalElement}>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="{id}Label">{titleModal}</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<form method={formMethod} action={formAction} use:enhance={() => {

                return async ({ result, update }) => {

            // 1. Controlliamo se il server ha risposto con un redirect
            if (result.type === 'redirect') {
                // 2. QUESTO è il momento perfetto per la pulizia.
                // La risposta è arrivata, ma la navigazione non è ancora partita.
                if (modalInstance) {
                    modalInstance.hide();
                }
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                document.body.classList.remove('modal-open');
            }

            // 3. Ora diciamo a SvelteKit di procedere con l'aggiornamento/redirect
            await update();
        };

      }}>
				<div class="modal-body">
					<div class="mb-3">
						<label for="{id}-title" class="form-label">Titolo sessione</label>
						<input type="text" class="form-control" id="{id}-title" name="title" bind:value={title} required />
					</div>
					<div class="row">
						<div class="col-md-6 mb-3">
							<label for="{id}-timeStudy" class="form-label">Tempo studio (minuti)</label>
							<input type="number" class="form-control" id="{id}-timeStudy" name="timeStudy" bind:value={timeStudy} min="1" required />
						</div>
						<div class="col-md-6 mb-3">
							<label for="{id}-timeBreak" class="form-label">Tempo pausa (minuti)</label>
							<input type="number" class="form-control" id="{id}-timeBreak" name="timeBreak" bind:value={timeBreak} min="1" required />
						</div>
					</div>
					<div class="mb-3">
						<label for="{id}-cicli" class="form-label">Numero di cicli</label>
						<input type="number" class="form-control" id="{id}-cicli" name="cycles" bind:value={cicli} min="1" required />
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
	.form-label {
		font-weight: 500;
	}
</style>
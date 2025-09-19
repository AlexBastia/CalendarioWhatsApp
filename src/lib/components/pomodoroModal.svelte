<script>
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	// 1. Importiamo la funzione che abbiamo creato
	import { suggerisciCicli } from '$lib/utils/timePlanning.js';

	export let id;
	export let titleModal;
	export let formAction;
	export let formMethod = 'POST';
	export let title = '';
	export let timeStudy = 25;
	export let timeBreak = 5;
	export let cicli = 4;
	export let submitButtonText = 'Salva';

	let modal;

	// --- LOGICA AGGIUNTA PER IL PIANIFICATORE ---
	let minutiInput = 120; // Valore di default per l'input dei minuti
	let suggerimenti = []; // Array per contenere i suggerimenti generati

	function calcolaSuggerimenti() {
		suggerimenti = suggerisciCicli(minutiInput);
	}

	/**
	 * Applica un suggerimento, aggiornando i valori del form
	 * @param {import('$lib/utils/pomodoroPlanner.js').Suggerimento} proposta
	 */
	function applicaSuggerimento(proposta) {
		timeStudy = proposta.studio;
		timeBreak = proposta.pausa;
		cicli = proposta.cicli;
	}
	// --- FINE LOGICA AGGIUNTA ---

	export function show() {
		modal.show();
	}

	export function hide() {
		modal.hide();
	}
</script>

<Modal {id} title={titleModal} bind:this={modal}>
	<div class="planner-section mb-4 p-3 border rounded bg-light">
		<a
			class="text-decoration-none d-block"
			data-bs-toggle="collapse"
			href="#collapsePlanner"
			role="button"
			aria-expanded="false"
			aria-controls="collapsePlanner"
		>
			<h6 class="mb-0">
				<i class="bi bi-clock-history me-2"></i>
				Pianifica una sessione
				<i class="bi bi-chevron-down float-end"></i>
			</h6>
		</a>

		<div class="collapse" id="collapsePlanner">
			<div class="pt-3">
				<div class="input-group mb-3">
					<input
						type="number"
						class="form-control"
						bind:value={minutiInput}
						placeholder="Minuti totali"
						min="20"
					/>
					<button class="btn btn-outline-secondary" type="button" on:click={calcolaSuggerimenti}>
						Trova Piani
					</button>
				</div>

				{#if suggerimenti.length > 0}
					<div class="list-group">
						{#each suggerimenti.slice(0, 3) as proposta}
							<div
								class="list-group-item list-group-item-action"
								on:click={() => applicaSuggerimento(proposta)}
								style="cursor: pointer;"
							>
								<div class="d-flex w-100 justify-content-between">
									<h6 class="mb-1">{proposta.cicli} cicli</h6>
									<small>Utilizzo: {proposta.tempoUtilizzato} min</small>
								</div>
								<p class="mb-1 small">
									Studio: <strong>{proposta.studio} min</strong> / Pausa:
									<strong>{proposta.pausa} min</strong>
								</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>


	<form
		id="{id}-form"
		method={formMethod}
		action={formAction}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'redirect' || result.type === 'success') {
					console.log('Chiusura modale dopo submit con successo');
					modal.hide();
				}
				await update();
			};
		}}
	>
		<div class="mb-3">
			<label for="{id}-title" class="form-label">Titolo sessione</label>
			<input
				type="text"
				class="form-control"
				id="{id}-title"
				name="title"
				bind:value={title}
				required
			/>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="{id}-study" class="form-label">Minuti di Studio</label>
				<input
					type="number"
					class="form-control"
					id="{id}-study"
					name="timeStudy"
					bind:value={timeStudy}
					min="1"
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="{id}-break" class="form-label">Minuti di Pausa</label>
				<input
					type="number"
					class="form-control"
					id="{id}-break"
					name="timeBreak"
					bind:value={timeBreak}
					min="1"
					required
				/>
			</div>
		</div>
		<div class="mb-3">
			<label for="{id}-cycles" class="form-label">Numero di Cicli</label>
			<input
				type="number"
				class="form-control"
				id="{id}-cycles"
				name="cycles"
				bind:value={cicli}
				min="1"
				required
			/>
		</div>
	</form>

	<div slot="footer">
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
		<button type="submit" class="btn btn-primary" form="{id}-form">{submitButtonText}</button>
	</div>
</Modal>
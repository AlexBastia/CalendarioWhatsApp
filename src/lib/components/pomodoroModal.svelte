<script>
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import { suggerisciCicli } from '$lib/utils/timePlanning.js';

	let {
		id,
		titleModal,
		formAction,
		formMethod = 'POST',
		title = '',
		timeStudy = 25,
		timeBreak = 5,
		cicli = 4,
		submitButtonText = 'Salva'
	} = $props();

	let modal;
	let minutiInput = $state(120);
	let suggerimenti = $state([]);

	function calcolaSuggerimenti() {
		suggerimenti = suggerisciCicli(minutiInput);
	}

	function applicaSuggerimento(proposta) {
		timeStudy = proposta.studio;
		timeBreak = proposta.pausa;
		cicli = proposta.numCicli;
	}
	export function show() {
		modal.show();
	}

	export function hide() {
		modal.hide();
	}
</script>

<Modal {id} title={titleModal} bind:this={modal}>
	{#snippet body()}
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
						<button class="btn btn-outline-secondary" type="button" onclick={calcolaSuggerimenti}>
							Trova Piani
						</button>
					</div>

					{#if suggerimenti.length > 0}
						<div class="list-group">
							{#each suggerimenti.slice(0, 3) as proposta}
								<button
									class="list-group-item list-group-item-action"
									onclick={() => applicaSuggerimento(proposta)}
									style="cursor: pointer;"
								>
									<div class="d-flex w-100 justify-content-between">
										<h6 class="mb-1">{proposta.numCicli} cicli</h6>
										<small>Utilizzo: {proposta.tempoUtilizzato} min</small>
									</div>
									<p class="mb-1 small">
										Studio: <strong>{proposta.studio} min</strong> / Pausa:
										<strong>{proposta.pausa} min</strong>
									</p>
								</button>
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
	{/snippet}
	{#snippet footer()}
		<div>
			<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
			<button type="submit" class="btn btn-primary" form="{id}-form">{submitButtonText}</button>
		</div>
	{/snippet}
</Modal>

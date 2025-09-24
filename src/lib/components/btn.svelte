<script>
	let { ariaLabel = 'Attiva Azione', modalTarget } = $props();

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
			class="btn text-primary bg-light rounded-circle p-0 d-flex align-items-center justify-content-center"
			style="font-size: 4em; width: 1em; height: 1em;"
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


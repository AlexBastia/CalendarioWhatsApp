<!-- btn.svelte -->
<script>
	let { ariaLabel = 'Attiva Azione', modalTarget, submissionForm } = $props();
</script>

<div class="position-fixed" style="bottom: 1em; right: 0.6em; z-index: 1050;">
	<div class="btn-group float-end">
		{#if modalTarget}
			<button
				type="button"
				class="btn text-primary bg-light rounded-circle p-0 d-flex align-items-center justify-content-center"
				style="font-size: 4em; width: 1em; height: 1em;"
				aria-label={ariaLabel}
				data-bs-toggle="modal"
				data-bs-target={modalTarget}
			>
				<i class="bi bi-plus-circle-fill"></i>
			</button>
		{:else}
			<button
				type="button"
				class="btn text-primary bg-light rounded-circle p-0 d-flex align-items-center justify-content-center"
				style="font-size: 4em; width: 1em; height: 1em;"
				aria-label={ariaLabel}
			>
				<i class="bi bi-plus-circle-fill"></i>
			</button>
		{/if}


		{#if submissionForm}
				<i class="bi bi-check-circle-fill"></i>
			{:else if modalTarget}
				<i class="bi bi-plus-circle-fill"></i>
			{/if}
	</div>
</div>

<style>
	button:disabled {
		cursor: not-allowed;
	}
</style>

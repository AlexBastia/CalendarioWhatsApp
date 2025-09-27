<!-- btn.svelte -->
<script>
	let { ariaLabel = 'Attiva Azione', modalTarget, submissionForm } = $props();
</script>

<div class="position-fixed" style="bottom: 1em; right: 0.6em; z-index: 1050;">
	<div class="btn-group float-end">
		<button
			type={submissionForm ? 'submit' : 'button'}
			class="btn text-primary bg-light rounded-circle p-0 d-flex align-items-center justify-content-center"
			style="font-size: 4em; width: 1em; height: 1em;"
			aria-label={ariaLabel}
			data-bs-toggle={modalTarget ? 'modal' : ''}
			data-bs-target={modalTarget ?? ''}
			form={submissionForm ?? ''}
		>
			{#if submissionForm}
				<i class="bi bi-check-circle-fill"></i>
			{:else}
				<i class="bi bi-plus-circle-fill"></i>
			{/if}
		</button>
	</div>
</div>

<style>
	button:disabled {
		cursor: not-allowed;
	}
</style>

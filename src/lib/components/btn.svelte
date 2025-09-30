<!-- btn.svelte -->
<script>
	let { ariaLabel = 'Attiva Azione', modalTarget, submissionForm } = $props();
</script>

<div class="position-fixed" style="bottom: 6em; right: 0.8em; z-index: 1050;">
	<div class="float-end">
		<button
			type={submissionForm ? 'submit' : 'button'}
			class="button"
			aria-label={ariaLabel}
			data-bs-toggle={modalTarget ? 'modal' : ''}
			data-bs-target={modalTarget ?? ''}
			form={submissionForm ?? ''}
		>
			{#if submissionForm}
				<i class="bi bi-check-circle-fill icon"></i>
			{:else}
				<i class="bi bi-plus-circle-fill icon"></i>
			{/if}
		</button>
	</div>
</div>

<style>
	.button {
		position: relative;
		border-radius: 50%;
		font-size: 6em;
		width: 100px;
		height: 100px;
		padding: 0;
		background-color: white;
		color: var(--bs-primary);
		border:none;
		transition: all 0.15s ease-in-out;
	}
	.button:hover {
		transform: scale(1.06);
	}
	.icon {
		position: absolute;
		top: -22px;
		left: 2px;
	}
	.icon::before {
		transform: translateY(-4px);
	}
</style>
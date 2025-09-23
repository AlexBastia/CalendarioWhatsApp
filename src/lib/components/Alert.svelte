<script>
	import { fade } from 'svelte/transition';
	let { type, message } = $props();

	let visible = $state(true);

	// Dismiss after 5 seconds
	setTimeout(() => {
		visible = false;
	}, 5000);
</script>

{#if visible}
	<div
		class="position-absolute container-fluid bottom-0 start-50 translate-middle-x"
		style="z-index: 1079;"
		transition:fade
	>
		<div
			class="alert alert-dismissible fade show d-flex align-items-center {type === 'warning'
				? 'alert-danger'
				: ''} {type === 'success' ? 'alert-success' : ''}"
			role="alert"
		>
			<i
				class="bi {type === 'warning' ? 'bi-exclamation-triangle-fill' : ''} {type === 'success'
					? 'bi-check-circle-fill'
					: ''}"
			></i>
			<div class="ms-2">
				{message}
			</div>
			<button
				type="button"
				class="btn-close"
				data-bs-dismiss="alert"
				aria-label="Close"
				onclick={() => (visible = false)}
			></button>
		</div>
	</div>
{/if}

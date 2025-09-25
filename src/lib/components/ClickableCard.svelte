<script>
	let { children, title, href } = $props();
</script>

<div class="card h-100 clickable-card shadow-sm position-relative">
	<a class="card-link" {href} aria-label={`Dettagli per ${title}`} tabindex="0"></a>
	<div class="card-body d-flex flex-column">
		{@render children()}
	</div>
</div>

<style>
	.card-link::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}

	.clickable-card {
		transition:
			transform 0.15s ease-out,
			box-shadow 0.15s ease-out;
		border-radius: 0.5rem; /* Angoli leggermente più arrotondati */
		/* position: relative; è implicito per .card ma meglio esserne sicuri per l'absolute positioning dei figli */
	}

	.clickable-card .card-body {
		/* Aggiunge padding in alto per non sovrapporsi al pulsante elimina */
		/* Il pulsante è m-2 (0.5rem) e p-1. Un po' di spazio in più. */
		padding-top: 2.8rem;
		cursor: pointer; /* Indica che l'area è cliccabile */
	}

	.clickable-card:hover,
	.clickable-card:focus-within {
		/* focus-within per accessibilità da tastiera */
		transform: translateY(-4px);
		box-shadow:
			0 0.4rem 0.8rem rgba(0, 0, 0, 0.12),
			0 0.1rem 0.3rem rgba(0, 0, 0, 0.08) !important;
	}

	.clickable-card:active {
		transform: translateY(-2px);
		box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1) !important;
	}
</style>

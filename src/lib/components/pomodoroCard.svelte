<script>
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ClickableCard from './ClickableCard.svelte';

	let {
		pomodoroId,
		title,
		durata,
		pausa,
		cicli,
		href,
		icon = '',
		onEdit = () => {},
		deleteAction = ''
	} = $props();

	console.log(`dele: ${deleteAction}`);
</script>

<ClickableCard {title} {href}>
	<form
		method="POST"
		action={deleteAction}
		use:enhance={async () => {
			return async ({ result, update }) => {
				console.log('Form submission result: ', result);
				if (result.type === 'success') {
					console.log('fatto delete');
					await invalidateAll(); // Invalida tutti i dati caricati per forzare il refresh
				}
			};
		}}
	>
		<input type="hidden" name="id" value={pomodoroId} />
		<button
			type="submit"
			class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2 p-1 pomodoro-card-action-btn delete-btn"
			aria-label="Elimina Pomodoro"
			title="Elimina Pomodoro"
		>
			<i class="bi bi-trash-fill" style="font-size: 1rem;"></i>
		</button>
	</form>

	<div class="flex-grow-1 mb-3">
		<h5 class="card-title mb-3 text-primary">
			{#if icon}<i class="bi {icon} me-2"></i>{/if}
			{title}
		</h5>
		<p class="card-text small mb-1">
			<i class="bi bi-play-circle-fill me-1 text-success"></i>
			<strong>Studio:</strong>
			{durata}
		</p>
		<p class="card-text small mb-1">
			<i class="bi bi-pause-circle-fill me-1 text-warning"></i>
			<strong>Pausa:</strong>
			{pausa}
		</p>
		<p class="card-text small mb-0">
			<i class="bi bi-arrow-repeat me-1 text-info"></i>
			<strong>Cicli:</strong>
			{cicli}
		</p>
	</div>

	<div class="mt-auto text-end">
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary pomodoro-card-action-btn edit-btn"
			onclick={(e) => {
				e.stopPropagation();
				onEdit();
			}}
			aria-label="Modifica Pomodoro"
			title="Modifica Pomodoro"
		>
			<i class="bi bi-pencil-square me-1"></i>Modifica
		</button>
	</div>
</ClickableCard>

<style>
	.pomodoro-card-action-btn {
		position: relative;
		z-index: 2; /* Assicura che i pulsanti siano sopra altro contenuto se ci fossero sovrapposizioni */
		transition:
			background-color 0.15s ease-out,
			border-color 0.15s ease-out;
	}

	.pomodoro-card-action-btn.delete-btn {
		/* Stile più discreto per il cestino, ma visibile */
		background-color: rgba(255, 255, 255, 0.7); /* Leggera trasparenza se sopra immagini/colori */
		backdrop-filter: blur(2px); /* Effetto frosted glass se il browser supporta */
	}
	.pomodoro-card-action-btn.delete-btn:hover {
		background-color: var(--bs-danger);
		color: white;
		border-color: var(--bs-danger-border-subtle) !important;
	}
	.pomodoro-card-action-btn.edit-btn:hover {
		background-color: var(--bs-secondary);
		color: white;
	}

	.card-title {
		font-weight: 500; /* Un po' meno bold del default h5 per un look più pulito */
	}

	.card-text.small {
		color: #555; /* Testo leggermente più scuro per leggibilità */
		display: flex; /* Per allineare icona e testo */
		align-items: center; /* Allinea verticalmente icona e testo */
	}
	.card-text.small i {
		font-size: 0.9em; /* Icone leggermente più piccole del testo */
		margin-right: 0.4em !important;
	}
	.card-text.small strong {
		margin-right: 0.3em;
		font-weight: 500;
	}
</style>

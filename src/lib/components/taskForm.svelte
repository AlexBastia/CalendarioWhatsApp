<script>
    import {timingStore} from '$lib/stores/timing';
    import { format } from 'date-fns';
    import Title from '$lib/components/Title.svelte';
    
    // Ricevi i dati come prima
    let { task = { title: '', description: '' }, formAction, deleteAction, completeAtction } = $props();
    console.log(completeAtction)

    // 2. Quando crei lo stato 'e', formatta la 'deadline'
    let e = $state({
        ...task,
        deadline: task.deadline 
            // Se la task ha una deadline, formattala
            ? format(new Date(task.deadline), 'yyyy-MM-dd') 
            // Altrimenti, usa la data di oggi (per una nuova task)
            : format($timingStore ? $timingStore: new Date(), 'yyyy-MM-dd')
    });
    
    console.log("task in form:", e);

    // Funzione per tornare indietro
    function handleCancel() {
        history.back();
    }
</script>

<div class="page-container">
	<Title title={task._id ? 'Modifica Attività' : 'Crea Nuova Attività'} />
	
	<div class="form-wrapper">
		<div class="main-card">
			<div class="card-header">
				<h4 class="header-title">
					
						<i class="bi bi-pencil-square me-2"></i>
						Compila il form
				</h4>
			</div>

			<div class="card-body">
				<form method="POST" action={formAction} class="needs-validation" novalidate>
					{#if task._id}
						<input name="id" type="hidden" value={task._id} />
					{/if}

					<!-- Sezione Informazioni Base -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-info-circle me-2"></i>
							Informazioni Base
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<div class="form-floating">
									<input 
										type="text" 
										class="form-control form-control-lg" 
										id="title" 
										name="title" 
										placeholder="Titolo dell'attività" 
										bind:value={e.title} 
										required 
									/>
									<label for="title"><i class="bi bi-text-left me-2"></i>Titolo *</label>
								</div>
							</div>

							<div class="col-12">
								<div class="form-floating">
									<textarea 
										class="form-control" 
										id="description" 
										name="description" 
										placeholder="Aggiungi dettagli..." 
										bind:value={e.description}
										style="height: 100px"
									></textarea>
									<label for="description"><i class="bi bi-card-text me-2"></i>Descrizione</label>
								</div>
							</div>
						</div>
					</section>

					<!-- Sezione Scadenza -->
					<section class="form-section">
						<h5 class="section-title">
							<i class="bi bi-clock me-2"></i>
							Scadenza
						</h5>
						
						<div class="row g-3">
							<div class="col-12">
								<label for="deadline" class="form-label fw-semibold">
									<i class="bi bi-calendar3 me-2"></i>Data di scadenza *
								</label>
								<input 
									type="date" 
									id="deadline" 
									name="deadline" 
									class="form-control form-control-lg" 
									bind:value={e.deadline} 
									required 
								/>
							</div>
						</div>
					</section>

					<!-- Bottoni Azione -->
					<div class="action-buttons">
						<button type="button" class="btn btn-outline-secondary btn-lg" onclick={handleCancel}>
							<i class="bi bi-x-circle me-2"></i>Annulla
						</button>

						<div class="btn-group-right">
							<button class="btn btn-primary btn-lg px-4" type="submit">
								<i class="bi bi-check-circle-fill me-2"></i>Salva Attività
							</button>
						</div>
					</div>
				</form>

				<!-- delete form -->
				{#if e._id && deleteAction}
					<div class="delete-section">
						<form method="POST" action={deleteAction}>
							<input name="id" type="hidden" value={e._id} />
							<button type="submit" class="btn btn-outline-danger btn-lg w-100">
								<i class="bi bi-trash3 me-2"></i>Elimina Attività
							</button>
						</form>
					</div>
				{/if}

				<!-- SEGNA COME COMPLETATA -->
				{#if e._id && completeAtction}
					<div class="complete-section">
						<form method="POST" action={completeAtction}>
							<input name="id" type="hidden" value={e._id} />
							<button type="submit" class="btn btn-outline-success btn-lg w-100">
								<i class="bi bi-check-circle me-2"></i>Segna come completato
							</button>
						</form>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.page-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
		font-family: system-ui, -apple-system, sans-serif;
		min-height: 100vh;
		overflow-y: auto;
	}

	.form-wrapper {
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.main-card {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.main-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	.card-header {
		background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
		color: white;
		padding: 24px;
	}

	.header-title {
		margin: 0;
		font-size: 1.5em;
		font-weight: 600;
	}

	.card-body {
		padding: 32px;
		max-height: calc(100vh - 200px);
		overflow-y: auto;
	}

	.form-section {
		margin-bottom: 32px;
		padding: 20px;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background-color: #fafafa;
		transition: box-shadow 0.2s;
	}

	.form-section:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.section-title {
		display: flex;
		align-items: center;
		margin: 0 0 20px 0;
		font-size: 1.3em;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #f0f0f0;
		padding-bottom: 10px;
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e0e0e0;
	}

	.btn-group-right {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.delete-section,
	.complete-section {
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e0e0e0;
	}

	.form-control:focus,
	.form-select:focus {
		border-color: #0d6efd;
		box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
	}

	.form-floating > label {
		color: #6c757d;
	}

	.form-floating > .form-control:focus ~ label,
	.form-floating > .form-control:not(:placeholder-shown) ~ label,
	.form-floating > .form-select ~ label {
		color: #0d6efd;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn {
		transition: all 0.2s ease;
		border-radius: 8px;
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 16px;
		}

		.card-body {
			padding: 20px !important;
		}

		.form-section {
			padding: 16px;
		}

		.action-buttons {
			flex-direction: column-reverse;
			gap: 12px;
		}

		.btn-group-right {
			width: 100%;
			justify-content: center;
		}
	}
</style>
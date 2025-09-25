<script>
    let {formAction, task} = $props();

    // Funzione per tornare indietro
    function handleCancel() {
        history.back();
    }
</script>

<div class="card shadow-sm">
    <div class="card-header bg-light">
        <h4 class="my-1">{#if task._id}Modifica Attività{:else}Crea Nuova Attività{/if}</h4>
    </div>
    <div class="card-body">
        <form method="POST" action={formAction}>
            {#if task._id}
                <input name="id" type="hidden" value={task._id} />
            {/if}

            <div class="row g-3">
                <div class="col-12">
                    <div class="form-floating">
                        <input 
                            type="text" 
                            class="form-control" 
                            id="title" 
                            name="title" 
                            placeholder="Titolo dell'attività" 
                            bind:value={task.title} 
                            required 
                        />
                        <label for="title">Titolo</label>
                    </div>
                </div>

                <div class="col-12">
                    <div class="form-floating">
                        <textarea 
                            class="form-control" 
                            id="description" 
                            name="description" 
                            placeholder="Aggiungi dettagli..." 
                            bind:value={task.description}
                            style="height: 100px"
                        ></textarea>
                        <label for="description">Descrizione (opzionale)</label>
                    </div>
                </div>

                <hr class="my-3">

                <div class="col-12">
                    <label for="deadline" class="form-label">Scadenza</label>
                    <input 
                        type="date" 
                        id="deadline" 
                        name="deadline" 
                        class="form-control form-control-lg" 
                        bind:value={task.deadline} 
                        required 
                    />
                </div>
            </div>

            <hr class="my-4">
            <div class="d-flex justify-content-end align-items-center gap-2">
                <button type="button" class="btn btn-secondary" on:click={handleCancel}>
                    Annulla
                </button>
                <button class="btn btn-primary" type="submit">
                    <i class="bi bi-check-lg me-2"></i>Salva Attività
                </button>
            </div>
        </form>
    </div>
</div>
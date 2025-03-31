<script>
	let { data, form } = $props();
	console.log(data);
    let pomodori  = data.pomodori;
	console.log(form);

	let tempStudio;
    let title;
    let tempPausa;
    let cicli;
</script>

<header class="container d-flex justify-content-between align-items-center">
	<h1 class="display-2">Pomodori</h1>
</header>

<main>

<div class="container mt-4">
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4">
        {#each pomodori as pomodoro}
            <div class="col">

                <div class="card-horizontal d-flex align-items-center p-3 border rounded"> 
                    <div class="card-icon me-3">
                        <i class="bi bi-clock-fill" style="font-size: 2rem;"></i>
                    </div>
                    <div class="card-content text-start">
                        <h3 class="card-title">{pomodoro.title}</h3>
                        <p class="card-time mb-0">Durata: {new Date(pomodoro.timeStudy).getMinutes()} minuti</p>
                        <p class="card-time mb-0">Pausa: {new Date(pomodoro.timeBreak).getMinutes()} minuti</p>
                        <p class="card-time mb-0">Ripetizioni: {pomodoro.cycles}</p>
                    </div>
                </div>

            </div>
        {/each}
    </div>
</div>


    <div class="position-fixed" style="bottom: 1em; right: 0.6em">
        <div class="btn-group dropup float-end">
            <button
                type="button"
                class="btn text-primary bg-light rounded-circle p-0"
                aria-label="Add pomodoro"
                style="font-size: 4em; line-height: 64px;"
                data-bs-toggle="modal"
                data-bs-target="#settingsModal"
            >
                <i class="bi bi-plus-circle-fill"></i>
            </button>
        </div>
    </div>

    <!-- modale per la creazione di un pomodorino -->
    <div
    class="modal fade"
    id="settingsModal"
    tabindex="-1"
    aria-labelledby="settingsModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"> <!-- Impedisce la chiusura cliccando fuori -->

    <div class="modal-dialog">
        <div class="modal-content bg-white"> <!-- Aggiunto .bg-white per lo sfondo bianco -->
            <div class="modal-header">
                <h5 class="modal-title" id="settingsModalLabel">Aggiungi Pomodoro</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form method="POST" action="/pomodoro?/createPomodoro">
                    <div class="mb-3">
                        <label for="title" class="form-label">Titolo</label>
                        <input
                            type="text"
                            id="title"
                            class="form-control"
                            name="title"
                            bind:value={title}
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="timeStudy" class="form-label">Durata Studio (minuti)</label>
                        <input
                            type="number"
                            id="timeStudy"
                            class="form-control"
                            name="timeStudy"
                            bind:value={tempStudio}
                            min="1"
                            max="59"
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="timeBreak" class="form-label">Durata Pausa (minuti)</label>
                        <input
                            type="number"
                            id="timeBreak"
                            name="timeBreak"
                            class="form-control"
                            bind:value={tempPausa}
                            min="1"
                            max="59"
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="cycles" class="form-label">Ripetizioni</label>
                        <input
                            type="number"
                            id="cycles"
                            name="cycles"
                            class="form-control"
                            bind:value={cicli}
                            min="1"
                            required
                        />
                    </div>
                    <button type="submit" class="btn btn-primary">Aggiungi</button>
                </form>
            </div>
        </div>
    </div>
</div>

</main>

<style>
	.card-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.card {
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		width: 200px;
		background-color: #fff;
	}
	.card-title {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}
	.card-text {
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}
	.card-time {
		font-size: 0.875rem;
		color: #555;
	}
</style>

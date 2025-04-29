<script>
    let { data, form } = $props();
    import { goto } from '$app/navigation';
    import FloatingButton from '$lib/components/btn.svelte';
    import PomodoroCard from '$lib/components/pomodoroCard.svelte';
    import PomodoroModal from '$lib/components/pomodoroModal.svelte';

    console.log(data);
    let pomodori = data.pomodori;
    console.log(form);

    let tempStudio;
    let title;
    let tempPausa;
    let cicli;
    let editPomodoroId = null; // Aggiungi una variabile per l'ID del pomodoro da modificare
</script>

<header class="container d-flex justify-content-between align-items-center">
    <h1 class="display-2">Pomodori</h1>
</header>

<main>
    <div class="container mt-4">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4">
            {#each pomodori as pomodoro}
                <div class="col">
                    <PomodoroCard
                        title={pomodoro.title}
                        durata={`${new Date(pomodoro.timeStudy).getMinutes()} minuti`}
                        pausa={`${new Date(pomodoro.timeBreak).getMinutes()} minuti`}
                        cicli={pomodoro.cycles}
                        onClick={() => {
                            goto(`/pomodoro/${pomodoro._id}`);
                        }}
                        icon="bi-clock-fill"
                        onEdit={() => {
                            console.log('Modifica pomodoro');
                            title = pomodoro.title;
                            tempStudio = new Date(pomodoro.timeStudy).getMinutes();
                            tempPausa = new Date(pomodoro.timeBreak).getMinutes();
                            cicli = pomodoro.cycles;
                            editPomodoroId = pomodoro._id; // Imposta l'ID del pomodoro da modificare
                            const modal = new bootstrap.Modal(document.getElementById('editPomodoro'));

                            modal.show();
                        }}
                        onDelete={() => {
                            fetch(`/pomodoro/${pomodoro._id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(() => {
                                goto('/pomodoro');
                            });
                        }}
                    />
                </div>
            {/each}
        </div>
    </div>

    <FloatingButton icon="bi-gear-fill" ariaLabel="Apri impostazioni" modalTarget="#createPomodoro"
    ></FloatingButton>

    <!-- modale per la creazione di un pomodorino -->
    <PomodoroModal
        id="createPomodoro"
        titleModal="Crea Pomodoro"
        {cicli}
        formAction="/pomodoro?/createPomodoro"
        formMethod="POST"
        {title}
        {tempStudio}
        {tempPausa}
    ></PomodoroModal>

    <!-- modale per la modifica di un pomodorino -->
    <PomodoroModal
        id="editPomodoro"
        titleModal="Modifica Pomodoro"
        cicli={cicli}
        title={title}
        tempStudio={tempStudio}
        tempPausa={tempPausa}
        formAction={`/pomodoro?/editPomodoro?id=${editPomodoroId}`}
    ></PomodoroModal>
</main>

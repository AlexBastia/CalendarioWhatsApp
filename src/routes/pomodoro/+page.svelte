<script>
    let { data, form } = $props();
    import { fail, redirect } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import FloatingButton from '$lib/components/btn.svelte';
    import PomodoroCard from '$lib/components/pomodoroCard.svelte';
    import PomodoroModal from '$lib/components/pomodoroModal.svelte';

    console.log(data);
    console.log(form);

    let tempStudio = $state();
    let title = $state(''); // È buona norma dare un valore iniziale
    let tempPausa = $state();
    let cicli = $state();
    let editPomodoroId = $state(null);

        // riferimenti ai modali
    let createModalRef;
    let editModalRef;
</script>

<header class="container d-flex justify-content-between align-items-center">
    <h1 class="display-2">Pomodori</h1>
</header>

<main>
    <div class="container mt-4">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4">
            {#each data.pomodori as pomodoro}

                <div class="col">
                    <PomodoroCard
                        pomodoroId={pomodoro._id}
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

                            editModalRef?.show();
                        }}
                        deleteAction="/pomodoro?/deletePomodoro"
                    />
                </div>

            {/each}
        </div>
        <!-- posto per i pomodori condivisi con me -->
        
        <h2 class="mt-5">Pomodori condivisi con me</h2>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4">
        {#if !data.sharedPomodori || data.sharedPomodori.length === 0}
            <p class="text-muted">Nessun pomodoro condiviso con te.</p>
        {:else}
            {#each data.sharedPomodori as pomodoroCondiviso}
                <div class="col">
                    <PomodoroCard
                        deleteAction="/pomodoro?/delPomFromSU"
                        pomodoroId={pomodoroCondiviso._id}
                        title={pomodoroCondiviso.title}
                        durata={`${new Date(pomodoroCondiviso.timeStudy).getMinutes()} minuti`}
                        pausa={`${new Date(pomodoroCondiviso.timeBreak).getMinutes()} minuti`}
                        cicli={pomodoroCondiviso.cycles}
                        onClick={() => {
                            goto(`/pomodoro/${pomodoroCondiviso._id}`);
                        }}
                        icon="bi-clock-fill"
                        isShared={true}
                    />
                </div>
                
            {/each}
        {/if}
        </div>
    </div>

    <FloatingButton 
        ariaLabel="Apri impostazioni" 
        modalTarget="#createPomodoro"
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
        bind:this={createModalRef}
    />


   <PomodoroModal
    id="editPomodoro"
    titleModal="Modifica Pomodoro"
    cicli={cicli}
    title={title}
    tempStudio={tempStudio}
    tempPausa={tempPausa}
    formMethod="POST"
    formAction={`/pomodoro?/editPomodoro&id=${editPomodoroId}`}
    bind:this={editModalRef}
/>

</main>

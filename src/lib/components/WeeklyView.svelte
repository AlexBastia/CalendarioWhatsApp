<script>
    import { isSameDay, format } from 'date-fns';

    // Definiamo i dati che questo componente si aspetta di ricevere
    let { 
        weekDays,       // L'array dei giorni della settimana (oggetti Date)
        today,          // La data di oggi per l'highlighting
        expandedEvents, // L'array degli eventi da mostrare
        tasks,          // L'array delle attività da mostrare
        goToEvent,      // La funzione per navigare a un evento
        goToTask        // La funzione per navigare a un'attività
    } = $props();

    const weekHeader = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    console.log('settinanale!')
</script>

<div class="container-fluid">
    <div class="row text-center fw-bold border-bottom pb-2 mb-2">
        {#each weekHeader as day}
            <div class="col">{day}</div>
        {/each}
    </div>

    <div class="row">
        {#each weekDays as day}
            <div
                class="col border p-2 {isSameDay(day, today) ? 'today' : ''}"
                style="min-height: 120px;"
            >
                <p class="text-center">{format(day, 'd')}</p>
                
                {#each expandedEvents as event}
                    {#if isSameDay(event.start, day)}
                        <div
                            onclick={() => goToEvent(event._id)}
                            class="badge bg-primary w-100 mb-1 event-link"
                            title={event.title}
                        >
                            📅 {event.title}
                        </div>
                    {/if}
                {/each}

                {#each tasks as task}
                    {#if isSameDay(task.deadline, day)}
                        <div
                            onclick={() => goToTask(task._id)}
                            class="badge w-100 mb-1 event-link {task.status === 'late'
                                ? 'bg-danger'
                                : 'bg-success'}"
                            title={task.title}
                        >
                            📝 {task.title}
                        </div>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    /* Spostiamo qui gli stili specifici se necessario */
    .event-link {
        cursor: pointer;
        transition: filter 0.2s ease-in-out;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .event-link:hover {
        filter: brightness(90%);
    }

    .today {
        background-color: #e0f7fa;
    }
</style>
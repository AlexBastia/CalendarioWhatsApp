<script>
	import NotificationBell from "$lib/components/NotificationBell.svelte";
	import NotificationApiManager from "$lib/components/NotificationApiManager.svelte";
	import Title from "$lib/components/Title.svelte";
	import { timingStore } from "$lib/stores/timing";
	let {data } = $props();
	let { latestNote, weeklyEvents, latestPomodoro, error, virtualTime } = $state(data); 
	let today = $derived($timingStore ? $timingStore : new Date());

</script>



<main class="homepage-container">
    <Title title={"Homepage"}/>

    {#if error}
        <p class="error-message">Errore: {error}</p>
    {/if}

    <section class="navigation-links">
        <h2>Navigazione Principale</h2>
        <ul class="main-nav-list">
            <li><a href="/note">📝 Note</a></li>
            <li><a href="/calendario">🗓️ Calendario</a></li>
            <li><a href="/pomodoro">🍅 Pomodoro</a></li>
        </ul>
        <ul class="utility-nav-list">
             <li><a href="/signup">Signup</a></li>
             <li><a href="/login">Login</a></li>
             <li><a href="/logout">Logout</a></li>
        </ul>
    </section>

    <hr/>

    <section class="note-preview">
        <h2>Ultima Nota <a href="/note" class="view-all-link">Vedi tutte &rarr;</a></h2>
        {#if latestNote}
            <div class="card">
                <h3>{latestNote.title}</h3>
                <p class="note-date">Creata il: {formatDate(latestNote.timeCreation)}</p>
                <p>{latestNote.snippet}...</p>
                <a href="/note/{latestNote._id}" class="read-more">Apri nota completa &rarr;</a>
            </div>
        {:else}
            <p>Nessuna nota recente trovata. <a href="/note/new">Crea la tua prima nota!</a></p>
        {/if}
    </section>

    <hr/>

    <section class="calendar-preview">
        <h2>Eventi della Settimana <a href="/calendario" class="view-all-link">Vedi Calendario &rarr;</a></h2>
        {#if weeklyEvents.length > 0}
            <ul class="event-list">
                {#each weeklyEvents.slice(0, 5) as event}
                    <li>
                        <span class="event-type">
                            {#if event.eventType === 'POMODORO'}🍅{/if}
                            {#if event.eventType === 'STANDARD'}🗓️{/if}
                        </span>
                        <strong>{formatDate(event.start)}:</strong> {event.title}
                    </li>
                {/each}
                {#if weeklyEvents.length > 5}
                    <li>...e altri {weeklyEvents.length - 5} eventi.</li>
                {/if}
            </ul>
        {:else}
            <p>Nessun evento in programma per la settimana corrente.</p>
        {/if}
    </section>
    
    <hr/>

    <section class="pomodoro-report-preview">
        <h2>Ultima Attività Pomodoro <a href="/pomodoro" class="view-all-link">Vedi Report &rarr;</a></h2>
        {#if latestPomodoro}
            <div class="card">
                <h3>{latestPomodoro.title || 'Sessione Pomodoro'}</h3>
                <p>Cicli completati: <strong>{latestPomodoro.cycles || 'N/A'}</strong></p>
                <p>Terminato il: <strong>{formatDate(latestPomodoro.completionTime)}</strong></p>
            </div>
        {:else}
            <p>Nessuna attività Pomodoro completata di recente. <a href="/pomodoro">Inizia un nuovo ciclo!</a></p>
        {/if}
    </section>

    <NotificationBell/>
</main>

<style>
    /* Stili CSS di base */
    .homepage-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    section {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        background-color: #ffffff;
    }

    h2 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 10px;
        margin-bottom: 15px;
        font-size: 1.5em;
    }

    .view-all-link {
        font-size: 0.7em;
        text-decoration: none;
        color: #007bff;
        transition: color 0.2s;
    }
    .view-all-link:hover {
        color: #0056b3;
    }

    .card {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .card h3 {
        margin-top: 0;
        color: #333;
    }
    .note-date {
        font-size: 0.8em;
        color: #888;
        margin-bottom: 5px;
    }
    .read-more {
        display: inline-block;
        margin-top: 10px;
        font-weight: bold;
        text-decoration: none;
        color: #28a745;
    }

    .main-nav-list {
        list-style: none;
        padding: 0;
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }

    .main-nav-list a {
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    .main-nav-list a:hover {
        background-color: #0056b3;
    }
    
    .utility-nav-list {
        list-style: none;
        padding: 0;
        display: flex;
        gap: 10px;
        font-size: 0.9em;
        margin-top: 10px;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }

    .event-list {
        list-style: none;
        padding-left: 0;
    }

    .event-list li {
        margin-bottom: 8px;
        border-left: 3px solid #ffc107;
        padding-left: 10px;
        color: #555;
    }

    .event-type {
        margin-right: 5px;
    }
</style>
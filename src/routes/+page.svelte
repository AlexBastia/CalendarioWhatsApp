<script>
	import NotificationBell from "$lib/components/NotificationBell.svelte";
	import Title from "$lib/components/Title.svelte";
	import { timingStore } from "$lib/stores/timing";

	let { data } = $props();
	let { latestNote, weeklyEvents, latestPomodoro, error } = $state(data);

	function formatDate(date) {
		if (!date) return 'N/A';
		const d = new Date(date);
		return d.toLocaleDateString('it-IT', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="homepage-container">
	<Title title={"Homepage"}/>

	{#if error}
		<p class="error-message">⚠️ Errore: {error}</p>
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
		<h2>
			Ultima Nota 
			<a href="/note" class="view-all-link">Vedi tutte &rarr;</a>
		</h2>
		{#if latestNote}
			<div class="card">
				<h3>{latestNote.title}</h3>
				<p class="note-date">Creata il: {formatDate(latestNote.timeCreation)}</p>
				<p class="note-snippet">{latestNote.snippet}...</p>
				<!-- Rimuovi il link se non funziona -->
				<!-- <a href="/note/{latestNote._id}" class="read-more">Apri nota completa &rarr;</a> -->
			</div>
		{:else}
			<p>Nessuna nota recente trovata.</p>
			<!-- <a href="/note/new">Crea la tua prima nota!</a> -->
		{/if}
	</section>

	<hr/>

	<section class="calendar-preview">
		<h2>
			Eventi della Settimana 
			<a href="/calendario" class="view-all-link">Vedi Calendario &rarr;</a>
		</h2>
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
					<li class="more-events">...e altri {weeklyEvents.length - 5} eventi.</li>
				{/if}
			</ul>
		{:else}
			<p>Nessun evento in programma per la settimana corrente.</p>
		{/if}
	</section>
	
	<hr/>

	<section class="pomodoro-report-preview">
		<h2>
			Ultima Attività Pomodoro 
			<a href="/pomodoro" class="view-all-link">Vedi Report &rarr;</a>
		</h2>
		{#if latestPomodoro}
			<div class="card">
				<h3>{latestPomodoro.title || 'Sessione Pomodoro'}</h3>
				<p>Cicli completati: <strong>{latestPomodoro.cycles || 'N/A'}</strong></p>
				<p>Terminato il: <strong>{formatDate(latestPomodoro.completionTime)}</strong></p>
			</div>
		{:else}
			<p>Nessuna attività Pomodoro completata di recente.</p>
			<!-- <a href="/pomodoro">Inizia un nuovo ciclo!</a> -->
		{/if}
	</section>

	<NotificationBell/>
</main>

<style>
	.homepage-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.error-message {
		background-color: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
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
		font-size: 0.85em;
		color: #888;
		margin-bottom: 8px;
	}

	.note-snippet {
		color: #555;
		line-height: 1.5;
	}
	
	.read-more {
		display: inline-block;
		margin-top: 10px;
		font-weight: bold;
		text-decoration: none;
		color: #28a745;
		transition: color 0.2s;
	}

	.read-more:hover {
		color: #1e7e34;
	}

	.main-nav-list {
		list-style: none;
		padding: 0;
		display: flex;
		gap: 15px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.main-nav-list li {
		flex: 1;
		min-width: 150px;
	}

	.main-nav-list a {
		display: block;
		padding: 12px 15px;
		background-color: #007bff;
		color: white;
		border-radius: 5px;
		text-decoration: none;
		font-weight: bold;
		text-align: center;
		transition: background-color 0.2s, transform 0.1s;
	}

	.main-nav-list a:hover {
		background-color: #0056b3;
		transform: translateY(-2px);
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
		flex-wrap: wrap;
	}

	.utility-nav-list a {
		color: #007bff;
		text-decoration: none;
	}

	.utility-nav-list a:hover {
		text-decoration: underline;
	}

	.event-list {
		list-style: none;
		padding-left: 0;
	}

	.event-list li {
		margin-bottom: 10px;
		border-left: 3px solid #ffc107;
		padding-left: 10px;
		color: #555;
		line-height: 1.4;
	}

	.event-type {
		margin-right: 8px;
		font-size: 1.1em;
	}

	.more-events {
		font-style: italic;
		color: #888;
		border-left-color: #ddd;
	}

	hr {
		border: none;
		border-top: 1px solid #e0e0e0;
		margin: 25px 0;
	}

	p {
		margin: 10px 0;
		color: #666;
	}
</style>
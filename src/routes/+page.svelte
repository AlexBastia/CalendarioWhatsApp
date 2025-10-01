<script>
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import Title from '$lib/components/Title.svelte';
	import { timingStore } from '$lib/stores/timing';
	import { expandEvent } from '$lib/utils/eventRecursion.js';
	import { endOfWeek } from 'date-fns';

	let { data } = $props();

	let today = $derived($timingStore ? $timingStore : new Date());

	let expandedEvents = $state([]);
	let latestNote = $state(null);
	let latestPomodoro = $state(null);
	let upcomingEvents = $state([]);

	let rangeStart = $derived.by(() => {
		return today;
	});

	let rangeEnd = $derived.by(() => {
		return endOfWeek(today);
	});

	$effect(() => {
		if (!data || !data.events) {
			expandedEvents = [];
			return;
		}
		expandedEvents = data.events.flatMap((ev) => {
			const e = { ...ev, start: new Date(ev.start), end: new Date(ev.end) };
			const expanded = expandEvent(e, rangeStart, rangeEnd);
			return expanded.map((instance) => ({
				...instance,
				eventType: ev.eventType,
				title: instance.title || ev.title,
				_id: instance._id || ev._id
			}));
		});
	});

	$effect(() => {
		const futureEvents = expandedEvents
			.filter((event) => new Date(event.start) >= today)
			.sort((a, b) => new Date(a.start) - new Date(b.start));

		upcomingEvents = futureEvents.slice(0, 10);
	});

	$effect(() => {
		if (!data || !data.notes || data.notes.length === 0) {
			latestNote = null;
			return;
		}
		latestNote = data.notes[0];
	});

	$effect(() => {
		if (!data || !data.pomodori || data.pomodori.length === 0) {
			latestPomodoro = null;
			return;
		}
		latestPomodoro = data.pomodori[0];
	});

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
	<Title title={'CalenDario WhatsApp AI'}>
		<NotificationBell />
	</Title>

	{#if data.error}
		<p class="error-message">⚠️ Errore: {data.error}</p>
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

	<hr />

	<section class="note-preview">
		<h2>
			Ultima Nota
			<a href="/note" class="view-all-link">Vedi tutte &rarr;</a>
		</h2>
		{#if latestNote}
			<div class="card">
				<h3>{latestNote.title}</h3>
				<p class="note-date">Creata il: {formatDate(latestNote.timeCreation)}</p>
				<p class="note-snippet">{latestNote.textStart}...</p>
			</div>
		{:else}
			<p>Nessuna nota recente trovata.</p>
		{/if}
	</section>

	<hr />

	<section class="calendar-preview">
		<h2>
			Prossimi Eventi
			<a href="/calendario" class="view-all-link">Vedi Calendario &rarr;</a>
		</h2>
		{#if upcomingEvents.length > 0}
			<ul class="event-list">
				{#each upcomingEvents as event}
					<li>
						<span class="event-type">
							{#if event.eventType === 'POMODORO'}🍅{/if}
							{#if event.eventType === 'STANDARD'}🗓️{/if}
						</span>
						<strong>{formatDate(event.start)}:</strong>
						{event.title}
					</li>
				{/each}
				{#if expandedEvents.filter((e) => new Date(e.start) >= today).length > 10}
					<li class="more-events">
						...e altri {expandedEvents.filter((e) => new Date(e.start) >= today).length - 10} eventi.
					</li>
				{/if}
			</ul>
		{:else}
			<p>Nessun evento in programma per questa settimana.</p>
		{/if}
	</section>

	<hr />

	<section class="pomodoro-report-preview">
		<h2>
			Ultima Attività Pomodoro
			<a href="/pomodoro" class="view-all-link">Vedi Report &rarr;</a>
		</h2>
		{#if latestPomodoro}
			<div class="card">
				<h3>{latestPomodoro.title || 'Sessione Pomodoro'}</h3>
				<p>Cicli completati: <strong>{latestPomodoro.cycles || 'N/A'}</strong></p>
				<p>Terminato il: <strong>{formatDate(latestPomodoro.timeLastUsed)}</strong></p>
			</div>
		{:else}
			<p>Nessuna attività Pomodoro completata di recente.</p>
		{/if}
	</section>
</main>

<style>
	.homepage-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
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
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
		transition:
			background-color 0.2s,
			transform 0.1s;
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

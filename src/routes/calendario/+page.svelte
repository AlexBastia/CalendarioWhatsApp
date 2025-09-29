<script>
	import Btn from '$lib/components/btn.svelte';
	import { goto } from '$app/navigation';
	import { timingStore } from '$lib/stores/timing.js';
	import SelectionModal from '$lib/components/SelectionModal.svelte';
	import {
		format,
		getMonth,
		getYear,
		startOfMonth,
		endOfMonth,
		addDays,
		addMonths,
		subMonths,
		subDays,
		startOfWeek,
		eachDayOfInterval,
		endOfWeek,
		isSameMonth,
		isSameDay
	} from 'date-fns';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { onMount } from 'svelte';
	import { expandEvent } from '$lib/utils/eventRecursion.js';
	import Title from '$lib/components/Title.svelte';
	import GoogleCalendar from '$lib/components/GoogleCalendar.svelte';
	import DailyView from '$lib/components/DailyView.svelte';

	let week = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
	let { data } = $props();

	let today = $derived($timingStore ? $timingStore : new Date());

	let currentDate = $state($timingStore ? $timingStore : new Date());
	$effect(() => {
		console.log(currentDate);
	});
	//modalita` di visualizzazione, il default e` settimanale
	let viewMode = $state('weekly'); // 'daily', 'weekly', 'monthly'

	let rangeStart;
	let rangeEnd;
	let expandedEvents = [];

	// effetto per aggiornare rangeStart / rangeEnd
	$effect(() => {
		if (viewMode === 'daily') {
			rangeStart = currentDate;
			rangeEnd = currentDate;
		} else if (viewMode === 'weekly') {
			rangeStart = startOfWeek(currentDate);
			rangeEnd = endOfWeek(currentDate);
		} else {
			rangeStart = startOfMonth(currentDate);
			rangeEnd = endOfMonth(currentDate);
		}
	});

	// effetto per aggiornare eventi espansi
	$effect(() => {
		if (!data || !data.events) {
			expandedEvents = [];
			return;
		}
		expandedEvents = data.events.flatMap((ev) => {
			const e = { ...ev, start: new Date(ev.start), end: new Date(ev.end) };
			return expandEvent(e, rangeStart, rangeEnd);
		});
	});

	function goToEvent(id) {
		goto(`/calendario/event/${id}`);
	}

	// NUOVA FUNZIONE PER ANDARE ALLA PAGINA DEL TASK
	function goToTask(id) {
		goto(`/calendario/task/${id}`);
	}

	function toggleView() {
		viewMode = viewMode === 'daily' ? 'weekly' : viewMode === 'weekly' ? 'monthly' : 'daily';
	}

	function goBack() {
		currentDate =
			viewMode === 'daily'
				? subDays(currentDate, 1)
				: viewMode === 'weekly'
					? subDays(currentDate, 7)
					: subMonths(currentDate, 1);
	}

	function goAhead() {
		currentDate =
			viewMode === 'daily'
				? addDays(currentDate, 1)
				: viewMode === 'weekly'
					? addDays(currentDate, 7)
					: addMonths(currentDate, 1);
	}

	function getWeekDays(date) {
		let sunday = startOfWeek(date);
		let saturday = addDays(sunday, 6);
		return eachDayOfInterval({ start: sunday, end: saturday });
	}

	function getMonthCalendarDays(date) {
		const monthStart = startOfMonth(date);
		const monthEnd = endOfMonth(date);
		const calendarStart = startOfWeek(monthStart);
		const calendarEnd = endOfWeek(monthEnd);
		return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
	}

	let weekDays = $derived(getWeekDays(currentDate));
	let monthCalendarDays = $derived(getMonthCalendarDays(currentDate));
</script>

<Title title={format(currentDate, 'dd/mm/yyyy')} backLink={'/'}>
	<GoogleCalendar />
</Title>

<div class="d-flex align-items-center gap-2 mb-4">
	<label for="view-mode" class="form-label">Vista:</label>
	<select id="view-mode" class="form-select w-auto" bind:value={viewMode}>
		<option value="daily">Giornaliera</option>
		<option value="weekly">Settimanale</option>
		<option value="monthly">Mensile</option>
	</select>
</div>

{#if viewMode === 'daily'}
	<DailyView
		events={expandedEvents.filter((event) => isSameDay(currentDate, event.start))}
		tasks={data.tasks.filter((task) => isSameDay(currentDate, task.deadline))}
		lateTasks={data.tasks.filter((task) => task.status === 'late')}
	/>
	<div class="card">
		<div class="card-header fs-4 {isSameDay(currentDate, today) ? 'today' : ''}">
			{format(currentDate, 'dd MMMM yyyy, EEEE')}
		</div>
		<div class="list-group list-group-flush">
			{#each expandedEvents as event}
				{#if isSameDay(event.start, currentDate)}
					<div
						onclick={() => goToEvent(event._id)}
						class="list-group-item list-group-item-action event-link"
					>
						📅 {event.title}
					</div>
				{/if}
			{/each}
			{#each data.tasks as task}
				{#if isSameDay(task.deadline, currentDate) && task.status !== 'late'}
					<div
						onclick={() => goToTask(task._id)}
						class="list-group-item list-group-item-action event-link {task.status === 'late'
							? 'task-late'
							: ''}"
					>
						📝 {task.title}
					</div>
				{/if}
			{/each}
			{#if isSameDay(currentDate, today)}
				{#each data.tasks as task}
					{#if task.status === 'late'}
						<div
							onclick={() => goToTask(task._id)}
							class="list-group-item list-group-item-action event-link task-late"
						>
							🚨 {task.title} (Scaduta)
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
{:else if viewMode === 'weekly'}
	<div class="container-fluid">
		<div class="row text-center fw-bold border-bottom pb-2 mb-2">
			{#each week as day}
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
							>
								📅 {event.title}
							</div>
						{/if}
					{/each}
					{#each data.tasks as task}
						{#if isSameDay(task.deadline, day)}
							<div
								onclick={() => goToTask(task._id)}
								class="badge w-100 mb-1 event-link {task.status === 'late'
									? 'bg-danger'
									: 'bg-success'}"
							>
								📝 {task.title}
							</div>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="container-fluid">
		<div class="row text-center fw-bold border-bottom pb-2 mb-2">
			{#each week as day}
				<div class="col">{day}</div>
			{/each}
		</div>
		{#each Array(Math.ceil(monthCalendarDays.length / 7)) as _, weekIndex}
			<div class="row">
				{#each monthCalendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7) as day}
					<div
						class="col border p-2 {isSameDay(day, today) ? 'today' : ''} {!isSameMonth(
							day,
							currentDate
						)
							? 'text-muted bg-light'
							: ''}"
						style="min-height: 120px;"
					>
						<p>{format(day, 'd')}</p>
						{#if isSameMonth(day, currentDate)}
							{#each expandedEvents as event}
								{#if isSameDay(event.start, day)}
									<div
										onclick={() => goToEvent(event._id)}
										class="badge bg-primary w-100 mb-1 event-link"
									>
										📅 {event.title}
									</div>
								{/if}
							{/each}
							{#each data.tasks as task}
								{#if isSameDay(task.deadline, day)}
									<div
										onclick={() => goToTask(task._id)}
										class="badge w-100 mb-1 event-link {task.status === 'late'
											? 'bg-danger'
											: 'bg-success'}"
									>
										📝 {task.title}
									</div>
								{/if}
							{/each}
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<SelectionModal titleModal="Seleziona cosa vuoi aggiungere" idModal="eventTypeModal">
	<button
		type="button"
		class="btn btn-primary me-2"
		data-bs-dismiss="modal"
		onclick={() => goto('/calendario/event/addEvent')}
	>
		<i class="bi bi-calendar-plus"></i> Evento
	</button>
	<button
		type="button"
		class="btn btn-success"
		data-bs-dismiss="modal"
		onclick={() => goto('/calendario/task/addTask')}
	>
		<i class="bi bi-list-task"></i> Attività
	</button>
</SelectionModal>

<Btn modalTarget="#eventTypeModal" ariaLabel="Aggiungi evento o attività" />

<div class="mt-4 d-flex justify-content-between">
	<div>
		<button class="btn btn-outline-primary" onclick={goBack}> Indietro </button>
		<button class="btn btn-outline-primary" onclick={goAhead}> Avanti </button>
	</div>
</div>

<style>
	.event-link {
		cursor: pointer;
		transition: filter 0.2s ease-in-out;
	}

	.event-link:hover {
		filter: brightness(90%);
	}

	.today {
		background-color: #e0f7fa;
	}
	.task-late {
		background-color: #ffebee;
		color: #c62828;
		border-color: #c62828 !important;
	}
	.badge {
		white-space: normal;
		text-align: left;
	}
</style>

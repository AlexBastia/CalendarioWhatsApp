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
	import WeeklyView from '$lib/components/WeeklyView.svelte';

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
	let expandedEvents = $state([]);

	let currentDateFormated = $derived.by(() => {
		let dateString = '';
		switch (viewMode) {
			case 'daily':
				dateString = format(currentDate, 'do LLL');
				break;
			case 'weekly':
				dateString = format(startOfWeek(currentDate), 'do LLL') + ' - ' + format(endOfWeek(currentDate), 'do LLL');
				break;
			case 'monthly':
				dateString = format(currentDate, 'MMMM');
				break;
		}
		return dateString;
	});

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

	function goBack() {
		if (viewMode === 'daily') currentDate = subDays(currentDate, 1);
		else if (viewMode === 'weekly') currentDate = subDays(currentDate, 7);
		else currentDate = subMonths(currentDate, 1);
	}

	function goAhead() {
		if (viewMode === 'daily') currentDate = addDays(currentDate, 1);
		else if (viewMode === 'weekly') currentDate = addDays(currentDate, 7);
		else currentDate = addMonths(currentDate, 1);
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

	$effect(() => {
		console.log(viewMode);
	});
</script>

<Title title={'Calendario'} backLink={'/'}>
	<button
		class="btn fs-1"
		type="button"
		data-bs-toggle="offcanvas"
		data-bs-target="#calendarMenu"
		aria-controls="calendarMenu"
		aria-label="Open calendar menu"
	>
		<i class="bi bi-list"></i>
	</button>
</Title>

<div
	class="offcanvas offcanvas-start"
	tabindex="-1"
	id="calendarMenu"
	aria-labelledby="calendarMenuLabel"
>
	<div class="offcanvas-header">
		<h5 class="offcanvas-title" id="calendarMenuLabel">WhatsApp Calendar</h5>
		<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
	</div>
	<div class="offcanvas-body">
		<div class="list-group list-group-flush">
			<button
				onclick={() => (viewMode = 'daily')}
				type="button"
				data-bs-dismiss="offcanvas"
				class="list-group-item list-group-item-action"><i class="bi bi-calendar2-day"></i> Day</button
			>
			<button
				onclick={() => (viewMode = 'weekly')}
				type="button"
				data-bs-dismiss="offcanvas"
				class="list-group-item list-group-item-action"><i class="bi bi-calendar2-week"></i> Week</button
			>
			<button
				onclick={() => (viewMode = 'monthly')}
				type="button"
				data-bs-dismiss="offcanvas"
				class="list-group-item list-group-item-action"><i class="bi bi-calendar2-month"></i> Month</button
			>
		</div>
		<div class="mt-5" style="margin-inline: auto; width: fit-content;">
			<GoogleCalendar />
		</div>
	</div>
</div>

<div class="container-fluid d-flex align-items-center justify-content-between mb-4 mt-4">
	<button class="btn btn-outline-primary rounded-pill fs-6" onclick={goBack} aria-label="Go back">
		<i class="bi bi-chevron-left"></i>
	</button>
	<h3 class="fs-1">
		{currentDateFormated}
	</h3>
	<button class="btn btn-outline-primary rounded-pill fs-6" onclick={goAhead} aria-label="Go ahead">
		<i class="bi bi-chevron-right"></i>
	</button>
</div>

{#if viewMode === 'daily'}
	<DailyView
		events={expandedEvents.filter((event) => isSameDay(currentDate, event.start))}
		tasks={data.tasks.filter((task) => isSameDay(currentDate, task.deadline))}
		lateTasks={data.tasks.filter((task) => task.status === 'late')}
		isToday={isSameDay(currentDate, today)}
		{goToEvent}
		{goToTask}
		{currentDate}
	/>
{:else if viewMode === 'weekly'}
	<WeeklyView {weekDays} {today} {expandedEvents} tasks={data.tasks} {goToEvent} {goToTask} />
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

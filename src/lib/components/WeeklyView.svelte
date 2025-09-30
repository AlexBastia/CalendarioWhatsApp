<script>
	import DayColumn from './dayColumn.svelte';
	import { isSameDay, format } from 'date-fns';
	import { onMount } from 'svelte';
	import TaskAndEventList from './TaskAndEventList.svelte';

	let { weekDays, today, expandedEvents, tasks, goToEvent, goToTask } = $props();
	let scrollContainer;

	onMount(() => {
		if (scrollContainer) {
			scrollContainer.scrollTop = 8 * 60; // Scrolla alle 8:00
		}
	});
</script>

<div class="calendar-container">
	<div class="d-flex">
		<div class="time-labels-spacer"></div>
		<div class="d-flex flex-grow-1">
			{#each weekDays as day (day)}
				<div class="day-header text-center p-2 flex-fill">
					<div class="fw-bold">{format(day, 'EEE')}</div>
					<div class="fs-4 {isSameDay(day, today) ? 'text-primary' : ''}">{format(day, 'd')}</div>
                <TaskAndEventList {goToEvent} {goToTask} tasks={tasks.filter(task => isSameDay(task.deadline, day))}/>
				</div>
			{/each}
		</div>
	</div>

	<div class="content-row" bind:this={scrollContainer}>
		<div class="d-flex align-items-start">
			<div class="time-labels">
				{#each Array(24) as _, hour}
					<div class="time-label text-end pe-2">
						<span>{hour}:00</span>
					</div>
				{/each}
			</div>

			<div class="d-flex flex-grow-1">
				{#each weekDays as day (day)}
					<div class="flex-fill position-relative">
						<DayColumn
							{day}
							events={expandedEvents.filter((e) => isSameDay(e.start, day))}
							{tasks}
							{goToEvent}
							{goToTask}
						/>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.calendar-container {
		border: 1px solid #dee2e6;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.time-labels-spacer,
	.time-labels {
		width: 65px; /* Larghezza fissa per la colonna delle ore */
		flex-shrink: 0;
	}

	.day-header {
		border-bottom: 1px solid #dee2e6;
		border-left: 1px solid #dee2e6;
	}

	.content-row {
		overflow-y: auto;
		max-height: 70vh;
		scrollbar-gutter: stable; /* <-- AGGIUNGI QUESTA RIGA */
	}

	.time-label {
		height: 60px;
		font-size: 0.75rem;
		color: #6c757d;
	}

	.time-label span {
		position: relative;
		top: -0.6em; /* Centra il testo sulla linea */
	}
</style>

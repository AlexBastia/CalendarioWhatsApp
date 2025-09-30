<script>
	import { format } from 'date-fns';
	import { onMount } from 'svelte';

	let { events, tasks, lateTasks, isToday, goToEvent, goToTask, currentDate } = $props();

	let currentTimeIndicator = $state(null);
	let processedEvents = $derived(processEventOverlaps(events));

	// Process events to handle overlaps
	function processEventOverlaps(events) {
		// Filter and sort timed events
		const timedEvents = events
			.filter((e) => !e.allDay)
			.map((e) => ({
				...e,
				startMinutes: e.start.getHours() * 60 + e.start.getMinutes(),
				endMinutes: e.end.getHours() * 60 + e.end.getMinutes()
			}))
			.sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

		// Group overlapping events
		const groups = [];
		let currentGroup = [];

		timedEvents.forEach((event) => {
			if (currentGroup.length === 0) {
				currentGroup.push(event);
			} else {
				// Check if event overlaps with any event in current group
				const overlaps = currentGroup.some(
					(groupEvent) => event.startMinutes < groupEvent.endMinutes
				);

				if (overlaps) {
					currentGroup.push(event);
				} else {
					groups.push([...currentGroup]);
					currentGroup = [event];
				}
			}
		});

		if (currentGroup.length > 0) {
			groups.push(currentGroup);
		}

		// Assign columns to each event in each group
		const processedEvents = [];

		groups.forEach((group) => {
			const columns = [];

			group.forEach((event) => {
				// Find the first available column
				let column = 0;
				while (true) {
					const canUseColumn =
						!columns[column] || columns[column].every((e) => event.startMinutes >= e.endMinutes);

					if (canUseColumn) {
						if (!columns[column]) columns[column] = [];
						columns[column].push(event);
						event.column = column;
						event.totalColumns = 0; // Will be updated
						break;
					}
					column++;
				}
			});

			// Set total columns for all events in group
			const totalColumns = columns.length;
			group.forEach((event) => {
				event.totalColumns = totalColumns;
				processedEvents.push(event);
			});
		});

		return processedEvents;
	}

	onMount(() => {
		setTimeout(() => {
			if (currentTimeIndicator) {
				currentTimeIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 400);
	});
</script>

<div class="card-body p-0">
	<!-- All-day events and tasks -->
	<div class="list-group list-group-flush border-bottom mb-2 sticky-top bg-white">
		{#each events.filter((event) => event.allDay) as event}
			<button
				onclick={() => goToEvent(event._id)}
				class="list-group-item list-group-item-action event-link d-flex align-items-center"
			>
				<i class="bi bi-calendar-event me-2"></i>
				<span>{event.title}</span>
			</button>
		{/each}
		{#each tasks as task}
			{#if task.status !== 'late'}
				<button
					onclick={() => goToTask(task._id)}
					class="list-group-item list-group-item-action event-link d-flex align-items-center"
				>
					<i class="bi bi-check2-square me-2"></i>
					<span>{task.title}</span>
				</button>
			{/if}
		{/each}
		{#if isToday}
			{#each lateTasks as task}
				<button
					onclick={() => goToTask(task._id)}
					class="list-group-item list-group-item-action event-link task-late d-flex align-items-center"
				>
					<i class="bi bi-exclamation-triangle-fill me-2"></i>
					<span>{task.title} (Scaduta)</span>
				</button>
			{/each}
		{/if}
	</div>

	<!-- Hourly timeline -->
	<div class="timeline-container">
		{#each Array(24) as _, hour}
			<div class="hour-slot" data-hour={hour}>
				<div class="hour-label">{hour.toString().padStart(2, '0')}:00</div>
				<div class="hour-content">
					{#if isToday && currentDate.getHours() === hour}
						<div
							class="current-time"
							bind:this={currentTimeIndicator}
							style="--minutes: {currentDate.getMinutes() / 60};"
						>
							<div class="time-line"></div>
							<i class="bi bi-caret-right-fill time-indicator"></i>
						</div>
					{/if}
					{#each processedEvents as event}
						{#if event.start.getHours() === hour}
							{@const duration = Math.min((event.end - event.start) / (1000 * 60 * 60), 24 - hour)}
							{@const startOffset = event.start.getMinutes() / 60}
							{@const hoursSpan = Math.ceil((event.endMinutes - event.startMinutes) / 60)}
							{@const width = event.totalColumns > 0 ? 100 / event.totalColumns : 100}
							{@const left = event.column * width}

							<button
								class="event-card"
								onclick={() => goToEvent(event._id)}
								style="
                                    --duration: {duration};
                                    --start-offset: {startOffset};
                                    --hours-span: {hoursSpan};
                                    --width: {width}%;
                                    --left: {left}%;
                                "
							>
								<div class="event-time">
									{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
								</div>
								<div class="event-title">{event.title}</div>
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.timeline-container {
		position: relative;
		margin: 0 1rem;
		padding-bottom: 30vh;
	}

	.hour-slot {
		display: grid;
		grid-template-columns: 3.5rem 1fr;
		min-height: 3.5rem;
		border-top: 1px solid #dee2e6;
	}

	.business-hour {
		background-color: rgba(0, 123, 255, 0.02);
	}

	.hour-label {
		padding: 0.25rem 0.5rem;
		color: #6c757d;
		font-size: 0.75rem;
		text-align: right;
	}

	.hour-content {
		position: relative;
		margin-left: 0.5rem;
	}

	.current-time {
		position: absolute;
		left: -0.5rem;
		right: 0;
		top: calc(var(--minutes) * 100%);
		z-index: 10;
		pointer-events: none;
	}

	.time-line {
		position: absolute;
		left: 0.5rem;
		right: 0;
		height: 2px;
		background-color: #dc3545;
		top: 50%;
		transform: translateY(50%);
	}

	.time-indicator {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		color: #dc3545;
		font-size: 1.2rem;
	}

	.event-card {
		position: absolute;
		left: var(--left);
		width: calc(var(--width) - 2px);
		top: calc(var(--start-offset) * 100%);
		background: linear-gradient(135deg, var(--bs-primary), #0056b3);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		height: calc(var(--hours-span) * 3.5rem * var(--duration) / var(--hours-span));
		min-height: 1.5rem;
		overflow: hidden;
		transition: all 0.15s ease-in-out;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	.event-card:hover {
		transform: scale(1.02);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		z-index: 6;
	}

	.event-card:active {
		transform: scale(0.98);
	}

	.event-time {
		font-size: 0.7rem;
		opacity: 0.9;
		margin-bottom: 0.1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
	}

	.event-title {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.2;
		width: 100%;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hour-slot {
			grid-template-columns: 3rem 1fr;
		}

		.hour-label {
			font-size: 0.7rem;
			padding: 0.25rem;
		}

		.event-card {
			font-size: 0.75rem;
			padding: 0.2rem 0.4rem;
		}

		.event-time {
			font-size: 0.65rem;
		}
	}

	/* All-day events sticky header */
	.sticky-top {
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.list-group-item {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	.task-late {
		background-color: rgba(220, 53, 69, 0.1);
		color: #dc3545;
	}

	.task-late:hover {
		background-color: rgba(220, 53, 69, 0.2);
	}
</style>

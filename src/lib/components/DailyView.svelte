<script>
	let { events, tasks, lateTasks } = $props();
</script>

<div class="card-body p-0">
	<!-- All-day events and tasks -->
	<div class="list-group list-group-flush border-bottom mb-2">
		{#each events as event}
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
		{#if isSameDay(currentDate, today)}
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
			{@const isBusinessHour = hour >= 9 && hour <= 17}
			<div class="hour-slot {isBusinessHour ? 'business-hour' : ''}" data-hour={hour}>
				<div class="hour-label">{hour.toString().padStart(2, '0')}:00</div>
				<div class="hour-content">
					{#each events as event}
						{#if !event.allDay && event.start.getHours() === hour}
							<button
								class="event-card"
								onclick={() => goToEvent(event._id)}
								style="--duration: {Math.min(
									(new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60),
									24 - hour
								)};"
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
	}

	.hour-slot {
		display: grid;
		grid-template-columns: 4rem 1fr;
		min-height: 3rem;
		border-top: 1px solid #dee2e6;
	}

	.hour-slot.business-hour {
		min-height: 5rem;
		background-color: #ffffff;
	}

	.hour-label {
		padding: 0.25rem;
		color: #6c757d;
		font-size: 0.875rem;
		text-align: right;
		padding-right: 1rem;
	}

	.hour-content {
		position: relative;
		padding: 0.25rem;
	}

	.event-card {
		position: absolute;
		left: 0.25rem;
		right: 0.25rem;
		background: var(--bs-primary);
		color: white;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		height: calc(var(--duration) * 100%);
		min-height: 2.5rem;
		overflow: hidden;
		transition: transform 0.15s ease-in-out;
	}

	.event-card:hover {
		transform: scale(1.02);
	}

	.event-time {
		font-size: 0.75rem;
		opacity: 0.9;
		margin-bottom: 0.25rem;
	}

	.event-title {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

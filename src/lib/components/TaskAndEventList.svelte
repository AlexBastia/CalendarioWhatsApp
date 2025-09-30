<script>
	let { events, tasks, lateTasks, isToday, goToEvent, goToTask } = $props();
</script>

<div class="list-group list-group-flush border-bottom mb-2 bg-white">
	{#each events?.filter((event) => event.allDay) as event}
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
				class="list-group-item list-group-item-action event-link d-flex align-items-center {task.status ===
				'done'
					? 'done-task'
					: ''}"
				disabled={task.status === 'done'}
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

<style>
    .done-task {
        text-decoration-line: line-through;
    }
</style>

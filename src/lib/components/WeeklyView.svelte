<script>
    import { format, isSameDay, addHours } from 'date-fns';
    import TaskAndEventList from './TaskAndEventList.svelte';
    import DayColumn from './dayColumn.svelte';

    let { weekDays, today, expandedEvents, tasks, goToEvent, goToTask } = $props();

    let timelineScroll;
    let timeTimeline;
</script>

<div class="weekly-view">
    <!-- Header Row: Day names and dates -->
    <div class="header-row">
        <div class="time-header"></div>
        {#each weekDays as day}
            <div class="day-header">
                <div class="day-name">{format(day, 'EEE')}</div>
                <div class="day-date">{format(day, 'd')}</div>
                {#if isSameDay(day, today)}
                    <div class="today-indicator">Oggi</div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Main Content: All-day band + Timeline -->
    <div class="main-content">
        <!-- Time labels column -->
        <div class="time-column">
            <!-- Empty space for all-day band alignment -->
            <div class="all-day-spacer"></div>
            <!-- Hour labels for timeline -->
            <div class="timeline-labels" bind:this={timeTimeline}>
                {#each Array(24) as _, hour}
                    <div class="hour-label">
                        {format(addHours(new Date(1970, 0, 1), hour), 'HH:mm')}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Days content -->
        <div class="days-container">
            <!-- All-day band -->
            <div class="all-day-band">
                {#each weekDays as day}
                    <div class="all-day-cell">
                        <TaskAndEventList
                            events={expandedEvents.filter((event) => isSameDay(event.start, day) && event.allDay)}
                            tasks={tasks.filter((task) => isSameDay(task.deadline, day) && task.status !== 'late')}
                            lateTasks={tasks.filter((task) => isSameDay(task.deadline, day) && task.status === 'late')}
                            isToday={isSameDay(day, today)}
                            {goToEvent}
                            {goToTask}
                        />
                    </div>
                {/each}
            </div>

            <!-- Timeline band -->
            <div class="timeline-band" bind:this={timelineScroll} on:scroll={() => timeTimeline.scrollTop = timelineScroll.scrollTop}>
                {#each weekDays as day}
                    <DayColumn
                        day={day}
                        events={expandedEvents.filter((event) => isSameDay(event.start, day) && !event.allDay)}
                        tasks={[]}
                        {goToEvent}
                        {goToTask}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .weekly-view {
        display: flex;
        flex-direction: column;
        height: 80vh; /* Adjust to fit viewport */
        overflow: hidden;
    }

    .header-row {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr); /* Time column width + 7 days */
        background-color: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
        font-weight: bold;
    }

    .time-header {
        /* Empty for alignment */
    }

    .day-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem 0.25rem;
        border-right: 1px solid #dee2e6;
        min-height: 50px; /* Fixed height for header */
    }

    .day-header:last-child {
        border-right: none;
    }

    .day-name {
        font-size: 0.9em;
        color: #6c757d;
    }

    .day-date {
        font-size: 1.2em;
        color: #212529;
    }

    .today-indicator {
        font-size: 0.8em;
        color: #0d6efd;
        margin-top: 2px;
    }

    .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    .time-column {
        width: 60px;
        background-color: #f8f9fa;
        border-right: 1px solid #dee2e6;
        display: flex;
        flex-direction: column;
    }

    .all-day-spacer {
        height: 150px; /* Fixed height for all-day band */
        border-bottom: 1px solid #dee2e6;
    }

    .timeline-labels {
        flex: 1;
        overflow-y: scroll;
    }

    .hour-label {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        color: #6c757d;
        border-bottom: 1px solid #dee2e6;
        padding: 0 4px;
    }

    .hour-label:last-child {
        border-bottom: none;
    }

    .days-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .all-day-band {
        height: 150px; /* Match spacer */
        overflow-y: scroll;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid #dee2e6;
    }

    .all-day-cell {
        border-right: 1px solid #dee2e6;
        padding: 0.5rem;
        overflow-y: auto;
    }

    .all-day-cell:last-child {
        border-right: none;
    }

    :global(.all-day-cell .list-group) {
        min-height: 100%;
    }

    .timeline-band {
        flex: 1;
        overflow-y: scroll;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
    }

    /* Ensure DayColumn aligns properly */
    :global(.timeline-band .day-column) {
        border-right: 1px solid #dee2e6;
    }

    :global(.timeline-band .day-column:last-child) {
        border-right: none;
    }

    /* Hide scrollbars but keep scrolling functionality */
    .timeline-band::-webkit-scrollbar,
    .all-day-band::-webkit-scrollbar,
    .timeline-labels::-webkit-scrollbar {
        display: none;
    }

    .timeline-band,
    .all-day-band,
    .timeline-labels {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .header-row {
            grid-template-columns: 50px repeat(7, 1fr);
        }

        .time-column {
            width: 50px;
        }

        .hour-label {
            font-size: 0.7em;
        }
    }
</style>
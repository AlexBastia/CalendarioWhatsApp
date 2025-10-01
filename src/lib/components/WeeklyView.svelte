<script>
    import { format, isSameDay, addHours, startOfDay, endOfDay } from 'date-fns';
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
                    <div class="today-dot"></div>
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

        <div class="days-container">
            <div class="all-day-band">
                {#each weekDays as day}
                    {@const allDayEvents = expandedEvents.filter((event) => {
                        const isMultiOrAllDay = event.allDay || !isSameDay(event.start, event.end);
                        if (!isMultiOrAllDay) return false;
                        const dayStart = startOfDay(day);
                        const dayEnd = endOfDay(day);
                        return event.start < dayEnd && event.end > dayStart;
                    })}
                    {@const dayTasks = tasks.filter((task) => isSameDay(task.deadline, day) && task.status !== 'late')}
                    {@const dayLateTasks = tasks.filter((task) => isSameDay(task.deadline, day) && task.status === 'late')}
                    {@const totalTasks = dayTasks.length + (isSameDay(day, today) ? dayLateTasks.length : 0)}
                    <div class="all-day-cell">
                        <div 
                            class="mini-count" 
                            data-bs-toggle="modal" 
                            data-bs-target="#allDayModal-{day.getTime()}"
                        >
                            📅 {allDayEvents.length} | 📝 {totalTasks}
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Timeline band -->
            <div class="timeline-band" bind:this={timelineScroll} on:scroll={() => timeTimeline.scrollTop = timelineScroll.scrollTop}>
                {#each weekDays as day}
                    <DayColumn
                        day={day}
                        events={expandedEvents.filter((event) => isSameDay(event.start, day) && !event.allDay && isSameDay(event.start, event.end))}
                        tasks={[]}
                        {goToEvent}
                        {goToTask}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>

<!-- Modals for each day -->
{#each weekDays as day}
    <div class="modal fade" id="allDayModal-{day.getTime()}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Elementi Tutto il Giorno per {format(day, 'PPP')}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <TaskAndEventList
                        events={expandedEvents.filter((event) => {
                            const isMultiOrAllDay = event.allDay || !isSameDay(event.start, event.end);
                            if (!isMultiOrAllDay) return false;
                            const dayStart = startOfDay(day);
                            const dayEnd = endOfDay(day);
                            return event.start < dayEnd && event.end > dayStart;
                        })}
                        tasks={tasks.filter((task) => isSameDay(task.deadline, day) && task.status !== 'late')}
                        lateTasks={tasks.filter((task) => isSameDay(task.deadline, day) && task.status === 'late')}
                        isToday={isSameDay(day, today)}
                        {goToEvent}
                        {goToTask}
                    />
                </div>
            </div>
        </div>
    </div>
{/each}

<style>
    .weekly-view {
        display: flex;
        flex-direction: column;
        height: 80vh; 
        overflow: hidden;
    }

    .header-row {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr); 
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
        background-color: #f8f9fa;
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

    .today-dot {
        width: 8px;
        height: 8px;
        background-color: #0d6efd;
        border-radius: 50%;
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
        height: 40px; /* Fixed height for all-day band */
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
        height: 40px; /* Match spacer */
        overflow-y: scroll;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid #dee2e6;
        background-color: #f8f9fa;
    }

    .all-day-cell {
        border-right: 1px solid #dee2e6;
        padding: 0.25rem;
        overflow-y: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;
    }

    .all-day-cell:last-child {
        border-right: none;
    }

    .mini-count {
        cursor: pointer;
        font-size: 0.75em;
        color: #6c757d;
        text-align: center;
    }

    .mini-count:hover {
        color: #0d6efd;
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
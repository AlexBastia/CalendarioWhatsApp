<script>
    import { calculateEventLayout } from '$lib/utils/layoutCalculator.js';
    import { format } from 'date-fns';
	import TaskAndEventList from './TaskAndEventList.svelte';

    let { day, events = [], tasks = [], goToEvent, goToTask } = $props();

    // Calcola il layout degli eventi usando la nostra funzione
    let layoutEvents = $derived(calculateEventLayout(events));
</script>

<div class="day-column position-relative">
    {#each Array(24) as _, hour}
        <div class="hour-slot"></div>
    {/each}

    {#each layoutEvents as event (event._id)}
        <div
            class="event-block bg-primary text-white rounded p-1"
            style="
                top: {event.top}%;
                height: {event.height}%;
                width: calc({event.width}% - 4px);
                left: {event.left}%;
            "
            onclick={() => goToEvent(event._id)}
            title="{event.title} ({format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')})"
        >
            <strong>{event.title}</strong>
            <p class="mb-0 small">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</p>
        </div>
    {/each}
</div>

<style>
    .day-column {
        min-height: calc(24 * 60px); /* 24 ore * 60px/ora */
        border-left: 1px solid #dee2e6;
    }
    .day-column:first-child {
        border-left: none;
    }

    .hour-slot {
        height: 60px;
        border-bottom: 1px solid #dee2e6; /* La linea oraria */
    }
    .hour-slot:last-child {
        border-bottom: none;
    }

    .event-block {
        position: absolute;
        overflow: hidden;
        cursor: pointer;
        transition: filter 0.2s;
        border: 1px solid white;
        font-size: 0.8em;
        z-index: 1; /* Assicura che gli eventi siano sopra la griglia */
    }
    .event-block:hover {
        filter: brightness(1.2);
    }
</style>
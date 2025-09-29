<script>
    import EventForm from '$lib/components/eventForm.svelte';
    import { format } from 'date-fns';
    
    let { data } = $props();

    let eventoPerForm = {
        ...data.evento,
        dateStart: data.evento.start ? format(new Date(data.evento.start), 'yyyy-MM-dd') : '',
        
        timeStart: data.evento.start ? format(new Date(data.evento.start), 'HH:mm') : '',

        dateEnd: data.evento.end ? format(new Date(data.evento.end), 'yyyy-MM-dd') : '',
        timeEnd: data.evento.end ? format(new Date(data.evento.end), 'HH:mm') : ''
    };
</script>

<EventForm 
    event={eventoPerForm}
    pomodoroPresets={data.pomodori}
    formAction="/calendario/event?/saveEvent"
    deleteAction="/calendario/event?/deleteEvent"
/>



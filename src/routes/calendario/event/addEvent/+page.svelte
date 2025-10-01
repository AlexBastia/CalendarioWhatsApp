<script>
    import EventForm from '$lib/components/eventForm.svelte';
    let { data, options } = $props(); // Riceve i pomodori caricati dal server
</script>
<EventForm 
    pomodoroPresets={data.pomodori}
    formAction="/calendario/event?/saveEvent"
    deleteAction=""
    options={data.options}
/>
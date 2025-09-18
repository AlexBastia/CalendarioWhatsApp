<script>
    import EventForm from '$lib/components/eventForm.svelte';
    let { data } = $props(); // Riceve i pomodori caricati dal server
</script>

<h1 class="mb-4">Crea Nuovo Evento</h1>

<EventForm 
    pomodoroPresets={data.pomodori}
    formAction="/calendario?/saveEvent"
/>
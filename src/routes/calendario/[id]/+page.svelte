<script>
    import EventForm from '$lib/components/eventForm.svelte';
    import { format } from 'date-fns';
    
    let { data } = $props();

    // Prepariamo l'oggetto 'evento' per il form.
    // Questo è necessario per formattare correttamente le date per gli input HTML.
    let eventoPerForm = {
        ...data.evento,
        // Converte la data di inizio in 'yyyy-MM-dd'
        dateStart: data.evento.start ? format(new Date(data.evento.start), 'yyyy-MM-dd') : '',
        // Converte l'ora di inizio in 'HH:mm'
        timeStart: data.evento.start ? format(new Date(data.evento.start), 'HH:mm') : '',
        // Fai lo stesso per la data/ora di fine, se presente
        dateEnd: data.evento.end ? format(new Date(data.evento.end), 'yyyy-MM-dd') : '',
        timeEnd: data.evento.end ? format(new Date(data.evento.end), 'HH:mm') : ''
    };
</script>

<h1 class="mb-4">Modifica Evento</h1>

<EventForm 
    event={eventoPerForm}
    pomodoroPresets={data.pomodori}
    formAction="/calendario?/saveEvent"

/>
<input name="id" type="hidden" value={data.evento._id} />
<form method="POST" action="/calendario?/deleteEvent" class="mt-4">
    <button class="btn btn-danger" type="submit">Elimina Evento</button>
</form>
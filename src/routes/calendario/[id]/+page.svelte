<script>
    let { data } = $props();
    console.log(data);

    let flag = $state(data.evento.allDay);
    console.log(flag);

    // ! BISOGNEREBBE INSERIRE UN CONTROLLO SULL'INSERIMENTO DELLA DATA
</script>


<form method="POST" action="/calendario?/updateEvent">

    <div class="form-row">
        <input name="id" type="hidden" value={data.evento._id} />
        
        <div class="col-md-4 mb-3">
            <label for="title">Titolo evento</label>
            <input type="text" class="form-control" id="title" name="title" placeholder="Titolo" value="{data.evento.title}">
        </div>

        <div class="col-md-4 mb-3">
            <label for="note">Descrizione</label>
            <input type="text" class="form-control" id="note" name="note" placeholder="Descrizione" value="{data.evento.note}">
        </div>

        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="allDay" name="allDay" bind:checked={flag}>
            <label class="form-check-label" for="allDay">Tutto il giorno</label>
        </div>

        <div class="col-md-4 mb-3">
            <label for="dateStart" class="form-label">Data inizio</label>
            <input type="date" id="dateStart" name="dateStart" class="form-control" required>
            <input type="time" id="timeStart" name="timeStart" disabled={flag}>
        </div>

        <div class="col-md-4 mb-3">
            <label for="timeEnd" class="form-label">Ora fine</label>
            <input type="time" id="timeEnd" name="timeEnd" disabled={flag}>
        </div>

        <div class="form-row">
        <div class="col-md-6 mb-3">
            <label for="location">Posto</label>
            <input type="text" class="form-control" id="location" name="location" placeholder="Posto" value="{data.evento.place}">
        </div>
        </div>
    </div>

    

    <button class="btn btn-primary" type="submit">Submit form</button>

</form>
<form method="POST" action="/calendario?/deleteEvent">
        <input name="id" type="hidden" value={data.evento._id} />
        <button class="btn btn-primary" type="submit">ELIMINA!</button>
</form>

<script>
    // document.getElementById('allDay').addEventListener('change', ()=>{
    //     document.getElementById('time start').disabled = !document.getElementById('time start').disabled;
    //     document.getElementById('time end').disabled = !document.getElementById('time end').disabled; 
    // });

    let falg = false;



</script>

<form method="POST" action="/calendario?/createEvent">
        <div class="form-row">
            <div class="col-md-4 mb-3">
                <label for="title">Titolo evento</label>
                <input type="text" class="form-control" id="title" name="title" placeholder="Titolo" required>
            </div>
            <div class="col-md-4 mb-3">
                <label for="note">Descrizione</label>
                <input type="text" class="form-control" id="note" name="note" placeholder="Descrizione" required>
            </div>
    
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="allDay" name="allDay" bind:checked={falg}>
                <label class="form-check-label" for="allDay">Tutto il giorno</label>
            </div>
    
            <div class="col-md-4 mb-3">
                <label for="dateStart" class="form-label">Data inizio</label>
                <input type="date" id="dateStart" name="dateStart" class="form-control" required>
                <input type="time" id="timeStart" name="timeStart" disabled={falg}>
            </div>
            <div class="col-md-4 mb-3">
                <label for="timeEnd" class="form-label">Ora fine</label>
                <input type="time" id="timeEnd" name="timeEnd" disabled={falg}>
            </div>
        </div>
    
        <div class="form-row">
            <div class="col-md-6 mb-3">
                <label for="location">Posto</label>
                <input type="text" class="form-control" id="location" name="location" placeholder="Posto" value="Villaggio della Foglia" required>
            </div>
        </div>

        <button class="btn btn-primary" type="submit">Submit form</button>
</form>
  
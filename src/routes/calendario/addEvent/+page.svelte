<script>
    // document.getElementById('allDay').addEventListener('change', ()=>{
    //     document.getElementById('time start').disabled = !document.getElementById('time start').disabled;
    //     document.getElementById('time end').disabled = !document.getElementById('time end').disabled; 
    // });

    let falg = false;



</script>

<form>
    <div class="form-row">
        <div class="col-md-4 mb-3">
            <label for="validationDefault01">Titolo evento</label>
            <input type="text" class="form-control" id="title" placeholder="title" required>
        </div>
        <div class="col-md-4 mb-3">
            <label for="validationDefault02">descrizione</label>
            <input type="text" class="form-control" id="note" placeholder="note" required>
        </div>

        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="allDay" bind:checked ={falg}  required>
            <label class="form-check-label" for="terms"> tutto il giorno </label>
        </div>
    
        <div class="col-md-4 mb-3">
            <label for="date" class="form-label"> data start </label>
            <input type="date" id="date" class="form-control">
            <input type="time" id="time start" disabled={falg} />
        </div>
        <div class="col-md-4 mb-3">
            <label for="date" class="form-label"> fine </label>
            <input type="time" id="time end" disabled={falg}>
        </div>
    </div>

    

    <div class="form-row">
      <div class="col-md-6 mb-3">
        <label for="validationDefault03">Posto</label>
        <input type="text" class="form-control" id="validationDefault03" placeholder="City" value="villaggio della foglia" required>
      </div>
    </div>

    <button class="btn btn-primary" type="submit">Submit form</button>
</form>
  
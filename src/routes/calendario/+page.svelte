<script>
  let week = ['dom','lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  let weekscol = [1,2,3,4,5,6];
  let buttonText = 'premi';

  let currentDate = $state(new Date(2024, 11, 2)); // Data corrente
  let firstDayOfTheMounth = $derived(() => {
    let tmp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    if(tmp == 0) 
      return 7;
    else return tmp;
  });



  function goBack() {
    currentDate = previousMonth(currentDate)
  }

  function goAhead(){
    currentDate = nextMonth(currentDate);
  }

  function previousMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
  }

  
  function nextMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  function getDaysInMounth(date) {
    return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
  }
</script>


<div class="gird">
    <div class="row py-2">
      {#each week as day}
          <div class="col">
              {day}
          </div>        
      {/each}
    </div>

    {#each weekscol as raw, j}
      <div class="row py-5">
        {#each week as day, i}
          {#if (i + ((j)*7 )) < firstDayOfTheMounth()}

            <div class="col bg-primary">
              {getDaysInMounth(previousMonth(currentDate))- (firstDayOfTheMounth() - 1 -i)}
            </div>
          
          {:else if (i +  j*7  + 1) - firstDayOfTheMounth() <= getDaysInMounth(currentDate)}
            <div class="col">
              {(i +  j*7  + 1) - firstDayOfTheMounth()} 
            </div>
          {:else}
            <div class="col bg-primary">
              {(i +  j*7  + 1) - firstDayOfTheMounth() - getDaysInMounth(currentDate)}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
</div>

<p>mese: {currentDate.getMonth()} anno: {currentDate.getFullYear()}</p>

<button class="btn btn-outline-primary" on:click={goBack}>
  <i class="bi bi-download"></i> {buttonText}
</button>

<button class="btn btn-outline-primary" on:click={goAhead}>
  <i class="bi bi-download"></i> {buttonText}
</button>



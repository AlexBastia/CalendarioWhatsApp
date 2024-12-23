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

  let p1 = 1;
  let p2 = 1;

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
          
          {:else if p1 <= getDaysInMounth(currentDate)}
            <div class="col">
              {p1++}
            </div>
          {:else}
            <div class="col bg-primary">
              {p2++}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
</div>

<button class="btn btn-outline-primary">
  <i class="bi bi-download"></i> {buttonText}

  efwf
</button>



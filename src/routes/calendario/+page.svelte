<script>
  import { goto } from '$app/navigation';

  let week = ['dom','lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  let weekscol = [1,2,3,4,5,6]; // serve solo per creare un ciclo dentro il while 
  let buttonText = 'premi';

  let {data} = $props();

  console.log(data);

  // inizi con la data corrente
  let currentDate = $state(new Date(2024, 11, 2)); // Data corrente
  
  // calcolo del primo giorno (settimanale) del mese (se è domenica, ovvero 0 ritorna 7)
  let firstDayOfTheMounth = $derived(() => {
    let tmp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    if(tmp == 0) 
      return 7;
    else return tmp;
  });

  function goToForm(){
    goto('/calendario/addEvent');
  }

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
    // giorni del mese
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

    <!-- il calendario è suddiviso così, vi sono 6 righe e 7 colonne come ogni calendario digitale che ho trovato. All'inizio si calcola anche i giorni del mese precedente, e alla fine si calcolano pure i giorni del mese successivo  
     
    basta
    -->


    <!-- righe -->
    {#each weekscol as raw, j} 
      <div class="row py-5">
        <!-- colonne (ovvero i giorni) -->
        {#each week as day, i}

          <!-- se il (i + ((j)*7 ),( ovvero il numero del giorno del mese corrente se si partisse alla posizione (0,0)) < firstDayOfTheMounth()-->
          {#if (i + ((j)*7 )) < firstDayOfTheMounth()}

          <!--  si inserisce i giorni "rimanenti" del mese precedente -->
            <div class="col bg-primary" id="{previousMonth(currentDate).getFullYear()}-{previousMonth(currentDate).getMonth()}-{getDaysInMounth(previousMonth(currentDate))- (firstDayOfTheMounth() - 1 -i)}">

              {getDaysInMounth(previousMonth(currentDate))- (firstDayOfTheMounth() - 1 -i)}

            </div>
          
            <!-- qui, invece, se (i +  j*7  + 1) - firstDayOfTheMounth()  ovvero i giorni del mese corrente - firstDayOfTheMounth() è minore o uguale al numero effettivo dei giorni del mese -->
          {:else if (i +  j*7  + 1) - firstDayOfTheMounth() <= getDaysInMounth(currentDate)}
            <div class="col" id="{currentDate.getFullYear()}-{currentDate.getMonth()}-{(i +  j*7  + 1) - firstDayOfTheMounth()}">
              <!-- si inserisce il numerino del giorno -->
              {(i +  j*7  + 1) - firstDayOfTheMounth()}


              <!-- inserimento degli eventi -->
              {#each data.events as event}

                <!-- se si trova un evento il cui giorno, mese, anno è uguale a quello che abbiamo adesso-->
                {#if event.start.getFullYear() == currentDate.getFullYear() && event.start.getMonth() == currentDate.getMonth() && (i +  j*7  + 1) - firstDayOfTheMounth() == event.start.getDate()}

                  <!-- si inserisce il cuazzo di evento, inoltre se clicchi all'evento ti manda alla pagina dell'evento -->
                  <div class="bg-primary" on:click={() => goto(`/calendario/${event.id}`)} style="cursor: pointer">
                    {event.title}
                </div>

                {/if}
                
              {/each}


            </div> 
          {:else}
            <!-- roba per i mesi sucessivi -->
            <div class="col bg-primary" id="{nextMonth(currentDate).getFullYear()}-{nextMonth(currentDate).getMonth()}-{(i +  j*7  + 1) - firstDayOfTheMounth() - getDaysInMounth(currentDate)}">
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

<button class="btn btn-primary" on:click={goToForm}>aggiungi evento</button>



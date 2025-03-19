<script>
  import { goto } from '$app/navigation';
  import { addDays, addMonths, subMonths, subDays, startOfWeek, format, getMonth, getYear, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
  import "bootstrap/dist/css/bootstrap.min.css";


  let week = ['dom','lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  let weekscol = [1,2,3,4,5,6]; // serve solo per creare un ciclo dentro il while 
  let buttonText = 'premi';
  let {data} = $props();

  console.log(data);
  
  // inizi con la data corrente
  let currentDate = $state(new Date(2024, 11, 2)); // Data corrente
  //modalita` di visualizzazione, il default e` settimanale
  let viewMode = $state('weekly'); // 'daily', 'weekly', 'monthly'
  
  function goToForm(){
    goto('/calendario/addEvent');
  }

  function toggleView() {
    viewMode = viewMode === 'daily' ? 'weekly' 
        : viewMode === 'weekly' ? 'monthly' 
        : 'daily';
  }

  function goBack() {
    currentDate = viewMode === 'daily' ? subDays(currentDate, 1) 
        : viewMode === 'weekly' ? subDays(currentDate, 7) 
        : subMonths(currentDate, 1);
  }

  function goAhead() {
    currentDate = viewMode === 'daily' ? addDays(currentDate, 1) 
        : viewMode === 'weekly' ? addDays(currentDate, 7) 
        : addMonths(currentDate, 1);
  }
//penso questa e la prossima diventano inutili con la libreria date-fns
  function previousMonth(date) { return new Date(date.getFullYear(), date.getMonth() - 1, 1);} 
  function nextMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 1);}
//date-fns ha la funzione endOfMonth
  function getDaysInMounth(date) {return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();}

  //ritorna un array con i giorni della settimana corrente, da domenica a sabato
  function getWeekDays(date) {
    let sunday = startOfWeek(date); 
    return eachDayOfInterval({start, end: addDays(date, 6)});
  }

  // calcolo del primo giorno (settimanale) del mese (se è domenica, ovvero 0 ritorna 7)
  // questa funzione chiama startOfWeek sul primo del mese, quindi e` superflua oltre a non essere generalizzata, la devo togliere prima o poi

  let firstDayOfTheMounth = $derived(() => {
    let tmp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    if(tmp == 0) 
      return 7;
    else return tmp;
  });
</script>

<div class="d-flex align-items-center gap-2">
  <label for="view-mode" class="form-label">Vista:</label>
  <select id="view-mode" class="form-select w-auto" bind:value={$viewMode}>
    <option value="daily">Giornaliera</option>
    <option value="weekly">Settimanale</option>
    <option value="monthly">Mensile</option>
  </select>
</div>

{#if viewMode === 'daily'}
  <div class="grid">
    <div class="row py-5">
      <div class="col border p-3" id="{format(currentDate, 'yyyy-MM-dd')}">
        {format(currentDate, 'dd EEEE')}
        {#each data.events as event}
          {#if format(event.start, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')}
                <button 
									class="bg-primary text-white p-1 mt-2" 
									onclick={() => goto(`/calendario/${event.id}`)} 
									style="cursor: pointer; width: 100%; text-align: left;"
									aria-label="Vai al dettaglio dell'evento {event.title}">
									{event.title}
								</button>
          {/if}
        {/each}
      </div>
    </div>
  </div>
  <p>Giorno: {format(currentDate, 'dd/MM/yyyy')}</p>

{:else if viewMode === 'weekly'}
	<div class="container">
	  <!-- Intestazione della settimana -->
	  <div class="row py-2">
	    {#each week as day}
	      <div class="col text-center">
	        <strong>{format(day, 'EEE')}</strong>
	        <div>{format(day, 'dd')}</div>
	      </div>
	    {/each}
	  </div>
  <div class="row py-5">
    {#each getWeekDays(currentDate) as day}
      <div class="col-md-2 col-sm-4 border p-3" id="{format(day, 'yyyy-MM-dd')}">
        <h5 class="text-center">{format(day, 'dd EEEE')}</h5>
        {#each data.events as event}
          {#if format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')}
            <button 
              class="btn btn-primary text-white p-1 mt-2 w-100 text-left"
              onclick={() => goto(`/calendario/${event.id}`)} 
              aria-label="Vai al dettaglio dell'evento {event.title}">
              {event.title}
            </button>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
  <!-- Data della settimana -->
  <p class="text-center">Settimana di: {format(currentDate, 'dd/MM/yyyy')}</p>
</div>

	
{:else}
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
                    <!-- ho sostituito il div con un button perche` a svelte non piaceva, in piu` ho scoperto questa cosa carina dell'aria-label grazie a chatgpt e siccome Vitali ha detto a lezione che adora il supporto per non vedenti l'ho aggiunta-->
                    <button class="bg-primary" 
                    onclick={() => goto(`/calendario/${event.id}`)} 
                    style="cursor: pointer; width: 100%; text-align: left;"
                    aria-label="Vai al dettaglio dell'evento {event.title}">
                    {event.title}
                  </button>

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
{/if}
<button class="btn btn-outline-primary" onclick={goBack}>
  <i class="bi bi-download"></i> {buttonText}
</button>

<button class="btn btn-outline-primary" onclick={goAhead}>
  <i class="bi bi-download"></i> {buttonText}
</button>

<button class="btn btn-primary" onclick={goToForm}>aggiungi evento</button>


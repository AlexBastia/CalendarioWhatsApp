<script>
  import { goto } from '$app/navigation';
  import { 
    addDays, 
    addMonths, 
    subMonths, 
    subDays, 
    startOfWeek, 
    format, 
    getMonth, 
    getYear, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval,
    endOfWeek,
    isSameMonth,
    isSameDay
  } from 'date-fns';
  import "bootstrap/dist/css/bootstrap.min.css";
  import { onMount } from 'svelte';

  let week = ['dom','lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  let {data} = $props();

  console.log(data);
  
  // inizi con la data corrente
  let currentDate = $state(new Date()); // Data corrente
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

  //ritorna un array con i giorni della settimana corrente, da domenica a sabato
  function getWeekDays(date) {
    let sunday = startOfWeek(date);
    let saturday = addDays(sunday, 6);
    return eachDayOfInterval({start: sunday, end: saturday});
  }

  // Nuova funzione per ottenere tutti i giorni da mostrare nel calendario mensile
  function getMonthCalendarDays(date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }

  let weekDays = $derived(getWeekDays(currentDate));
  let monthCalendarDays = $derived(getMonthCalendarDays(currentDate));
</script>

<div class="d-flex align-items-center gap-2">
  <label for="view-mode" class="form-label">Vista:</label>
  <select id="view-mode" class="form-select w-auto" bind:value={viewMode}>
    <option value="daily">Giornaliera</option>
    <option value="weekly">Settimanale</option>
    <option value="monthly">Mensile</option>
  </select>
</div>

{#if viewMode === 'daily'}
  <div class="grid">
    <div class="row py-5">
      <div class="col" id="{format(currentDate, 'yyyy-MM-dd')}">
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
  <div class="container-fluid">
    <div class="row py-2">
      {#each week as day}
        <div class="col text-center">
          <strong>{day}</strong>
        </div>
      {/each}
    </div>
    <div class="row py-5">
      {#each weekDays as d}
        <div class="col-1 col-sm col-md-1 col-lg-1  border p-3" id="{format(d, 'yyyy-MM-dd')}">
          <p class="text-center">{format(d, 'dd EEEE')}</p>
          {#each data.events as event}
            {#if event.start && format(event.start, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')}
              <button class="bg-primary"
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
  <!-- VISUALIZZAZIONE MENSILE REFACTORIZZATA -->
  <div class="grid">
    <!-- Intestazione con i giorni della settimana -->
    <div class="row py-2">
      {#each week as day}
        <div class="col">
          {day}
        </div>        
      {/each}
    </div>

    <!-- Calendario mensile usando date-fns -->
    {#each Array(Math.ceil(monthCalendarDays.length / 7)) as _, weekIndex}
      <div class="row py-5">
        {#each monthCalendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7) as day}
          <div class="col {!isSameMonth(day, currentDate) ? 'bg-primary' : ''}" 
               id="{format(day, 'yyyy-MM-dd')}">
            <!-- Mostra il numero del giorno -->
            {format(day, 'd')}
            
            <!-- Mostra gli eventi solo per i giorni del mese corrente -->
            {#if isSameMonth(day, currentDate)}
              {#each data.events as event}
                {#if event.start && isSameDay(event.start, day)}
                  <button class="bg-primary" 
                    onclick={() => goto(`/calendario/${event._id || event.id}`)} 
                    style="cursor: pointer; width: 100%; text-align: left;"
                    aria-label="Vai al dettaglio dell'evento {event.title}">
                    {event.title}
                  </button>
                {/if}
              {/each}
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <p>mese: {currentDate.getMonth() + 1} anno: {currentDate.getFullYear()}</p>
{/if}

<button class="btn btn-outline-primary" onclick={goBack}>
  <i class="bi bi-download"></i> indietro
</button>

<button class="btn btn-outline-primary" onclick={goAhead}>
  <i class="bi bi-download"></i> avanti
</button>

<button class="btn btn-primary" onclick={goToForm}>aggiungi evento</button>
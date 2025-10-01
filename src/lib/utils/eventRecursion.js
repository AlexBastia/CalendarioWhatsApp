import {addDays, addWeeks, addMonths, addYears, 
        startOfDay, startOfWeek, 
        getTime, getDay, getDate, getMonth , getYear} 
  from "date-fns";


export function mkLastDate(event) {
  const ripetizione = event.ripetizione;
  const start = new Date(event.start);
  let lastDate = Infinity;
  
  if (ripetizione.endCondition?.type === "FINO AL") {
    lastDate = new Date(ripetizione.endCondition.endDate);
  } else if (ripetizione.endCondition?.type === "N_VOLTE") {
    //con n = 1, ci sara` una ripetizione (2 istanze dell'evento)
    let n = ripetizione.endCondition.nVolte;
    switch (ripetizione.frequenza) {
      case "GIORNALIERO":
        lastDate = addDays(start, n);
        break;
      case "SETTIMANALE":
        const countPerWeek = ripetizione.giorniSettimana.length || 1;
        const weeksNeeded = Math.floor(n / countPerWeek);
        lastDate = addWeeks(start, weeksNeeded);
        n = n % countPerWeek;
        while(n >= 0){
          if(ripetizione.giorniSettimana.includes(getDay(lastDate))) n = n -1;
          if(n < 0) break;
          lastDate = addDays(lastDate, 1);
        }
        break;
      case "MENSILE":
        lastDate = addMonths(start, n);
        if(ripetizione.monthlyMode === 'nthWeekday') {
          const { week, weekday } = ripetizione.nthWeekday;
          tmpDate = nthWeekdayOfMonth(lastDate, week, weekday);
          if(tmpDate) lastDate = tmpDate;
        }
        //alternativa che non conta i mesi senza candidato viene fin troppo strana
        break;
      case "ANNUALE":
        lastDate = addYears(start, n);
        break;
    }
  }
  return lastDate;
}

function nthWeekdayOfMonth(date, week, weekday) {
  const baseMonth = getMonth(date);
  let d = startOfMonth(date);
  //mi sposto al primo "weekday" del mese
  const diff = (weekday - getDay(d) + 7) % 7;
  d = addDays(d, diff);
  //aggiungo le settimane necessarie
  d = addWeeks(d, week -1);
  if (getMonth(d)!=baseMonth) return null;
  return d;
}

export function expandEvent(event, rangeStart, rangeEnd) {
  //se l'evento non e` ricorrente ritorna l'evento stesso (se nel range)
  if (!event.ripetizione?.isRepeatable) {
    if (event.start >= rangeStart && event.start <= rangeEnd) return [event];
    return [];
  }

  const instances = [];
  const { start, end, ripetizione } = event;
  const durationMs = getTime(end) - getTime(start);
  //ritorna se le istanze finiscono prima dell'inizio di questo range
  ripetizione.lastDate = mkLastDate(event);
  let lastDate = ripetizione.lastDate;
  if (lastDate > rangeEnd) lastDate = rangeEnd;
  if (start > rangeEnd) return [];
  if (lastDate < rangeStart) return [];
  
  const dayOfMonth = getDate(start);

  //pushInstance prende una data (a mezzanotte)
  const pushInstance = (date) => {
    const instStart = new Date(getTime(date));                                   //modifica il giorno a quello dell'istanza
    instStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds());//mantiene l'orario originale
    const instEnd = new Date(getTime(instStart) + durationMs);                   //aggiunge la durata per mantenere la fine originale
    instances.push({ ...event, start: instStart, end: instEnd });                //appende l'evento nell'array di istanze ammissibili
  };

  switch (ripetizione.frequenza) {
    case "GIORNALIERO":
      let dayCursor = startOfDay(start > rangeStart ? start : rangeStart);
      while (dayCursor <= lastDate) {
        pushInstance(dayCursor);
        dayCursor = addDays(dayCursor, 1);
      }
      break;

    case "SETTIMANALE":
      let weekCursor = startOfDay(rangeStart);
      while (weekCursor <= lastDate) {
        const today = getDay(weekCursor);
        if(ripetizione.giorniSettimana.includes(today)) pushInstance(weekCursor);
        weekCursor = addDays(weekCursor, 1);
      }
      break;

    case "MENSILE":
      let monthCursor = startOfDay(rangeStart);
      let day = getDate(monthCursor);
      if(ripetizione.monthlyMode === 'dayOfMonth') {
        let instanceDate = addMonths(start, (getMonth(rangeStart) - getMonth(start)));
        if(getDate(instanceDate) === getDate(start) && instanceDate >= rangeStart && instanceDate <= rangeEnd) {
        pushInstance(instanceDate);
        }
      } else {
        let instanceDate = nthWeekdayOfMonth(rangeStart, ripetizione.nthWeekday.week, ripetizione.nthWeekday.weekday);
        if(instanceDate){
          if(instanceDate >= rangeStart && instanceDate <= rangeEnd) pushInstance(instanceDate);
        }
      }
      break;

    case "ANNUALE":
      let instanceDate = addYears(start, (getYear(rangeStart) - getYear(start)));
      if(getDate(instanceDate) === getDate(start) && instanceDate >= rangeStart && instanceDate <= rangeEnd) {
        pushInstance(instanceDate);
      }
      break;
  }

  return instances;
}
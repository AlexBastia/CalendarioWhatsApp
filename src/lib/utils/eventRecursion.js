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
    const n = ripetizione.endCondition.nVolte;
    switch (ripetizione.frequenza) {
      case "GIORNALIERO":
        lastDate = addDays(start, n - 1);
        break;
      case "SETTIMANALE":
        const countPerWeek = ripetizione.giorniSettimana.length || 1;
        const weeksNeeded = Math.floor(n / countPerWeek);
        //sketchy math, catchy meth
        lastDate = addWeeks(start, weeksNeeded);
        lastDate = startOfWeek(lastDate);
        lastDate = addDays(lastDate, ripetizione.giorniSettimana[n%countPerWeek]);
        break;
      case "MENSILE":
        lastDate = addMonths(start, n - 1);
        break;
      case "ANNUALE":
        lastDate = addYears(start, n - 1);
        break;
    }
  }
  return lastDate;
}


export function expandEvent(event, rangeStart, rangeEnd) {
  if (!event.ripetizione?.isRepeatable) {
    if (event.start >= rangeStart && event.start <= rangeEnd) return [event];
    return [];
  }

  const instances = [];
  const { start, end, ripetizione } = event;
  const durationMs = getTime(end) - getTime(start);

  // --- Calcolo lastDate in base a endCondition ---
  let lastDate = mkLastDate(event);
  if (lastDate > rangeEnd) lastDate = rangeEnd;
  const dayOfMonth = getDate(start);
  const pushInstance = (date) => {
    const instStart = new Date(getTime(date));
    instStart.setHours(start.getHours(), start.getMinutes(), start.getSeconds());
    const instEnd = new Date(getTime(instStart) + durationMs);
    instances.push({ ...event, start: instStart, end: instEnd });
  };

  switch (ripetizione.frequenza) {
    case "GIORNALIERO":
      let dayCursor = startOfDay(rangeStart);
      while (dayCursor <= lastDate) {
        pushInstance(dayCursor);
        dayCursor = addDays(dayCursor, 1);
      }
      break;

    case "SETTIMANALE":
      let weekCursor = startOfDay(rangeStart);
      while (weekCursor <= lastDate) {
        for (const dayofweek of ripetizione.giorniSettimana) {
          const offset = (dayofweek + 7 - getDay(weekCursor)) % 7;
          const instanceDate = addDays(weekCursor, offset);
          if (instanceDate > lastDate) continue;
          if (instanceDate >= rangeStart) {
            pushInstance(instanceDate);
          }
        }
        weekCursor = addWeeks(weekCursor, 1);
      }
      break;

    case "MENSILE":
      let monthCursor = startOfDay(start);
      while (monthCursor <= lastDate) {
        const year = getYear(monthCursor);
        const month = getMonth(monthCursor);

        if (ripetizione.monthlyMode === 'dayOfMonth') {
          // Fixed: calculate dayOfMonth from original start date
          const dayOfMonth = start.getDate();
          const instanceDate = new Date(year, month, dayOfMonth);
          if (instanceDate >= rangeStart && instanceDate <= lastDate) {
            pushInstance(instanceDate);
          }
        }

        if (ripetizione.monthlyMode === 'nthWeekday' && ripetizione.nthWeekday?.week) {
          const weekday = ripetizione.nthWeekday.weekday;
          const weekNum = ripetizione.nthWeekday.week;
          let count = 0;
          for (let d = 1; d <= 31; d++) {
            const date = new Date(year, month, d);
            if (date.getMonth() !== month) break;
            if (date.getDay() === weekday) count++;
            if (count === weekNum) {
              if (date >= rangeStart && date <= lastDate) {
                pushInstance(date);
              }
              break;
            }
          }
        }

        monthCursor = addMonths(monthCursor, 1);
      }
      break;

    case "ANNUALE":
      let yearCursor = startOfDay(start);
      const startMonth = getMonth(start);
      while (yearCursor <= lastDate) {
        const year = getYear(yearCursor);
        const instanceDate = new Date(year, startMonth, dayOfMonth);
          if (instanceDate >= rangeStart && instanceDate <= lastDate) {
            pushInstance(instanceDate);
          }
        
        yearCursor = addYears(yearCursor, 1);
      }
      break;
  }

  return instances;
}
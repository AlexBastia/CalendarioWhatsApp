/**
 * Controlla se due eventi si sovrappongono nel tempo.
 * @param {object} eventA
 * @param {object} eventB
 * @returns {boolean}
 */
function eventsOverlap(eventA, eventB) {
    return eventA.start < eventB.end && eventA.end > eventB.start;
}

/**
 * Calcola la posizione e le dimensioni degli eventi per un singolo giorno
 * in modo da gestire le sovrapposizioni.
 * @param {Array<object>} events - La lista di eventi del giorno.
 * @returns {Array<object>} - La lista di eventi con le proprietà di layout.
 */
export function calculateEventLayout(events) {
    if (!events || events.length === 0) {
        return [];
    }

    // Ordina gli eventi per ora di inizio, e per durata se l'inizio è uguale
    const sortedEvents = [...events].sort((a, b) => {
        if (a.start.getTime() !== b.start.getTime()) {
            return a.start.getTime() - b.start.getTime();
        }
        return b.end.getTime() - a.end.getTime(); // L'evento più lungo prima
    });

    const layoutEvents = [];

    // Trova i gruppi di eventi che si sovrappongono
    const collisionGroups = [];
    sortedEvents.forEach((event) => {
        let placed = false;
        for (const group of collisionGroups) {
            // Un evento appartiene a un gruppo se si sovrappone con ALMENO un evento del gruppo
            if (group.some((e) => eventsOverlap(e, event))) {
                group.push(event);
                placed = true;
                break;
            }
        }
        if (!placed) {
            collisionGroups.push([event]);
        }
    });

    collisionGroups.forEach((group) => {
        const columns = [];
        group.sort((a, b) => a.start.getTime() - b.start.getTime());

        group.forEach((event) => {
            let colIndex = 0;
            // Trova la prima colonna libera
            while (
                columns[colIndex] &&
                eventsOverlap(columns[colIndex][columns[colIndex].length - 1], event)
            ) {
                colIndex++;
            }

            if (!columns[colIndex]) {
                columns[colIndex] = [];
            }
            columns[colIndex].push(event);
        });

        const totalColumns = columns.length;

        columns.forEach((col, colIndex) => {
            col.forEach((event) => {
                const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
                const duration = endMinutes - startMinutes;

                layoutEvents.push({
                    ...event,
                    top: (startMinutes / (24 * 60)) * 100, // % dall'alto
                    height: (duration / (24 * 60)) * 100, // % di altezza
                    width: 100 / totalColumns, // % di larghezza
                    left: (colIndex * 100) / totalColumns // % di scostamento a sinistra
                });
            });
        });
    });

    return layoutEvents;
}
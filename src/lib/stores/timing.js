import { writable } from "svelte/store";


/**
 * Crea lo store per la nostra Time Machine.
 * Questo store gestisce un singolo oggetto Date che rappresenta l'ora "attuale"
 * di tutta l'applicazione.
 */

function createTimingStore() {
    const { subscribe, set, update } = writable(new Date());

    return{
        subscribe,
        setTime: (date) =>{
            if (date instanceof Date){
                set(date);
            } else {
                throw new Error("setTime richiede un oggetto Date");
            }
        },
        // restta alla data corrente
        resetTime: () => set(new Date())
    }
}
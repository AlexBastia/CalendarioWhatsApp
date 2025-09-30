import { writable } from "svelte/store";

function createTimingStore() {
    const { subscribe, set, update } = writable(new Date());

    return{
        subscribe, // permette di vedere il valore
        setTime: (date) =>{ // imposta la data a quella passata
            if (date instanceof Date){
                set(date);
            } else {
                throw new Error("setTime richiede un oggetto Date");
            }
        },
        // restta alla data corrente
        resetTime: () => set(null)
    }
}

export const timingStore = createTimingStore();
const CICLI_MINUTI_MIN = 20;
const PRESETS = [
    {studio: 25, pausa: 5},
    { studio: 30, pausa: 5 },
		{ studio: 45, pausa: 10 },
		{ studio: 50, pausa: 10 },
		{ studio: 35, pausa: 5 }, 
		{ studio: 35, pausa: 10 }

]; 

export function suggerisciCicli(minutiTotali) {
    if (minutiTotali < CICLI_MINUTI_MIN) {
        return 0;
    }

    const suggerimenti = [];
    for (const preset of PRESETS) {
        const cicloTotale = preset.studio + preset.pausa;
        if (minutiTotali >= cicloTotale) {
            const numCicli = Math.floor(minutiTotali / cicloTotale);
            if (numCicli > 0){
                suggerimenti.push({
                    studio: preset.studio,
                    pausa: preset.pausa,
                    numCicli: numCicli,
                    tempoUtilizzato: numCicli * cicloTotale,
                    tempoRestante: minutiTotali - (numCicli * cicloTotale)
                });
            }
        }
    }
    return suggerimenti.sort((a, b) => b.tempoUtilizzato - a.tempoUtilizzato);
}
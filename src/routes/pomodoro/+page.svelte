<script>
    import { onMount } from 'svelte';

    let timerStudio = new Date();
    let timerPausa = new Date();
    let cicli;
    let intervallo;
    let displayTime = "30:00";

    timerStudio.setMinutes(30);
    timerPausa.setMinutes(5);
    timerStudio.setSeconds(0);
    timerPausa.setSeconds(0);
    cicli = 5;

    function updateDisplayTime(orario) {
        let minutes = orario.getMinutes().toString().padStart(2, '0');
        let seconds = orario.getSeconds().toString().padStart(2, '0');
        displayTime = `${minutes}:${seconds}`;
    }

    function iniziaTimer(orario, callback) {
        intervallo = setInterval(() => {
            if (orario.getMinutes() != 0 || orario.getSeconds() != 0) {
                orario.setSeconds(orario.getSeconds() - 1);
                updateDisplayTime(orario);
            } else {
                clearInterval(intervallo);
                if (callback) callback();
            }
        }, 1000);
    }

    function eseguiCiclo(contaCicli) {
        if (contaCicli > 0) {
            iniziaTimer(timerStudio, () => {
                iniziaTimer(timerPausa, () => {
                    eseguiCiclo(contaCicli - 1);
                });
            });
        }
    }

    onMount(() => {
        document.getElementById("iniziaPomodoro").addEventListener('click', () => {
            eseguiCiclo(cicli);
        });
    });
</script>

<svg width="200" height="200" viewBox="0 0 100 100">
    <!-- Definizione del gradiente radiale -->
    <defs>
        <radialGradient id="gradientGray" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#808080" /> <!-- Grigio chiaro al centro -->
            <stop offset="100%" stop-color="#404040" /> <!-- Grigio scuro ai bordi -->
        </radialGradient>
    </defs>

    <!-- Cerchio di sfondo con gradiente -->
    <circle cx="50" cy="50" r="45" fill="url(#gradientGray)" />

    <!-- Cerchio rosso animato -->
    <circle
        cx="50" cy="50" r="45"
        fill="none" stroke="red" stroke-width="5"
        stroke-dasharray="314" 
        transform="rotate(-90 50 50)" 
    />

    <!-- Testo del timer -->
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="white">{displayTime}</text>
</svg>

<!-- Bottone per iniziare il timer -->
<button id="iniziaPomodoro">
    Inizia
</button>

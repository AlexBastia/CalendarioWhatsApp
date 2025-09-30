# Divisione lavoro
- Alex Bastianini alex.bastianini@studio.unibo.it: Note (fino all'estensione 33), autenticazione Utente (incluso signup/login), visione giornaliera calendario, gestione hosting sulla macchina del laboratorio, integrazione con google calendar.
- Giovanni Menozzi giovanni.menozzi3@studio.unibo.it: pomodoro (fino all'estensione 33), notifiche, calendario (a parte la gestione delle ripetizioni e la visione giornaliera), eventi, tasks, time machine

# Tecnologie Usate
La web app e' stata realizzata con il meta-framework SvelteKit, con il framework CSS Bootstrap e come database e' stato usato MongoDB interfacciato tramite Mongoose.

# Scelte implementative interessanti

## Notifiche
E' stato usato un "job" che runna minuto per minuto, controlla ciò che c'è da modificare e crea degli elementi "notifica" nel db per pomodoro (condiviso), eventi, attività. il component notificationBell si occupa tramite un setInterval di controllare gli elemnti e di visualizzarli nella bell e generando una notificationApi

## Autenticazione utenti
Come consigliato sulla documentazione di SvelteKit, per l'autenticazione e' stato usato come modello quello proposto da [Luica](https://lucia-auth.com/), un insieme di esempi su come gestire l'autenticazione tramite token di sessione. Non usando una libreria esterna, e' stato possibile integrare meglio il codice con SvelteKit in modo da permettere di implementare solo le funzionalita' necessarie.
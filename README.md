# Divisione lavoro
- Alex Bastianini alex.bastianini@studio.unibo.it: Note, autenticazione Utente (incluso signup/login), visione giornaliera calendario, gestione hosting sulla macchina del laboratorio, integrazione con google calendar

# Tecnologie Usate
La web app e' stata realizzata con il meta-framework SvelteKit, con il framework CSS Bootstrap e come database e' stato usato MongoDB interfacciato tramite Mongoose.

# Scelte implementative interessanti

## Autenticazione utenti
Come consigliato sulla documentazione di SvelteKit, per l'autenticazione e' stato usato come modello quello proposto da [Luica](https://lucia-auth.com/), un insieme di esempi su come gestire l'autenticazione tramite token di sessione. Non usando una libreria esterna, e' stato possibile integrare meglio il codice con SvelteKit in modo da permettere di implementare solo le funzionalita' necessarie.
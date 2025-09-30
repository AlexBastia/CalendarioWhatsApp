# Divisione lavoro
- Alex Bastianini alex.bastianini@studio.unibo.it: Note, autenticazione Utente (incluso signup/login), visione giornaliera calendario, gestione hosting sulla macchina del laboratorio, integrazione con google calendar

# Tecnologie Usate
La web app e' stata realizzata con il meta-framework SvelteKit, con il framework CSS Bootstrap e come database e' stato usato MongoDB interfacciato tramite Mongoose.

# Scelte implementative interessanti

## Autenticazione utenti
Come consigliato sulla documentazione di SvelteKit, per l'autenticazione e' stato usato come modello quello proposto da Luica, un insieme di esempi su come gestire l'autenticazione tramite token di sessione. I vantaggi di gestire direttamente questo problema senza usare librerie esterne sono l'avere un controllo piu' granulare senza dover includere altri framework. 
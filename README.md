# Divisione lavoro
- Alex Bastianini alex.bastianini@studio.unibo.it: Note (fino all'estensione 33), autenticazione Utente (incluso signup/login), visione giornaliera calendario, gestione hosting sulla macchina del laboratorio, integrazione con google calendar.
- Giovanni Menozzi giovanni.menozzi3@studio.unibo.it: pomodoro (fino all'estensione 33), notifiche, calendario (a parte la gestione delle ripetizioni e la visione giornaliera), eventi, tasks, time machine
- Dario Venuto dario.venuto@studio.unibo.it: gestione eventi ricorrenti, homepage/preview, visione calendario

# Utenti Predefiniti
Sono stati creati i seguenti account predefiniti:
- fv1@mail.com
- fv2@mail.com
- as1@mail.com
- asPM@mail.com
- utente1@mail.com
- utente2@mail.com
- utente3@mail.com
tutti con password 12345678

# Tecnologie Usate
La web app e' stata realizzata con il meta-framework SvelteKit, con il framework CSS Bootstrap e come database e' stato usato MongoDB interfacciato tramite Mongoose.

# Scelte implementative interessanti

## Notifiche
E' stato usato un "job" che runna minuto per minuto, controlla ciò che c'è da modificare e crea degli elementi "notifica" nel db per pomodoro (condiviso), eventi, attività. il component notificationBell si occupa tramite un setInterval di controllare gli elemnti e di visualizzarli nella bell e generando una notificationApi

## Autenticazione utenti
Come consigliato sulla documentazione di SvelteKit, per l'autenticazione e' stato usato come modello quello proposto da [Luica](https://lucia-auth.com/), un insieme di esempi su come gestire l'autenticazione tramite token di sessione. Non usando una libreria esterna, e' stato possibile integrare meglio il codice con SvelteKit in modo da permettere di implementare solo le funzionalita' necessarie. 
Tutte le sessioni sono memorizzate sul server con id utente e scadenza associati, la validazione avviene confrontando l'hash del token passato come cookie con l'id del documento sessione nel database: se una sessione e' trovata vengono agginti gli oggeti sessione e utente, altrimenti sono impostati a null.
A ogni query al database viene incluso anche l'id dell'oggetto utente corrente, in modo da bloccare l'accesso a utenti non autorizzati.

## Gestione eventi sovrapposti (DailyView)
Gli eventi vengono divisi in gruppi in modo tale che nessun evento di un gruppo si sovrapponga a eventi di un altro gruppo, mentre esiste almeno un evento nel proprio gruppo con cui si sovrappone. Poi ogni gruppo e' diviso in colonne in base alla necessita', ed e' quindi il numero di colonne per gruppo a determinare la larghezza dell'evento e l'indice della colonna a indicare la posizione orizzontale.

## Categorie Note
Le categorie sono memorizzate come lista di sotto-documenti nel documento dell'utente con il loro id, nome e lista di note associate. In piu', ogni documento nota memorizza anch'esso la lista di id delle categorie assegnate. In questo modo sia caricare tutte le categorie dell'utente sia caricare solo le categorie di una nota diventano operazioni molto rapide, con una leggera perdita per quanto riguarda l'eliminazione di una categoria.

## Eventi ricorrenti
Gli eventi ricorrenti non vengono salvati come una serie di eventi, bensì durante la visualizzazione del calendario vengono create (ma non salvate nel database) istanze nel range di occorrenza.
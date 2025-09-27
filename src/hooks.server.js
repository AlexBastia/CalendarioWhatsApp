import { dbConnect } from '$lib/server/database';
import { validateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from '$lib/server/session';

// Funzione che viene chiamata una sola volta all'avvio dell'applicazione
export async function init() {
  await dbConnect();
}

// https://github.com/lucia-auth/example-sveltekit-email-password-2fa/blob/main/src/hooks.server.ts
// Funzione che intercetta tutti i request fatti al server. resolve(event) genera la risposta, utile per aggiungere dati alla risposta.
export const handle = async ({ event, resolve }) => {
  // Controllo sessione utente:
  // Se il token non c'e' fra i cookies o non e' valido, user e session sono null
  const token = event.cookies.get("session") ?? null;
  if (token === null) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  // Controlliamo che il token esisti nel database e che non sia scaduto
  const { session, user } = await validateSessionToken(token);
  if (session !== null) {
    // Aggiunge il cookie a event con gli header giusti e la scadenza presa dal database (non ci fidiamo del cookie che c'era gia!)
    setSessionTokenCookie(event, token, session.expiresAt);
  } else {
    deleteSessionTokenCookie(event);
    // In questo caso, session e user sono gia' null, quindi non dobbiamo impostarli
  }
  // Nella risposta aggiungo gli oggetti sessione e utente (null se il token non e' valido)
  event.locals.session = session;
  event.locals.user = user;
  console.log("User in locals:", event.locals.user.virtualTime);
  return resolve(event);
};

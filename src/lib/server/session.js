import { Session } from "$lib/models/Session";
import { User } from "$lib/models/User";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import mongoose from "mongoose";
import { sha256 } from "@oslojs/crypto/sha2";

export async function validateSessionToken(token) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = await Session.findOne({ id: sessionId })

  // La sessione non esiste con il token dato
  if (session === null) return { session: null, user: null }
  const user = await User.findOne({ _id: session.userId })
  // Non esiste l'utente a cui e' assegnata la sessione TODO: come gestirlo?
  if (user === null) return { session: null, user: null }

  if (Date.now() >= session.expiresAt.getTime()) {
    await Session.deleteOne({ id: sessionId })
    return { session: null, user: null };
  }
  // Se fra 15 giorni il token sarebbe scaduto, rinnovalo aggiungendo 30 giorni alla data di scadenza
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await Session.findOneAndUpdate({ id: sessionId }, {
      expiresAt: session.expiresAt,
    })
  }
  return { session, user };
}

// L'header "secure" e' automaticamente messo a "True" da SvelteKit in Production
export function setSessionTokenCookie(event, token, expiresAt) {
  event.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });
}

export function deleteSessionTokenCookie(event) {
  event.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
}

export function generateSessionToken() {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

export async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionDoc = new Session({ id: sessionId, userId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
  const session = await sessionDoc.save();
  return session;
}

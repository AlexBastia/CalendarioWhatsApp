import { fail, redirect } from "@sveltejs/kit";
import { checkEmailAvailability, verifyEmailInput } from "$lib/server/email";
import { createUser, verifyUsernameInput } from "$lib/server/user";
import { verifyPasswordStrength } from "$lib/server/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";

export function load(event) {
  if (event.locals.session !== null && event.locals.user !== null) {
    return redirect(302, "/");
  }
  return {};
}

export const actions = {
  default: action
};

async function action(event) {
  const formData = await event.request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof username !== "string" || typeof password !== "string") {
    return fail(400, {
      message: "Invalid or missing fields",
      email: "",
      username: ""
    });
  }
  if (email === "" || password === "" || username === "") {
    return fail(400, {
      message: "Please enter your username, email, and password",
      email: "",
      username: ""
    });
  }
  console.log("iniziamo a verificare per bene")
  if (!verifyEmailInput(email)) {
    return fail(400, {
      message: "Invalid email",
      email,
      username
    });
  }
  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) {
    return fail(400, {
      message: "Email is already used",
      email,
      username
    });
  }
  if (!verifyUsernameInput(username)) {
    return fail(400, {
      message: "Invalid username",
      email,
      username
    });
  }
  console.log("Tutto buono, creiamo l'utente!")
  const user = await createUser(email, username, password);

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(event, sessionToken, session.expiresAt);
  redirect(302, "/");
}

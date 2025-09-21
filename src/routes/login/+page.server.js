import { fail, redirect } from "@sveltejs/kit";
import { verifyEmailInput } from "$lib/server/email";
import { getUserFromEmail, getUserPasswordHash } from "$lib/server/user";
import { verifyPasswordHash } from "$lib/server/password";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/session";

export function load(event) {
  console.log("login page.server.js");
  console.log(event.locals);
  
  return {};
}

export const actions = {
  default: action
};

async function action(event) {
  const formData = await event.request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return fail(400, {
      message: "Invalid or missing fields",
      email: ""
    });
  }
  if (email === "" || password === "") {
    return fail(400, {
      message: "Please enter your email and password.",
      email
    });
  }
  if (!verifyEmailInput(email)) {
    return fail(400, {
      message: "Invalid email",
      email
    });
  }
  const user = await getUserFromEmail(email);
  if (user === null) {
    return fail(400, {
      message: "Account does not exist",
      email
    });
  }
  const passwordHash = await getUserPasswordHash(user._id);
  const validPassword = await verifyPasswordHash(passwordHash, password);
  if (!validPassword) {
    return fail(400, {
      message: "Invalid password",
      email
    });
  }
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(event, sessionToken, session.expiresAt);

  redirect(302, "/");
}

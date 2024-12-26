import { redirect } from "@sveltejs/kit"

export function load(event) {
  if (event.locals.user === null) {
    redirect(302, "/login")
  }
}

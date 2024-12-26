import { Appunto } from '$lib/models/Appunto';
import { error, redirect } from '@sveltejs/kit';

export async function load(event) {
  if (event.locals.user === null) {
    return redirect('/login')
  }
  let appunto = await Appunto.findById(event.params.idAppunto);

  if (!appunto) error(404);

  appunto = JSON.parse(JSON.stringify(appunto))

  return {
    appunto
  }
}

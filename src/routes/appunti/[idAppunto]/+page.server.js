import { Appunto } from '$lib/models/Appunto';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  let appunto = await Appunto.findById(params.idAppunto);

  if (!appunto) error(404);

  appunto = JSON.parse(JSON.stringify(appunto))

  return {
    appunto
  }
}

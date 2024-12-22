import { appunti } from '../data.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const appunto = appunti.find((appunto) => appunto.id === params.idAppunto);

  if (!appunto) error(404);

  return {
    appunto
  }
}

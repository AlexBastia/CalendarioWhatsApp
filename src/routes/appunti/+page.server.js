import { appunti } from './data.js';

export function load() {
  return {
    anteprime: appunti.map((appunto) => ({
      id: appunto.id,
      titolo: appunto.titolo,
      testo: appunto.inizioTesto
    }))
  }
}

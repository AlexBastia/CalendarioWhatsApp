import { goto } from "$app/navigation";
import { Appunto } from "$lib/models/Appunto";
import { fail, redirect } from "@sveltejs/kit";
import mongoose from "mongoose";

export async function load(event) {

  if (event.locals.user === null) {
    return redirect(301, "/login");
  }

  const appunti = await Appunto.find({ idUtente: event.locals.user._id }, { testo: 0 });


  return {
    anteprime: appunti.map((appunto) => ({
      id: appunto._id.toString(),
      titolo: appunto.titolo,
      testo: appunto.inizioTesto,
      dataCreazione: appunto.dataCreazione,
      dataUltimaModifica: appunto.dataUltimaModifica,
      categorie: appunto.categorie,
      caratteri: appunto.caratteri
    }))
  }
}

const ANTEP_MAX_LUNGH = 200;
const TITOLO_MAX_LUNGH = 50;
const TESTO_MAX_LUNGH = 1000;
export const actions = {
  create: async (event) => {
    if (event.locals.user === null) {
      throw fail(401);
    }

    const data = await event.request.formData();

    let titolo = data.get('titolo').substring(0, TITOLO_MAX_LUNGH);
    const testo = data.get('testo').substring(0, TESTO_MAX_LUNGH);

    let caratteri = null, inizioTesto = null;

    if (titolo && data.get('duplica')) titolo += ' | duplicato';

    if (testo) {
      inizioTesto = truncateString(testo, ANTEP_MAX_LUNGH);
      caratteri = testo.length;
    }

    const appuntoVuoto = new Appunto({
      titolo: titolo ?? '',
      testo: testo ?? '',
      caratteri: caratteri ?? 0,
      categorie: [],
      inizioTesto: inizioTesto ?? '',
      dataCreazione: getCurrTime(),
      dataUltimaModifica: getCurrTime(),
      idUtente: event.locals.user._id
    });

    const saved = await appuntoVuoto.save();

    if (!saved) return { success: false };

    redirect(303, `/appunti/${saved._id.toString()}`);
  },
  update: async (event) => {
    if (event.locals.user === null) {
      throw fail(401);
    }
    const data = await event.request.formData();

    const id = new mongoose.Types.ObjectId(data.get('id'));
    const titolo = data.get('titolo');
    const testo = data.get('testo');
    const categorie = data.get('categorie');

    const inizioTesto = truncateString(testo, ANTEP_MAX_LUNGH);
    const dataUltimaModifica = getCurrTime();
    const caratteri = testo.length;

    const appunto = await Appunto.findOneAndUpdate({ idUtente: event.locals.user._id, _id: id }, {
      titolo,
      testo,
      caratteri,
      categorie,
      inizioTesto,
      dataUltimaModifica
    });

    return { success: true }
  },
  delete: async (event) => {
    if (event.locals.user === null) {
      throw fail(401);
    }
    const data = await event.request.formData();

    const id = new mongoose.Types.ObjectId(data.get('id'));
    await Appunto.deleteOne({ idUtente: event.locals.user._id, _id: id });

    return { success: true }
  }
}

// https://stackoverflow.com/a/53637828
function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

const getCurrTime = () => {
  return new Date();
};

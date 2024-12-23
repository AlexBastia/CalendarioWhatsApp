import { goto } from "$app/navigation";
import { Appunto } from "$lib/models/Appunto.js"
import { redirect } from "@sveltejs/kit";
import mongoose from "mongoose";

export async function load() {
  const appunti = await Appunto.find({}, { testo: 0 });


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
export const actions = {
  create: async ({ url }) => {
    const appuntoVuoto = new Appunto({
      titolo: '',
      testo: '',
      caratteri: 0,
      categorie: ['test1'],
      inizioTesto: '',
      dataCreazione: getCurrTime(),
      dataUltimaModifica: getCurrTime()
    });

    const saved = await appuntoVuoto.save();

    if (!saved) return { success: false };

    redirect(303, `${url.origin}${url.pathname}/${saved._id.toString()}`);
  },
  update: async ({ request }) => {
    const data = await request.formData();

    console.log(data);

    const id = new mongoose.Types.ObjectId(data.get('id'));
    const titolo = data.get('titolo');
    const testo = data.get('testo');
    const categorie = data.get('categorie');

    const inizioTesto = truncateString(testo, ANTEP_MAX_LUNGH);
    const dataUltimaModifica = getCurrTime();
    const caratteri = testo.length;

    const appunto = await Appunto.findOneAndUpdate({ _id: id }, {
      titolo,
      testo,
      caratteri,
      categorie,
      inizioTesto,
      dataUltimaModifica
    }, { new: true });

    return { success: true }
  },
  delete: async ({ request }) => {
    const data = await request.formData();

    const id = new mongoose.Types.ObjectId(data.get('id'));
    const idk = await Appunto.deleteOne({ _id: id });

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

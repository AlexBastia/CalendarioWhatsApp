import { Schema, model } from "mongoose";

const appuntoSchema = new Schema({
  titolo: String,
  testo: String,
  caratteri: Number,
  inizioTesto: String,
  categorie: [String],
  dataCreazione: Date,
  dataUltimaModifica: Date
});

export const Appunto = model('Appunto', appuntoSchema);



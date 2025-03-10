import { Schema, Types, model } from "mongoose";

export const appuntoSchema = new Schema({
  titolo: String,
  testo: String,
  caratteri: Number,
  inizioTesto: String,
  categorie: [String],
  dataCreazione: Date,
  dataUltimaModifica: Date,
  idUtente: Types.ObjectId
});

export const Appunto = model('Appunto', appuntoSchema);

import { Evento } from "$lib/models/Event.js"
import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation";
import mongoose from "mongoose";

export async function load({ params }) {
    
    let id = new mongoose.Types.ObjectId(params.id);
    console.log('evento',typeof id);

    let evento = await Evento.findById(params.id);

    if (!evento) error(404);

    evento = JSON.parse(JSON.stringify(evento))
  
    return {evento}
  

}
import { goto } from "$app/navigation";
import { Event } from "$lib/models/Event.js"
import { redirect } from "@sveltejs/kit";
import mongoose from "mongoose";

export async function load() {
  const eventi = await Event;

  return {
    eventi
  }
}
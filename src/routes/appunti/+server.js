import { json } from "@sveltejs/kit";
import { Appunto } from "$lib/models/Appunto";

export async function POST({ request, cookies }) {
  const { appunto } = await request.json();

  const appuntoModel = new Appunto(appunto);
  const { id } = await appuntoModel.save();

  return json({ id }, { status: 201 });
}

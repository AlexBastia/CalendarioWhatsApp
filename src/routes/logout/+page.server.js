// src/routes/logout/+page.server.js

import { redirect } from '@sveltejs/kit';
import { Session } from '$lib/models/Session';
import { deleteSessionTokenCookie } from '$lib/server/session';

export const load = async (event) => {
    if (!event.locals.session) {
        throw redirect(302, '/');
    }
    await Session.deleteOne({ id: event.locals.session.id });

    deleteSessionTokenCookie(event);

    throw redirect(302, '/');
};
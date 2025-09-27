import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    console.log('ds')
    if (!locals.user) {
        redirect(303, '/login');
    }

    console.log("User in addTask page:", locals.user);
    return {
    };
}
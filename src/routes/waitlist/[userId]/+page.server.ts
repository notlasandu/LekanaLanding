// +page.server.ts
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const userId = params.userId;
    if (!userId) {
        throw redirect(302, '/');
    }
    try {
        const res = await fetch(`/api/waitlist/${userId}`);
        if (res.ok) {
            const data = await res.json();
            
            let submitted = data.agree;

            return {
                userId,
                email: data.email,
                submitted
            };
        }

        console.error('Failed to fetch waitlist user', await res.text());
    } catch (err) {
        console.error('Error loading waitlist user', err);
    }

    throw error(404, 'Waitlist user not found');

};
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const username = env.AUTH_USERNAME;
const password = env.AUTH_PASSWORD;

const BASE_URL = env.BASE_URL;

async function getToken() {
    const loginRes = await fetch(BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed', await loginRes.text());
        throw new Error('Failed to authenticate with waitlist API');
    }

    const loginData = await loginRes.json();
    const token = loginData.token || loginData.accessToken || loginData?.data?.token;

    if (!token) {
        throw new Error('No token returned from login API');
    }

    return token;
}

export async function POST({ request, params }) {
    const { userId } = params;
    try {
        const payload = await request.json();

        const token = await getToken();
        const res = await fetch(`${BASE_URL}/api/waitlist/${userId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Waitlist API error:', data);
            return json({ error: data?.error || 'Failed to update waitlist profile' }, { status: res.status });
        }

        return json(data); // success
    } catch (err: any) {
        console.error('Server error updating waitlist profile:', err);
        return json({ error: 'Internal server error while updating waitlist profile' }, { status: 500 });
    }
}

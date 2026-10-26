// SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)
//
// SPDX-License-Identifier: MPL-2.0

import type { Handle } from '@sveltejs/kit';
import * as jose from 'jose';

/** @type {import('@sveltejs/kit').Handle} */
export const handle: Handle = async ({ event, resolve }) => {
	const access_token = event.cookies.get('access_token');
	if (!access_token) {
		event.locals.email = null;
		return resolve(event);
	}

	let jwt: any;
	try {
		jwt = jose.decodeJwt(access_token.replace('Bearer ', ''));
	} catch (e) {
		event.cookies.delete('access_token', { path: '/' });
		event.locals.email = null;
		return resolve(event);
	}

	if (!jwt || !jwt.exp) {
		event.cookies.delete('access_token', { path: '/' });
		event.locals.email = null;
		return resolve(event);
	}

	// if token expires, do a request to get a new one and set the response-cookies on the response
	if (Date.now() >= jwt.exp * 1000) {
		try {
			const apiUrl = process.env.API_URL || 'http://api:80';
			const res = await fetch(`${apiUrl}/api/v1/users/check`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Cookie: event.request.headers.get('cookie') || ''
				}
			});
			if (res.ok) {
				try {
					const data = await res.json();
					event.locals.email = data.email ?? (typeof jwt.sub === 'string' ? jwt.sub : null);
				} catch {
					event.locals.email = typeof jwt.sub === 'string' ? jwt.sub : null;
				}
				const resp = await resolve(event);
				try {
					const setCookie = res.headers.get('set-cookie');
					if (setCookie) {
						resp.headers.set('Set-Cookie', setCookie);
					}
				} catch {}
				return resp;
			} else {
				// Refresh failed or token was rejected by API - clean up cookies and log out
				event.cookies.delete('access_token', { path: '/' });
				event.locals.email = null;
				return resolve(event);
			}
		} catch (e) {
			console.error('Failed to verify/refresh token via API:', e);
			// On network error or backend unavailable, do NOT crash with 500!
			// Safely fall back to unauthenticated session
			event.cookies.delete('access_token', { path: '/' });
			event.locals.email = null;
			return resolve(event);
		}
	}

	event.locals.email = typeof jwt.sub === 'string' ? jwt.sub : null;
	return resolve(event);
};

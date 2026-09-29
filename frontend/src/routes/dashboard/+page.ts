// SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)
//
// SPDX-License-Identifier: MPL-2.0

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch }) => {
	let quizzes: any[] = [];
	let quiztivities: any[] = [];

	try {
		const quiz_res = await fetch('/api/v1/quiz/list?page_size=100');
		if (quiz_res.status === 401) {
			redirect(302, '/account/login?returnTo=/dashboard');
		}
		if (quiz_res.ok) {
			const resJson = await quiz_res.json();
			quizzes = Array.isArray(resJson) ? resJson : (Array.isArray(resJson?.quizzes) ? resJson.quizzes : []);
		}

		const quiztivity_res = await fetch('/api/v1/quiztivity/');
		if (quiztivity_res.status === 401) {
			redirect(302, '/account/login?returnTo=/dashboard');
		}
		if (quiztivity_res.ok) {
			const resJson = await quiztivity_res.json();
			quiztivities = Array.isArray(resJson) ? resJson : [];
		}
	} catch (e: any) {
		if (e && typeof e === 'object' && 'status' in e && 'location' in e) {
			throw e;
		}
		console.error('Error loading dashboard data in +page.ts:', e);
	}

	return {
		quizzes,
		quiztivities
	};
}) satisfies PageLoad;


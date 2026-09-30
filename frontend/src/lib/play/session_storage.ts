// SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
// SPDX-License-Identifier: MPL-2.0

import Cookies from 'js-cookie';

export interface PlayerSession {
	sid: string;
	username: string;
	game_pin: string;
	game_mode?: any;
	avatar?: string;
	joined?: boolean;
	timestamp: number;
}

const STORAGE_KEY = 'classquiz_player_session';
const COOKIE_KEY = 'joined_game';
const MAX_SESSION_AGE = 4 * 60 * 60 * 1000; // 4 hours

export function savePlayerSession(session: Omit<PlayerSession, 'timestamp'>) {
	if (typeof window === 'undefined') return;
	const fullSession: PlayerSession = {
		...session,
		timestamp: Date.now()
	};
	const serialized = JSON.stringify(fullSession);
	try {
		localStorage.setItem(STORAGE_KEY, serialized);
	} catch (e) {
		console.warn('Could not save session to localStorage', e);
	}
	try {
		Cookies.set(
			COOKIE_KEY,
			JSON.stringify({
				sid: session.sid,
				username: session.username,
				game_pin: session.game_pin
			}),
			{ expires: 1, path: '/' }
		);
	} catch (e) {
		console.warn('Could not save session to cookie', e);
	}
}

export function getPlayerSession(): PlayerSession | null {
	if (typeof window === 'undefined') return null;
	// 1. Try localStorage first
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && parsed.username && parsed.game_pin) {
				if (parsed.timestamp && Date.now() - parsed.timestamp > MAX_SESSION_AGE) {
					clearPlayerSession();
					return null;
				}
				return parsed;
			}
		}
	} catch (e) {
		console.warn('Could not read session from localStorage', e);
	}

	// 2. Fallback to cookie
	try {
		const rawCookie = Cookies.get(COOKIE_KEY);
		if (rawCookie) {
			const parsed = JSON.parse(rawCookie);
			if (parsed && parsed.username && parsed.game_pin) {
				return {
					sid: parsed.sid || '',
					username: parsed.username,
					game_pin: parsed.game_pin,
					timestamp: Date.now()
				};
			}
		}
	} catch (e) {
		console.warn('Could not read session from cookie', e);
	}

	return null;
}

export function updateSessionSid(newSid: string) {
	if (typeof window === 'undefined' || !newSid) return;
	const session = getPlayerSession();
	if (session) {
		session.sid = newSid;
		session.joined = true;
		session.timestamp = Date.now();
		savePlayerSession(session);
	}
}

export function clearPlayerSession() {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem('cq_game_data');
		localStorage.removeItem('cq_active_question');
		localStorage.removeItem('cq_question_results');
		localStorage.removeItem('cq_solution');
		sessionStorage.removeItem('cq_game_data');
		sessionStorage.removeItem('cq_active_question');
		sessionStorage.removeItem('cq_question_results');
		sessionStorage.removeItem('cq_solution');

		const toRemoveLocal: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('cq_sel_ans_')) {
				toRemoveLocal.push(key);
			}
		}
		toRemoveLocal.forEach((k) => localStorage.removeItem(k));

		const toRemoveSession: string[] = [];
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key && key.startsWith('cq_sel_ans_')) {
				toRemoveSession.push(key);
			}
		}
		toRemoveSession.forEach((k) => sessionStorage.removeItem(k));
	} catch (e) {}
	try {
		Cookies.remove(COOKIE_KEY, { path: '/' });
		Cookies.remove(COOKIE_KEY);
	} catch (e) {}
}

export function saveGameData(gameData: any) {
	if (typeof window === 'undefined' || !gameData) return;
	try {
		localStorage.setItem('cq_game_data', JSON.stringify(gameData));
	} catch (e) {}
}

export function getGameData(): any | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('cq_game_data') || sessionStorage.getItem('cq_game_data');
		if (raw) return JSON.parse(raw);
	} catch (e) {}
	return null;
}

export function saveActiveQuestion(question_index: string | number, question: any) {
	if (typeof window === 'undefined') return;
	try {
		const data = JSON.stringify({ question_index, question });
		localStorage.setItem('cq_active_question', data);
		localStorage.removeItem('cq_question_results');
		localStorage.removeItem('cq_solution');
	} catch (e) {}
}

export function getActiveQuestion(): { question_index: string | number; question: any } | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('cq_active_question') || sessionStorage.getItem('cq_active_question');
		if (raw) return JSON.parse(raw);
	} catch (e) {}
	return null;
}

export function saveQuestionResults(results: any) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem('cq_question_results', JSON.stringify(results));
	} catch (e) {}
}

export function getQuestionResults(): any | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('cq_question_results') || sessionStorage.getItem('cq_question_results');
		if (raw) return JSON.parse(raw);
	} catch (e) {}
	return null;
}

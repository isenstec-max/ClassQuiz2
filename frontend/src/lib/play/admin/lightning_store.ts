// SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
// SPDX-License-Identifier: MPL-2.0

export interface PlayerAccuracy {
	correct: number;
	incorrect: number;
	total: number;
}

export interface LightningState {
	processedQuestions: number[];
	counts: Record<string, number>;
	accuracy: Record<string, PlayerAccuracy>;
}

// In-memory cache pre prípad SSR alebo absencie sessionStorage
const inMemoryCache: Record<string, LightningState> = {};

function getStorageKey(game_pin: string): string {
	return `classquiz_lightning_${game_pin || 'default'}`;
}

export function loadLightningState(game_pin: string): LightningState {
	const key = getStorageKey(game_pin);
	if (typeof window !== 'undefined' && window.sessionStorage) {
		try {
			const data = window.sessionStorage.getItem(key);
			if (data) {
				const parsed = JSON.parse(data);
				return {
					processedQuestions: parsed.processedQuestions || [],
					counts: parsed.counts || {},
					accuracy: parsed.accuracy || {}
				};
			}
		} catch {
			// ignore error
		}
	}
	if (!inMemoryCache[key]) {
		inMemoryCache[key] = { processedQuestions: [], counts: {}, accuracy: {} };
	}
	return inMemoryCache[key];
}

export function saveLightningState(game_pin: string, state: LightningState): void {
	const key = getStorageKey(game_pin);
	inMemoryCache[key] = state;
	if (typeof window !== 'undefined' && window.sessionStorage) {
		try {
			window.sessionStorage.setItem(key, JSON.stringify(state));
		} catch {
			// ignore error
		}
	}
}

export function resetLightning(game_pin: string): void {
	const key = getStorageKey(game_pin);
	delete inMemoryCache[key];
	if (typeof window !== 'undefined' && window.sessionStorage) {
		try {
			window.sessionStorage.removeItem(key);
		} catch {
			// ignore error
		}
	}
}

export function recordRoundData(
	game_pin: string,
	questionIndex: number,
	roundData: Array<{ username: string; right: boolean; time_taken: number; answer?: any; score?: number }>
): { counts: Record<string, number>; accuracy: Record<string, PlayerAccuracy> } {
	const state = loadLightningState(game_pin);

	// Ak začína nová hra (otázka 1 a boli zaznamenané vyššie otázky), reštartuj blesky a úspešnosť
	if (questionIndex === 1 && state.processedQuestions.some((q) => q > 1)) {
		state.processedQuestions = [];
		state.counts = {};
		state.accuracy = {};
	}

	if (!state.processedQuestions.includes(questionIndex)) {
		// 1. Spracuj blesky (iba najrýchlejšia správna odpoveď)
		const correct = (roundData || []).filter(
			(item) => item && item.username && item.right === true && Number(item.time_taken) > 0
		);

		if (correct.length > 0) {
			const minTime = Math.min(...correct.map((item) => Number(item.time_taken)));
			const fastest = correct.filter((item) => Number(item.time_taken) === minTime);
			for (const f of fastest) {
				state.counts[f.username] = (state.counts[f.username] || 0) + 1;
			}
		}

		// 2. Spracuj pomer správnych a nesprávnych odpovedí (úspešnosť)
		if (!state.accuracy) {
			state.accuracy = {};
		}
		for (const item of roundData || []) {
			if (item && item.username) {
				if (!state.accuracy[item.username]) {
					state.accuracy[item.username] = { correct: 0, incorrect: 0, total: 0 };
				}
				state.accuracy[item.username].total += 1;
				if (item.right) {
					state.accuracy[item.username].correct += 1;
				} else {
					state.accuracy[item.username].incorrect += 1;
				}
			}
		}

		state.processedQuestions.push(questionIndex);
		saveLightningState(game_pin, state);
	}

	return { counts: { ...state.counts }, accuracy: { ...state.accuracy } };
}

export function recordRoundWinner(
	game_pin: string,
	questionIndex: number,
	roundData: Array<{ username: string; right: boolean; time_taken: number }>
): Record<string, number> {
	return recordRoundData(game_pin, questionIndex, roundData).counts;
}

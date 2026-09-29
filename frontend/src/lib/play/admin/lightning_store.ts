// SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
// SPDX-License-Identifier: MPL-2.0

export interface LightningState {
	processedQuestions: number[];
	counts: Record<string, number>;
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
				return JSON.parse(data);
			}
		} catch {
			// ignore error
		}
	}
	if (!inMemoryCache[key]) {
		inMemoryCache[key] = { processedQuestions: [], counts: {} };
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

export function recordRoundWinner(
	game_pin: string,
	questionIndex: number,
	roundData: Array<{ username: string; right: boolean; time_taken: number }>
): Record<string, number> {
	const state = loadLightningState(game_pin);

	// Ak začína nová hra (otázka 1 a boli zaznamenané vyššie otázky), reštartuj blesky
	if (questionIndex === 1 && state.processedQuestions.some((q) => q > 1)) {
		state.processedQuestions = [];
		state.counts = {};
	}

	if (!state.processedQuestions.includes(questionIndex)) {
		// Blesk iba ak je správna odpoveď (right === true) a platný čas
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

		state.processedQuestions.push(questionIndex);
		saveLightningState(game_pin, state);
	}

	return { ...state.counts };
}

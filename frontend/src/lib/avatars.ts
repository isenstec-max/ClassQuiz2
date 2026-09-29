// SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
// SPDX-License-Identifier: MPL-2.0

export interface AnimalAvatarDef {
	id: string;
	name: string;
	description: string;
	bgColor: string;
}

export const ANIMAL_AVATARS: AnimalAvatarDef[] = [
	{ id: 'fox', name: 'Líška', description: 'V štýlovej mikine', bgColor: '#FFEDD5' },
	{ id: 'panda', name: 'Panda', description: 'So slnečnými okuliarmi', bgColor: '#F1F5F9' },
	{ id: 'lion', name: 'Lev', description: 'V obleku s kravatou', bgColor: '#FEF3C7' },
	{ id: 'cat', name: 'Mačička', description: 'V pruhovanom svetri', bgColor: '#E0F2FE' },
	{ id: 'dog', name: 'Psík', description: 'V šiltovke a džínsovej bunde', bgColor: '#FEE2E2' },
	{ id: 'rabbit', name: 'Zajačik', description: 'V smokingu s motýlikom', bgColor: '#F3E8FF' },
	{ id: 'bear', name: 'Medveď', description: 'V zimnej čiapke a šále', bgColor: '#FEF08A' },
	{ id: 'frog', name: 'Žabiak', description: 'V kráľovskom plášti s korunkou', bgColor: '#DCFCE7' },
	{ id: 'owl', name: 'Sovička', description: 'Múdry profesor s okuliarmi', bgColor: '#E0E7FF' },
	{ id: 'tiger', name: 'Tiger', description: 'V koženej motorkárskej bunde', bgColor: '#FFEDD5' },
	{ id: 'monkey', name: 'Opička', description: 'V leteckej prilbe a okuliaroch', bgColor: '#FED7AA' },
	{ id: 'penguin', name: 'Tučniak', description: 'V havajskej kvetovanej košeli', bgColor: '#CFFAFE' }
];

export function parsePlayer(rawUsername: string): { avatarId: string; name: string } {
	if (!rawUsername) return { avatarId: 'fox', name: '' };
	const match = rawUsername.match(/^\[([a-z0-9_-]+)\]\s*(.*)$/i);
	if (match) {
		const found = ANIMAL_AVATARS.find((a) => a.id.toLowerCase() === match[1].toLowerCase());
		return {
			avatarId: found ? found.id : 'fox',
			name: match[2] || rawUsername
		};
	}
	// Deterministický výber avatara podľa hashu mena
	let hash = 0;
	for (let i = 0; i < rawUsername.length; i++) {
		hash = (hash * 31 + rawUsername.charCodeAt(i)) % ANIMAL_AVATARS.length;
	}
	return {
		avatarId: ANIMAL_AVATARS[Math.abs(hash)].id,
		name: rawUsername
	};
}

export function formatPlayer(name: string, avatarId: string): string {
	return `[${avatarId}] ${name.trim()}`;
}

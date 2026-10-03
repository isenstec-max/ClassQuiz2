// SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
// SPDX-License-Identifier: MPL-2.0

export interface AnimalAvatarDef {
	id: string;
	name: string;
	description: string;
	bgColor: string;
	category: 'animals' | 'tech';
}

export const ANIMAL_AVATARS: AnimalAvatarDef[] = [
	// Zvieratká
	{ id: 'fox', name: 'Líška', description: 'V štýlovej mikine', bgColor: '#FFEDD5', category: 'animals' },
	{ id: 'panda', name: 'Panda', description: 'So slnečnými okuliarmi', bgColor: '#F1F5F9', category: 'animals' },
	{ id: 'lion', name: 'Lev', description: 'V obleku s kravatou', bgColor: '#FEF3C7', category: 'animals' },
	{ id: 'cat', name: 'Mačička', description: 'V pruhovanom svetri', bgColor: '#E0F2FE', category: 'animals' },
	{ id: 'dog', name: 'Psík', description: 'V šiltovke a džínsovej bunde', bgColor: '#FEE2E2', category: 'animals' },
	{ id: 'rabbit', name: 'Zajačik', description: 'V smokingu s motýlikom', bgColor: '#F3E8FF', category: 'animals' },
	{ id: 'bear', name: 'Medveď', description: 'V zimnej čiapke a šále', bgColor: '#FEF08A', category: 'animals' },
	{ id: 'frog', name: 'Žabiak', description: 'V kráľovskom plášti s korunkou', bgColor: '#DCFCE7', category: 'animals' },
	{ id: 'owl', name: 'Sovička', description: 'Múdry profesor s okuliarmi', bgColor: '#E0E7FF', category: 'animals' },
	{ id: 'tiger', name: 'Tiger', description: 'V koženej motorkárskej bunde', bgColor: '#FFEDD5', category: 'animals' },
	{ id: 'monkey', name: 'Opička', description: 'V leteckej prilbe a okuliaroch', bgColor: '#FED7AA', category: 'animals' },
	{ id: 'penguin', name: 'Tučniak', description: 'V havajskej kvetovanej košeli', bgColor: '#CFFAFE', category: 'animals' },

	// Roboty a Sci-Fi technika
	{ id: 'terminator', name: 'Terminátor', description: 'T-800 s červeným kyber-okom', bgColor: '#0F172A', category: 'tech' },
	{ id: 'bender', name: 'Bender', description: 'Plechový robot z Futuramy', bgColor: '#CFFAFE', category: 'tech' },
	{ id: 'predator', name: 'Predátor', description: 'Lovec s biomaskou a laserom', bgColor: '#022C22', category: 'tech' },
	{ id: 'alien', name: 'Alien', description: 'Vesmírny Xenomorph votrelec', bgColor: '#050811', category: 'tech' },
	{ id: 'retro_robot', name: 'Retro Robot', description: 'Plechový robot s budíkmi', bgColor: '#FEF3C7', category: 'tech' },
	{ id: 'cyborg', name: 'Kybernetik', description: 'Android s neónovým priezorom', bgColor: '#312E81', category: 'tech' },
	{ id: 'mecha', name: 'Bojový Mecha', description: 'Obrnený anime bojový robot', bgColor: '#450A0A', category: 'tech' },
	{ id: 'ai_drone', name: 'AI Dron', description: 'Levitujúci autonómny spoločník', bgColor: '#0C4A6E', category: 'tech' },
	{ id: 'steampunk_bot', name: 'Steampunk', description: 'Mosadzný parný robot s ozubeniami', bgColor: '#78350F', category: 'tech' },
	{ id: 'astro_bot', name: 'Astro Bot', description: 'Kozmický robotický prieskumník', bgColor: '#1E1B4B', category: 'tech' },
	{ id: 'cyber_ninja', name: 'Kyber Nindža', description: 'Mechanický bojovník s maskou', bgColor: '#18181B', category: 'tech' },
	{ id: 'glitch_ai', name: 'Digitálna AI', description: 'Kvantová neurónová sieť s CRT', bgColor: '#052E16', category: 'tech' }
];

export function parsePlayer(rawUsername: string): {
	avatarId: string;
	name: string;
	cleanName: string;
	avatar: string;
} {
	if (!rawUsername) return { avatarId: 'fox', name: '', cleanName: '', avatar: 'fox' };
	const match = rawUsername.match(/^\[([a-z0-9_-]+)\]\s*(.*)$/i);
	if (match) {
		let inputId = match[1].toLowerCase();
		if (inputId === 'futurama') inputId = 'bender';
		if (inputId === 'xenomorph') inputId = 'alien';
		const found = ANIMAL_AVATARS.find((a) => a.id.toLowerCase() === inputId);
		const aid = found ? found.id : 'fox';
		const clean = (match[2] || '').trim();
		return {
			avatarId: aid,
			name: clean,
			cleanName: clean,
			avatar: aid
		};
	}
	// Deterministický výber avatara podľa hashu mena
	let hash = 0;
	for (let i = 0; i < rawUsername.length; i++) {
		hash = (hash * 31 + rawUsername.charCodeAt(i)) % ANIMAL_AVATARS.length;
	}
	const aid = ANIMAL_AVATARS[Math.abs(hash)].id;
	const clean = rawUsername.trim();
	return {
		avatarId: aid,
		name: clean,
		cleanName: clean,
		avatar: aid
	};
}

export function formatPlayer(name: string, avatarId: string): string {
	return `[${avatarId}] ${name.trim()}`;
}

export function splitNameLines(name: string): [string, string?] {
	const str = (name ?? '').trim();
	if (!str) return [''];
	const words = str.split(/\s+/);
	if (words.length <= 1) return [str];
	if (words.length === 2) return [words[0], words[1]];
	// For 3 or more words, split into at most 2 lines (balanced)
	const mid = Math.ceil(words.length / 2);
	return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		game_pin: string;
		compact?: boolean;
		class?: string;
	}

	let { game_pin = '', compact = false, class: className = '' }: Props = $props();

	let fullscreen = $state(false);

	let formattedPin = $derived.by(() => {
		if (!game_pin) return '';
		const clean = game_pin.replace(/\s+/g, '');
		if (clean.length === 6) {
			return `${clean.slice(0, 3)} ${clean.slice(3)}`;
		}
		if (clean.length === 8) {
			return `${clean.slice(0, 4)} ${clean.slice(4)}`;
		}
		return clean;
	});

	let joinUrl = $derived.by(() => {
		if (!browser) return 'cquiz.de';
		if (window.location.host === 'ClassQuiz2.de' || window.location.host === 'classquiz.de') {
			return 'cquiz.de';
		}
		return `${window.location.host}/play`;
	});
</script>

<div
	class="bg-slate-900/95 text-white rounded-3xl p-4 shadow-2xl border border-slate-700/60 flex flex-col items-center justify-between text-center select-none backdrop-blur-md transition-all hover:border-emerald-500/40 {className}"
	class:p-3={compact}
>
	<!-- Hlavička / Status -->
	<div class="flex items-center gap-1.5 mb-2">
		<span class="relative flex h-2.5 w-2.5">
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
			<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
		</span>
		<span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
			Pripojiť sa
		</span>
	</div>

	<!-- QR kód -->
	<button
		type="button"
		class="bg-white p-2.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer group relative my-1"
		onclick={() => (fullscreen = true)}
		title="Kliknutím zväčšíte QR kód"
	>
		<img
			src="/api/v1/utils/qr/{game_pin}"
			alt="QR kód pre pripojenie"
			class="{compact ? 'w-24 h-24' : 'w-32 h-32 md:w-36 md:h-36'} object-contain block rounded-lg"
		/>
		<div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors flex items-center justify-center">
			<svg class="w-6 h-6 text-slate-800 opacity-0 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
			</svg>
		</div>
	</button>

	<!-- PIN Hry -->
	<div class="my-2 flex flex-col items-center">
		<span class="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
			PIN KÓD HRY
		</span>
		<div class="font-black font-mono tracking-widest leading-none {compact ? 'text-3xl mt-1 text-amber-400' : 'text-4xl md:text-5xl mt-2 text-amber-400 drop-shadow-md'}">
			{formattedPin}
		</div>
	</div>

	<!-- Inštrukcie -->
	<div class="text-[11px] text-slate-300/80 font-medium leading-tight max-w-[180px] mt-1">
		<span>Otvorte <span class="text-white font-bold underline decoration-emerald-400">{joinUrl}</span> alebo načítajte QR kód</span>
	</div>
</div>

<!-- Fullscreen Modal pre QR kód -->
{#if fullscreen}
	<div
		class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 cursor-pointer"
		transition:fade={{ duration: 150 }}
		onclick={() => (fullscreen = false)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && (fullscreen = false)}
	>
		<div
			class="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 max-w-lg w-full flex flex-col items-center text-center shadow-2xl relative"
			transition:scale={{ duration: 200, start: 0.9 }}
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<button
				type="button"
				class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
				onclick={() => (fullscreen = false)}
				aria-label="Zatvoriť"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<h3 class="text-xl font-extrabold text-white mb-2">Pripojte sa kedykoľvek</h3>
			<p class="text-sm text-slate-300 mb-6">Namierte fotoaparát na QR kód alebo zadajte PIN kód</p>

			<div class="bg-white p-4 rounded-3xl shadow-2xl mb-6">
				<img
					src="/api/v1/utils/qr/{game_pin}"
					alt="QR kód pre pripojenie"
					class="w-64 h-64 md:w-80 md:h-80 object-contain block rounded-xl"
				/>
			</div>

			<div class="text-xs uppercase font-bold text-slate-400 tracking-wider">PIN hry</div>
			<div class="text-5xl font-black font-mono tracking-widest text-emerald-400 mt-1">
				{formattedPin}
			</div>

			<div class="mt-4 text-sm text-slate-300">
				<span>Adresa: <span class="font-bold text-white underline">{joinUrl}</span></span>
			</div>
		</div>
	</div>
{/if}

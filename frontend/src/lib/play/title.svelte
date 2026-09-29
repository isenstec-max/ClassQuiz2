<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';
	import { getLocalization } from '$lib/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	const { t } = getLocalization();

	interface Props {
		title: string;
		description: string;
		cover_image: string | undefined;
		username?: string;
	}

	let { title, description, cover_image, username }: Props = $props();

	// Počítadlo času čakania (v sekundách)
	let waitingSeconds = $state(0);
	let timerInterval: any;

	// Interaktívna pozícia myši pre efekty
	let mouseX = $state(0.5);
	let mouseY = $state(0.5);
	let rawMouseX = $state(0);
	let rawMouseY = $state(0);
	let isMouseActive = $state(false);

	// Plávajúce interaktívne častice v pozadí
	const particles = [
		{ id: 1, x: 15, y: 25, size: 24, speed: 1.2, color: 'rgba(16, 185, 129, 0.25)' },
		{ id: 2, x: 80, y: 20, size: 36, speed: 0.8, color: 'rgba(56, 189, 248, 0.25)' },
		{ id: 3, x: 25, y: 75, size: 30, speed: 1.0, color: 'rgba(245, 158, 11, 0.2)' },
		{ id: 4, x: 70, y: 70, size: 40, speed: 0.6, color: 'rgba(139, 92, 246, 0.25)' },
		{ id: 5, x: 45, y: 15, size: 18, speed: 1.5, color: 'rgba(236, 72, 153, 0.2)' },
		{ id: 6, x: 88, y: 45, size: 28, speed: 1.1, color: 'rgba(16, 185, 129, 0.3)' },
		{ id: 7, x: 10, y: 50, size: 22, speed: 1.3, color: 'rgba(14, 165, 233, 0.25)' },
		{ id: 8, x: 55, y: 85, size: 32, speed: 0.9, color: 'rgba(249, 115, 22, 0.2)' }
	];

	function handleMouseMove(e: MouseEvent) {
		if (typeof window === 'undefined') return;
		rawMouseX = e.clientX;
		rawMouseY = e.clientY;
		mouseX = e.clientX / window.innerWidth;
		mouseY = e.clientY / window.innerHeight;
		isMouseActive = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (typeof window === 'undefined' || !e.touches[0]) return;
		rawMouseX = e.touches[0].clientX;
		rawMouseY = e.touches[0].clientY;
		mouseX = e.touches[0].clientX / window.innerWidth;
		mouseY = e.touches[0].clientY / window.innerHeight;
		isMouseActive = true;
	}

	function formatTime(totalSeconds: number): string {
		const mins = Math.floor(totalSeconds / 60);
		const secs = totalSeconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			rawMouseX = window.innerWidth / 2;
			rawMouseY = window.innerHeight / 2;
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('touchmove', handleTouchMove);
		}

		timerInterval = setInterval(() => {
			waitingSeconds++;
		}, 1000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('touchmove', handleTouchMove);
		}
	});

	let parsedPlayer = $derived(username ? parsePlayer(username) : null);
	let tiltX = $derived(((mouseY - 0.5) * -12).toFixed(2));
	let tiltY = $derived(((mouseX - 0.5) * 12).toFixed(2));
</script>

<div
	class="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none"
	style="background: radial-gradient(circle at {rawMouseX}px {rawMouseY}px, rgba(16, 185, 129, 0.12), transparent 45%);"
>
	<!-- Interaktívne vznášajúce sa častice reagujúce na pohyb myšou -->
	{#each particles as p (p.id)}
		{@const offsetX = (mouseX - 0.5) * -40 * p.speed}
		{@const offsetY = (mouseY - 0.5) * -40 * p.speed}
		<div
			class="absolute rounded-full pointer-events-none blur-sm transition-transform duration-500 ease-out"
			style="
				left: {p.x}%;
				top: {p.y}%;
				width: {p.size}px;
				height: {p.size}px;
				background-color: {p.color};
				transform: translate({offsetX}px, {offsetY}px);
			"
		></div>
	{/each}

	<!-- HORNÝ PANEL: Profil hráča a počítadlo času -->
	<div class="w-full max-w-4xl flex items-center justify-between gap-3 z-20 pt-2">
		<!-- Profil hráča (ak je prihlásený) -->
		{#if parsedPlayer}
			<div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 dark:bg-black/90 text-white border border-emerald-400/40 shadow-xl backdrop-blur-xl">
				<AnimalAvatar avatarId={parsedPlayer.avatarId} size={36} class="shadow-md" />
				<div class="flex flex-col text-left">
					<span class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Prihlásený hráč</span>
					<span class="text-sm font-black text-white truncate max-w-[140px] sm:max-w-[200px]">{parsedPlayer.name}</span>
				</div>
			</div>
		{:else}
			<div></div>
		{/if}

		<!-- Živé počítadlo času čakania -->
		<div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 dark:bg-black/90 text-white border border-slate-700/80 shadow-xl backdrop-blur-xl">
			<span class="text-lg animate-spin" style="animation-duration: 4s;">⏱️</span>
			<div class="flex flex-col text-right">
				<span class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Čas čakania</span>
				<span class="text-sm font-mono font-black text-amber-300">{formatTime(waitingSeconds)}</span>
			</div>
		</div>
	</div>

	<!-- STREDNÁ HLAVNÁ KARTA S NÁZVOM A 3D NÁKLONOM -->
	<div
		class="w-full max-w-3xl my-auto py-6 sm:py-8 px-6 sm:px-12 rounded-3xl bg-slate-900/90 dark:bg-black/95 text-white border-2 border-slate-700/80 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center gap-6 z-20 transition-transform duration-200 ease-out"
		style="transform: perspective(1000px) rotateX({tiltX}deg) rotateY({tiltY}deg);"
		in:scale={{ duration: 300, start: 0.95 }}
	>
		<!-- Rotujúce animované koliesko / radar (spinner) -->
		<div class="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
			<!-- Vonkajší rotujúci kruh -->
			<div class="absolute inset-0 rounded-full border-4 border-dashed border-emerald-400/60 animate-spin" style="animation-duration: 8s;"></div>
			<!-- Vnútorný opačne rotujúci kruh -->
			<div class="absolute inset-2 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin" style="animation-duration: 3s; animation-direction: reverse;"></div>
			<!-- Stredový pulzujúci žiariaci symbol -->
			<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-emerald-500/40 animate-pulse">
				🎮
			</div>
		</div>

		<!-- Status odznak: Čakajte na ostatných študentov -->
		<div class="flex flex-col items-center gap-2">
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs sm:text-sm font-black tracking-widest uppercase shadow-md">
				<span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
				<span>Čakajte na ostatných študentov...</span>
			</div>
			<p class="text-xs sm:text-sm text-slate-400 font-medium">
				Kvíz čoskoro odštartuje učiteľ. Pripravte sa!
			</p>
		</div>

		<!-- Názov kvízu (veľký, žiarivý, vysoko kontrastný) -->
		<div class="w-full">
			<h1 class="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-tight">
				{@html title}
			</h1>

			{#if description}
				<p class="text-base sm:text-xl text-slate-300 mt-3 font-semibold max-w-xl mx-auto leading-relaxed">
					{@html description}
				</p>
			{/if}
		</div>

		<!-- Cover obrázok kvízu (ak existuje) -->
		{#if cover_image}
			<div class="w-full max-w-md h-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-950 relative flex items-center justify-center group">
				<img
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					src="/api/v1/storage/download/{cover_image}"
					alt="Cover kvízu"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
			</div>
		{/if}
	</div>

	<!-- SPODNÁ ČASŤ: Interaktívna nápoveda pre študenta -->
	<div class="z-20 pb-2 text-center">
		<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-[11px] sm:text-xs text-slate-300 font-medium backdrop-blur-md">
			<span>✨</span> Pohybujte myšou alebo prstom pre interakciu s animáciou
		</div>
	</div>
</div>

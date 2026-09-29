<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { getLocalization } from '$lib/i18n';
	import { fly, fade, scale } from 'svelte/transition';
	import confetti from 'canvas-confetti';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Props {
		data: any;
		username?: any;
		show_final_results: boolean;
	}

	let { data = $bindable(), username, show_final_results }: Props = $props();

	let player_names = $derived(
		Object.keys(data || {}).sort((a, b) => {
			const scoreA = parseFloat(data[a]) || 0;
			const scoreB = parseFloat(data[b]) || 0;
			return scoreB - scoreA;
		})
	);

	let canvas: HTMLCanvasElement = $state();
	let revealStep = $state(0); // 0: začiatok, 1: 3. miesto, 2: 2. miesto, 3: 1. miesto (víťaz)

	const triggerConfetti = () => {
		try {
			confetti.create(canvas, {
				resize: true,
				useWorker: true
			});
			confetti({
				particleCount: 150,
				spread: 120,
				origin: { y: 0.6 }
			});
			setTimeout(() => {
				confetti({
					particleCount: 100,
					angle: 60,
					spread: 80,
					origin: { x: 0.1, y: 0.7 }
				});
				confetti({
					particleCount: 100,
					angle: 120,
					spread: 80,
					origin: { x: 0.9, y: 0.7 }
				});
			}, 400);
		} catch (e) {
			console.error(e);
		}
	};

	onMount(() => {
		// Postupné dramatické odhaľovanie pódia
		setTimeout(() => {
			revealStep = 1; // Odhalenie 3. miesta
		}, 800);

		setTimeout(() => {
			revealStep = 2; // Odhalenie 2. miesta
		}, 2000);

		setTimeout(() => {
			revealStep = 3; // Odhalenie víťaza (1. miesto)
			triggerConfetti();
		}, 3300);
	});

	function formatScore(score: number): string {
		return new Intl.NumberFormat('sk-SK').format(score || 0);
	}
</script>

{#if show_final_results}
	<canvas bind:this={canvas} class="fixed inset-0 pointer-events-none z-40 w-full h-full"></canvas>

	<div class="min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none">
		<!-- Nadpis pódia -->
		<div class="text-center z-10 mb-4" in:fade={{ duration: 600 }}>
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-sm font-bold tracking-wide uppercase mb-2">
				<span>🏆</span> Finálne výsledky kvízu
			</div>
			<h1 class="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl">
				Stupne víťazov
			</h1>
		</div>

		<!-- PÓDIUM (3 stupne víťazov presne ako na predlohe) -->
		<div class="w-full max-w-5xl mx-auto flex items-end justify-center gap-3 sm:gap-6 md:gap-8 px-2 flex-1 min-h-[460px] pb-6">
			<!-- 2. MIESTO (VĽAVO - Stredná výška) -->
			<div class="flex-1 max-w-[280px] flex flex-col items-center">
				{#if player_names.length >= 2 && revealStep >= 2}
					{@const player = player_names[1]}
					{@const parsed = parsePlayer(player)}
					<!-- Hlava zvieratka vykukujúca spoza stupienka -->
					<div
						in:fly|global={{ y: 60, duration: 600, delay: 200 }}
						class="relative z-10 -mb-6 flex flex-col items-center"
					>
						<div class="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border-2 border-slate-300 shadow-2xl hover:scale-105 transition-transform">
							<AnimalAvatar avatarId={parsed.avatarId} size={90} class="drop-shadow-lg" />
						</div>
					</div>

					<!-- Stupienok 2. miesta -->
					<div
						in:fly|global={{ y: 250, duration: 700 }}
						class="w-full h-64 md:h-76 bg-gradient-to-b from-indigo-700 via-indigo-900 to-slate-950 rounded-t-3xl shadow-2xl border-t-2 border-indigo-400/50 p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group"
					>
						<!-- Jemný svetelný lesk -->
						<div class="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent"></div>

						<!-- Kruhová strieborná medaila -->
						<div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-slate-400 via-gray-200 to-white shadow-xl shadow-slate-400/30 border-4 border-slate-100 flex items-center justify-center text-slate-800 font-black text-2xl md:text-3xl my-3">
							2
						</div>

						<!-- Meno hráča -->
						<h3 class="font-black text-xl md:text-2xl text-white tracking-wide truncate w-full px-2 drop-shadow">
							{parsed.name}
						</h3>

						<!-- Počet bodov -->
						<p class="font-mono font-bold text-base md:text-lg text-slate-300 mt-1">
							{formatScore(data[player])} b
						</p>
					</div>
				{:else}
					<!-- Prázdny zástupný priestor pre zachovanie zarovnania -->
					<div class="w-full h-64 md:h-76 opacity-0"></div>
				{/if}
			</div>

			<!-- 1. MIESTO (STRED - Najvyšší stupienok) -->
			<div class="flex-1 max-w-[320px] flex flex-col items-center z-20">
				{#if player_names.length >= 1 && revealStep >= 3}
					{@const player = player_names[0]}
					{@const parsed = parsePlayer(player)}
					<!-- Hlava zvieratka víťaza s korunkou / efektom -->
					<div
						in:scale|global={{ start: 0.7, duration: 700, delay: 200 }}
						class="relative z-10 -mb-7 flex flex-col items-center"
					>
						<div class="p-2 rounded-full bg-yellow-400/20 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl animate-pulse hover:scale-110 transition-transform">
							<AnimalAvatar avatarId={parsed.avatarId} size={110} class="drop-shadow-2xl" />
						</div>
						<span class="text-2xl absolute -top-4">👑</span>
					</div>

					<!-- Stupienok 1. miesta -->
					<div
						in:fly|global={{ y: 300, duration: 800 }}
						class="w-full h-84 md:h-96 bg-gradient-to-b from-indigo-600 via-indigo-900 to-slate-950 rounded-t-3xl shadow-2xl border-t-4 border-yellow-400 p-5 flex flex-col items-center justify-start text-center relative overflow-hidden group"
					>
						<!-- Zlatý odlesk -->
						<div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-yellow-300/25 to-transparent"></div>

						<!-- Kruhová zlatá medaila -->
						<div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-100 shadow-2xl shadow-yellow-500/50 border-4 border-yellow-200 flex items-center justify-center text-amber-950 font-black text-3xl md:text-4xl my-3 animate-bounce">
							1
						</div>

						<!-- Meno víťaza -->
						<h3 class="font-black text-2xl md:text-3xl text-white tracking-wide truncate w-full px-2 drop-shadow-md">
							{parsed.name}
						</h3>

						<!-- Počet bodov -->
						<p class="font-mono font-extrabold text-lg md:text-xl text-yellow-300 mt-1">
							{formatScore(data[player])} bodov
						</p>
					</div>
				{:else}
					<div class="w-full h-84 md:h-96 opacity-0"></div>
				{/if}
			</div>

			<!-- 3. MIESTO (VPRAVO - Nižší stupienok) -->
			<div class="flex-1 max-w-[280px] flex flex-col items-center">
				{#if player_names.length >= 3 && revealStep >= 1}
					{@const player = player_names[2]}
					{@const parsed = parsePlayer(player)}
					<!-- Hlava zvieratka 3. miesta -->
					<div
						in:fly|global={{ y: 50, duration: 600, delay: 150 }}
						class="relative z-10 -mb-6 flex flex-col items-center"
					>
						<div class="p-1 rounded-full bg-white/10 backdrop-blur-sm border-2 border-amber-600/70 shadow-xl hover:scale-105 transition-transform">
							<AnimalAvatar avatarId={parsed.avatarId} size={80} class="drop-shadow-md" />
						</div>
					</div>

					<!-- Stupienok 3. miesta -->
					<div
						in:fly|global={{ y: 200, duration: 600 }}
						class="w-full h-52 md:h-60 bg-gradient-to-b from-indigo-800 via-indigo-950 to-slate-950 rounded-t-3xl shadow-xl border-t-2 border-amber-600/50 p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group"
					>
						<!-- Jemný odlesk -->
						<div class="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent"></div>

						<!-- Kruhová bronzová medaila -->
						<div class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-orange-400 shadow-xl shadow-amber-800/40 border-4 border-amber-300/80 flex items-center justify-center text-amber-950 font-black text-xl md:text-2xl my-2.5">
							3
						</div>

						<!-- Meno hráča -->
						<h3 class="font-black text-lg md:text-xl text-white tracking-wide truncate w-full px-2 drop-shadow">
							{parsed.name}
						</h3>

						<!-- Počet bodov -->
						<p class="font-mono font-bold text-sm md:text-base text-amber-200 mt-1">
							{formatScore(data[player])} b
						</p>
					</div>
				{:else}
					<div class="w-full h-52 md:h-60 opacity-0"></div>
				{/if}
			</div>
		</div>

		<!-- Ďalšie umiestnenia (4. a ďalšie miesta) -->
		{#if player_names.length > 3 && revealStep >= 3}
			<div
				in:fade={{ duration: 600, delay: 600 }}
				class="w-full max-w-3xl mx-auto mt-4 mb-8 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-3xl p-5 shadow-2xl"
			>
				<h4 class="text-xs uppercase font-extrabold tracking-wider text-slate-400 text-center mb-3">
					Ďalšie umiestnenia
				</h4>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
					{#each player_names.slice(3) as player, idx}
						{@const rank = idx + 4}
						{@const parsed = parsePlayer(player)}
						<div class="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 border border-slate-700/40">
							<div class="flex items-center gap-2 min-w-0">
								<span class="text-xs font-mono font-bold text-slate-400 w-5">#{rank}</span>
								<AnimalAvatar avatarId={parsed.avatarId} size={28} class="shrink-0" />
								<span class="font-bold text-sm text-gray-200 truncate">{parsed.name}</span>
							</div>
							<span class="font-mono font-semibold text-xs text-emerald-400 shrink-0">
								{formatScore(data[player])} b
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Pre pripojeného hráča na jeho vlastnom zariadení (username) -->
		{#if username && data[username] !== undefined}
			{@const parsed = parsePlayer(username)}
			{@const myRank = player_names.indexOf(username) + 1}
			<div class="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4">
				<div class="bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 text-white backdrop-blur-md">
					<AnimalAvatar avatarId={parsed.avatarId} size={44} class="shadow-md" />
					<div>
						<div class="text-xs uppercase font-bold text-emerald-400">Tvoj výsledok</div>
						<div class="font-extrabold text-lg text-white">
							{parsed.name} – {formatScore(data[username])} bodov
						</div>
						<div class="text-xs text-slate-300">
							Umiestnenie: <span class="font-black text-yellow-300">#{myRank}</span> z {player_names.length}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

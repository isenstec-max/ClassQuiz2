<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { getLocalization } from '$lib/i18n';
	import confetti from 'canvas-confetti';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import AccuracyDonut from '$lib/components/AccuracyDonut.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Props {
		data?: any;
		final_results?: any;
		players?: any[];
		username?: any;
		show_final_results?: boolean;
	}

	let {
		data = $bindable({}),
		final_results = null,
		players = [],
		username,
		show_final_results = true
	}: Props = $props();

	// Agregácia celkových bodov zo všetkých zdrojov (data, final_results, players)
	let resolvedScores = $derived.by(() => {
		const scores: Record<string, number> = {};

		// 1. Z bind:data ak existujú body
		if (data && typeof data === 'object') {
			for (const [k, v] of Object.entries(data)) {
				if (k && !isNaN(Number(v))) {
					scores[k] = Number(v);
				}
			}
		}

		// 2. Z final_results (štruktúra { "0": [...], "1": [...] })
		if (final_results && typeof final_results === 'object') {
			for (const qAnswers of Object.values(final_results)) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						if (a && a.username) {
							scores[a.username] = (scores[a.username] || 0) + (Number(a.score) || 0);
						}
					}
				}
			}
		}

		// 3. Ak nejaký prihlásený hráč nezískal žiadne body, pridaj ho s 0
		if (Array.isArray(players)) {
			for (const p of players) {
				const u = typeof p === 'string' ? p : p?.username;
				if (u && scores[u] === undefined) {
					scores[u] = 0;
				}
			}
		}

		return scores;
	});

	// Úspešnosť každého hráča (správne vs nesprávne odpovede a percento)
	let playerAccuracy = $derived.by(() => {
		const map: Record<string, { correct: number; incorrect: number; total: number; pct: number }> = {};
		if (final_results && typeof final_results === 'object') {
			for (const qAnswers of Object.values(final_results)) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						if (a && a.username) {
							if (!map[a.username]) {
								map[a.username] = { correct: 0, incorrect: 0, total: 0, pct: 0 };
							}
							map[a.username].total++;
							if (a.right) {
								map[a.username].correct++;
							} else {
								map[a.username].incorrect++;
							}
						}
					}
				}
			}
		}
		for (const u of Object.keys(map)) {
			const item = map[u];
			item.pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
		}
		return map;
	});

	let playerLightning = $derived.by(() => {
		const map: Record<string, number> = {};
		if (final_results && typeof final_results === 'object') {
			for (const qAnswers of Object.values(final_results)) {
				if (Array.isArray(qAnswers)) {
					const correct = qAnswers.filter((a) => a && a.username && a.right && Number(a.time_taken) > 0);
					if (correct.length > 0) {
						const minTime = Math.min(...correct.map((a) => Number(a.time_taken)));
						const fastest = correct.filter((a) => Number(a.time_taken) === minTime);
						for (const f of fastest) {
							map[f.username] = (map[f.username] || 0) + 1;
						}
					}
				}
			}
		}
		return map;
	});

	let player_names = $derived.by(() => {
		return Object.keys(resolvedScores).sort((a, b) => {
			const scoreA = resolvedScores[a] || 0;
			const scoreB = resolvedScores[b] || 0;
			return scoreB - scoreA;
		});
	});

	let otherPlayers = $derived(player_names.slice(3));
	let half = $derived(Math.ceil(otherPlayers.length / 2));
	let leftPlayers = $derived(otherPlayers.slice(0, half));
	let rightPlayers = $derived(otherPlayers.slice(half));

	onMount(() => {
		if (typeof window !== 'undefined') {
			try {
				confetti({
					particleCount: 160,
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
				}, 500);
			} catch (e) {
				console.warn('Confetti warning:', e);
			}
		}
	});

	function formatScore(score: number): string {
		return new Intl.NumberFormat('sk-SK').format(score || 0);
	}

	function formatScoreWithUnit(score: number): string {
		const formatted = formatScore(score);
		const s = Math.round(Number(score) || 0);
		let unit = 'bodov';
		if (s === 1) unit = 'bod';
		else if (s >= 2 && s <= 4) unit = 'body';
		return `${formatted} ${unit}`;
	}
</script>

{#if show_final_results}
	<div class="min-h-screen w-full flex flex-col justify-between items-center px-4 {username ? 'pt-4 sm:pt-6' : 'pt-24 sm:pt-28'} pb-8 relative overflow-hidden select-none">
		<!-- Nadpis pódia -->
		<div class="text-center z-10 mb-4 sm:mb-6 flex flex-col items-center animate-fade-down">
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 text-amber-300 border-2 border-amber-400/50 text-xs sm:text-sm font-black tracking-widest uppercase mb-2 shadow-xl backdrop-blur-md ring-2 ring-amber-400/20">
				<span>🏆</span> {$t('results_page.final_overview', { default: 'Finálne výsledky kvízu' })}
			</div>
			<div class="px-8 sm:px-12 py-2 sm:py-3 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-2xl">
				<h1 class="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
					{$t('results_page.podium_title', { default: 'Stupne víťazov' })}
				</h1>
			</div>

			<!-- Pre pripojeného hráča na jeho vlastnom zariadení (username) -->
			{#if username && resolvedScores[username] !== undefined}
				{@const parsed = parsePlayer(username)}
				{@const myRank = player_names.indexOf(username) + 1}
				{@const acc = playerAccuracy[username]}
				<div class="mt-3 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/95 border-2 border-emerald-500 shadow-2xl backdrop-blur-md text-white">
					<AnimalAvatar avatarId={parsed.avatarId} size={40} class="shadow-md shrink-0" />
					<div class="text-left">
						<div class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
							{$t('results_page.your_result', { default: 'Tvoj výsledok' })}
						</div>
						<div class="font-extrabold text-sm sm:text-base text-white flex items-center gap-2.5">
							<span>{parsed.name}</span>
							<span class="text-emerald-300 font-mono">({formatScoreWithUnit(resolvedScores[username])})</span>
							<span class="px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 text-xs font-black border border-yellow-400/30">
								#{myRank} z {player_names.length}
							</span>
						</div>
					</div>
					{#if acc}
						<div class="ml-2">
							<AccuracyDonut
								correct={acc.correct}
								incorrect={acc.incorrect}
								total={acc.total}
								size={38}
								strokeWidth={4.5}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if player_names.length === 0}
			<!-- Žiadni účastníci -->
			<div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
				<div class="p-8 rounded-3xl bg-slate-900/85 border border-white/15 shadow-2xl text-white max-w-md">
					<div class="text-5xl mb-3">🎮</div>
					<h3 class="text-2xl font-bold mb-1">Kvíz bol ukončený</h3>
					<p class="text-slate-400 text-sm">Žiadni hráči neodpovedali na otázky.</p>
				</div>
			</div>
		{:else}
			<!-- ARENA S PÓDIOM A BOČNÝMI PANELMI ÚČASTNÍKOV -->
			<div class="w-full max-w-[1920px] mx-auto flex flex-col xl:flex-row items-center xl:items-end justify-center gap-4 xl:gap-6 2xl:gap-8 px-2 sm:px-4 flex-1 pb-4">
				<!-- ĽAVÉ KRÍDLO: Ďalší účastníci (1. polovica, od 4. miesta) -->
				<div
					class="w-full max-w-md xl:w-96 2xl:w-[420px] bg-slate-900/90 dark:bg-black/90 backdrop-blur-2xl border-2 border-slate-700/70 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col h-[480px] md:h-[520px] xl:h-[540px] mb-4 xl:mb-0 ring-2 ring-white/10 shrink-0 animate-fade-up"
				>
					<div class="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
						<div class="flex items-center gap-2">
							<span class="text-lg">🏅</span>
							<span class="text-xs uppercase font-black tracking-wider text-amber-300">
								{leftPlayers.length > 0 ? `4. – ${3 + leftPlayers.length}. miesto` : 'Ďalší účastníci'}
							</span>
						</div>
						<span class="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
							{leftPlayers.length} {leftPlayers.length === 1 ? 'hráč' : leftPlayers.length >= 2 && leftPlayers.length <= 4 ? 'hráči' : 'hráčov'}
						</span>
					</div>
					{#if leftPlayers.length > 0}
						<div class="overflow-y-auto space-y-2.5 pr-1 flex-1 custom-scrollbar">
							{#each leftPlayers as player, idx}
								{@const rank = idx + 4}
								{@const parsed = parsePlayer(player)}
								{@const acc = playerAccuracy[player]}
								<div
									class="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 shadow-sm transition-all {username === player ? 'ring-2 ring-emerald-400 bg-emerald-500/20' : ''}"
								>
									<div class="flex items-center gap-3 min-w-0">
										<span class="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 shrink-0">
											#{rank}
										</span>
										<AnimalAvatar avatarId={parsed.avatarId} size={36} class="shrink-0 drop-shadow" />
										<div class="flex flex-col justify-center min-w-0 flex-1">
											{#if (playerLightning[player] ?? 0) > 0}
												<div class="flex items-center gap-0.5 mb-0.5" title="Najrýchlejšia správna odpoveď: {playerLightning[player]}x">
													{#each Array(playerLightning[player]) as _}
														<svg class="w-3 h-3 text-amber-300 fill-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)] shrink-0" viewBox="0 0 24 24">
															<path d="M13 2L3 14h7v8l10-12h-7l1-8z" />
														</svg>
													{/each}
												</div>
											{/if}
											<span class="font-extrabold text-sm sm:text-base text-white truncate max-w-[110px] sm:max-w-[130px]">
												{parsed.name}
											</span>
										</div>
									</div>
									<div class="flex items-center gap-3 shrink-0">
										{#if acc}
											<AccuracyDonut
												correct={acc.correct}
												incorrect={acc.incorrect}
												total={acc.total}
												size={38}
												strokeWidth={4.5}
											/>
										{/if}
										<span class="font-mono font-black text-xs sm:text-sm text-emerald-400 shrink-0 text-right min-w-[65px]">
											{formatScoreWithUnit(resolvedScores[player])}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
							<div class="text-4xl mb-2">👥</div>
							<div class="text-sm font-extrabold text-white mb-1">Žiadni ďalší účastníci</div>
							<p class="text-xs text-slate-400 max-w-[180px]">
								Všetci hráči ({player_names.length}) sa umiestnili na stupňoch víťazov!
							</p>
						</div>
					{/if}
				</div>

				<!-- STREDNÉ PÓDIUM (3 stupne víťazov) -->
				<div class="w-full max-w-4xl flex items-end justify-center gap-3 sm:gap-6 md:gap-8 px-2 flex-1 min-h-[460px]">
					<!-- 2. MIESTO (VĽAVO - Striebro) -->
					<div class="flex-1 max-w-[280px] flex flex-col items-center animate-podium-second">
						{#if player_names.length >= 2}
							{@const player = player_names[1]}
							{@const parsed = parsePlayer(player)}
							{@const acc = playerAccuracy[player]}
							<!-- Hlava zvieratka vykukujúca spoza stupienka -->
							<div class="relative z-10 -mb-6 flex flex-col items-center">
								<div class="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border-2 border-slate-300 shadow-2xl hover:scale-105 transition-transform">
									<AnimalAvatar avatarId={parsed.avatarId} size={90} class="drop-shadow-lg" />
								</div>
							</div>

							<!-- Stupienok 2. miesta -->
							<div
								class="w-full h-68 md:h-80 bg-gradient-to-b from-indigo-700 via-indigo-900 to-slate-950 rounded-t-3xl shadow-2xl border-t-2 border-indigo-400/50 p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group"
							>
								<div class="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent"></div>

								<!-- Kruhová strieborná medaila -->
								<div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-slate-400 via-gray-200 to-white shadow-xl shadow-slate-400/30 border-4 border-slate-100 flex items-center justify-center text-slate-800 font-black text-2xl md:text-3xl my-2.5">
									2
								</div>

								<!-- Blesky hráča -->
								{#if (playerLightning[player] ?? 0) > 0}
									<div class="flex items-center justify-center gap-0.5 mb-1" title="Najrýchlejšia správna odpoveď: {playerLightning[player]}x">
										{#each Array(playerLightning[player]) as _}
											<svg class="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24">
												<path d="M13 2L3 14h7v8l10-12h-7l1-8z" />
											</svg>
										{/each}
									</div>
								{/if}

								<!-- Meno hráča -->
								<h3 class="font-black text-xl md:text-2xl text-white tracking-wide truncate w-full px-2 drop-shadow">
									{parsed.name}
								</h3>

								<!-- Počet bodov -->
								<p class="font-mono font-bold text-base md:text-lg text-slate-300 mt-1">
									{formatScoreWithUnit(resolvedScores[player])}
								</p>

								<!-- Kruhový graf úspešnosti -->
								{#if acc}
									<div class="mt-2.5">
										<AccuracyDonut
											correct={acc.correct}
											incorrect={acc.incorrect}
											total={acc.total}
											size={42}
											strokeWidth={4.5}
										/>
									</div>
								{/if}
							</div>
						{:else}
							<div class="w-full h-64 md:h-76 opacity-0"></div>
						{/if}
					</div>

					<!-- 1. MIESTO (STRED - Zlato, Víťaz) -->
					<div class="flex-1 max-w-[320px] flex flex-col items-center z-20 animate-podium-first">
						{#if player_names.length >= 1}
							{@const player = player_names[0]}
							{@const parsed = parsePlayer(player)}
							{@const acc = playerAccuracy[player]}
							<!-- Hlava zvieratka víťaza s korunkou -->
							<div class="relative z-10 -mb-7 flex flex-col items-center">
								<div class="p-2 rounded-full bg-yellow-400/20 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl animate-pulse hover:scale-110 transition-transform">
									<AnimalAvatar avatarId={parsed.avatarId} size={110} class="drop-shadow-2xl" />
								</div>
								<span class="text-2xl absolute -top-4">👑</span>
							</div>

							<!-- Stupienok 1. miesta -->
							<div
								class="w-full h-88 md:h-[410px] bg-gradient-to-b from-indigo-600 via-indigo-900 to-slate-950 rounded-t-3xl shadow-2xl border-t-4 border-yellow-400 p-5 flex flex-col items-center justify-start text-center relative overflow-hidden group"
							>
								<div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-yellow-300/25 to-transparent"></div>

								<!-- Kruhová zlatá medaila -->
								<div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-yellow-100 shadow-2xl shadow-yellow-500/50 border-4 border-yellow-200 flex items-center justify-center text-amber-950 font-black text-3xl md:text-4xl my-2.5 animate-bounce">
									1
								</div>

								<!-- Blesky víťaza -->
								{#if (playerLightning[player] ?? 0) > 0}
									<div class="flex items-center justify-center gap-0.5 mb-1" title="Najrýchlejšia správna odpoveď: {playerLightning[player]}x">
										{#each Array(playerLightning[player]) as _}
											<svg class="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24">
												<path d="M13 2L3 14h7v8l10-12h-7l1-8z" />
											</svg>
										{/each}
									</div>
								{/if}

								<!-- Meno víťaza -->
								<h3 class="font-black text-2xl md:text-3xl text-white tracking-wide truncate w-full px-2 drop-shadow-md">
									{parsed.name}
								</h3>

								<!-- Počet bodov -->
								<p class="font-mono font-extrabold text-lg md:text-xl text-yellow-300 mt-1">
									{formatScoreWithUnit(resolvedScores[player])}
								</p>

								<!-- Kruhový graf úspešnosti -->
								{#if acc}
									<div class="mt-3">
										<AccuracyDonut
											correct={acc.correct}
											incorrect={acc.incorrect}
											total={acc.total}
											size={46}
											strokeWidth={4.5}
										/>
									</div>
								{/if}
							</div>
						{:else}
							<div class="w-full h-84 md:h-96 opacity-0"></div>
						{/if}
					</div>

					<!-- 3. MIESTO (VPRAVO - Bronz) -->
					<div class="flex-1 max-w-[280px] flex flex-col items-center animate-podium-third">
						{#if player_names.length >= 3}
							{@const player = player_names[2]}
							{@const parsed = parsePlayer(player)}
							{@const acc = playerAccuracy[player]}
							<!-- Hlava zvieratka 3. miesta -->
							<div class="relative z-10 -mb-6 flex flex-col items-center">
								<div class="p-1 rounded-full bg-white/10 backdrop-blur-sm border-2 border-amber-600/70 shadow-xl hover:scale-105 transition-transform">
									<AnimalAvatar avatarId={parsed.avatarId} size={80} class="drop-shadow-md" />
								</div>
							</div>

							<!-- Stupienok 3. miesta -->
							<div
								class="w-full h-56 md:h-66 bg-gradient-to-b from-indigo-800 via-indigo-950 to-slate-950 rounded-t-3xl shadow-xl border-t-2 border-amber-600/50 p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group"
							>
								<div class="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent"></div>

								<!-- Kruhová bronzová medaila -->
								<div class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-orange-400 shadow-xl shadow-amber-800/40 border-4 border-amber-300/80 flex items-center justify-center text-amber-950 font-black text-xl md:text-2xl my-2">
									3
								</div>

								<!-- Blesky hráča -->
								{#if (playerLightning[player] ?? 0) > 0}
									<div class="flex items-center justify-center gap-0.5 mb-1" title="Najrýchlejšia správna odpoveď: {playerLightning[player]}x">
										{#each Array(playerLightning[player]) as _}
											<svg class="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)]" viewBox="0 0 24 24">
												<path d="M13 2L3 14h7v8l10-12h-7l1-8z" />
											</svg>
										{/each}
									</div>
								{/if}

								<!-- Meno hráča -->
								<h3 class="font-black text-lg md:text-xl text-white tracking-wide truncate w-full px-2 drop-shadow">
									{parsed.name}
								</h3>

								<!-- Počet bodov -->
								<p class="font-mono font-bold text-sm md:text-base text-amber-200 mt-1">
									{formatScoreWithUnit(resolvedScores[player])}
								</p>

								<!-- Kruhový graf úspešnosti -->
								{#if acc}
									<div class="mt-2">
										<AccuracyDonut
											correct={acc.correct}
											incorrect={acc.incorrect}
											total={acc.total}
											size={40}
											strokeWidth={4.5}
										/>
									</div>
								{/if}
							</div>
						{:else}
							<div class="w-full h-52 md:h-60 opacity-0"></div>
						{/if}
					</div>
				</div>

				<!-- PRAVÉ KRÍDLO: Ďalší účastníci (2. polovica, od X+1. miesta) -->
				<div
					class="w-full max-w-md xl:w-96 2xl:w-[420px] bg-slate-900/90 dark:bg-black/90 backdrop-blur-2xl border-2 border-slate-700/70 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col h-[480px] md:h-[520px] xl:h-[540px] mb-4 xl:mb-0 ring-2 ring-white/10 shrink-0 animate-fade-up"
				>
					<div class="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
						<div class="flex items-center gap-2">
							<span class="text-lg">🎖️</span>
							<span class="text-xs uppercase font-black tracking-wider text-amber-300">
								{rightPlayers.length > 0 ? `${4 + leftPlayers.length}. – ${player_names.length}. miesto` : 'Poradie a body'}
							</span>
						</div>
						<span class="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
							{rightPlayers.length} {rightPlayers.length === 1 ? 'hráč' : rightPlayers.length >= 2 && rightPlayers.length <= 4 ? 'hráči' : 'hráčov'}
						</span>
					</div>
					{#if rightPlayers.length > 0}
						<div class="overflow-y-auto space-y-2.5 pr-1 flex-1 custom-scrollbar">
							{#each rightPlayers as player, idx}
								{@const rank = idx + 4 + leftPlayers.length}
								{@const parsed = parsePlayer(player)}
								{@const acc = playerAccuracy[player]}
								<div
									class="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 shadow-sm transition-all {username === player ? 'ring-2 ring-emerald-400 bg-emerald-500/20' : ''}"
								>
									<div class="flex items-center gap-3 min-w-0">
										<span class="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 shrink-0">
											#{rank}
										</span>
										<AnimalAvatar avatarId={parsed.avatarId} size={36} class="shrink-0 drop-shadow" />
										<div class="flex flex-col justify-center min-w-0 flex-1">
											{#if (playerLightning[player] ?? 0) > 0}
												<div class="flex items-center gap-0.5 mb-0.5" title="Najrýchlejšia správna odpoveď: {playerLightning[player]}x">
													{#each Array(playerLightning[player]) as _}
														<svg class="w-3 h-3 text-amber-300 fill-amber-300 drop-shadow-[0_0_3px_rgba(251,191,36,0.9)] shrink-0" viewBox="0 0 24 24">
															<path d="M13 2L3 14h7v8l10-12h-7l1-8z" />
														</svg>
													{/each}
												</div>
											{/if}
											<span class="font-extrabold text-sm sm:text-base text-white truncate max-w-[110px] sm:max-w-[130px]">
												{parsed.name}
											</span>
										</div>
									</div>
									<div class="flex items-center gap-3 shrink-0">
										{#if acc}
											<AccuracyDonut
												correct={acc.correct}
												incorrect={acc.incorrect}
												total={acc.total}
												size={38}
												strokeWidth={4.5}
											/>
										{/if}
										<span class="font-mono font-black text-xs sm:text-sm text-emerald-400 shrink-0 text-right min-w-[65px]">
											{formatScoreWithUnit(resolvedScores[player])}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
							<div class="text-4xl mb-2">⭐</div>
							<div class="text-sm font-extrabold text-white mb-1">Ďalšie miesta (4. a ďalej)</div>
							<p class="text-xs text-slate-400 max-w-[180px]">
								Pri väčšom počte hráčov sa tu zobrazí poradie s bodmi a úspešnosťou.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

	</div>
{/if}

<style>
	@keyframes podiumRise {
		from {
			transform: translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.animate-podium-first {
		animation: podiumRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
	}
	.animate-podium-second {
		animation: podiumRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
	}
	.animate-podium-third {
		animation: podiumRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
	}

	@keyframes fadeDown {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.animate-fade-down {
		animation: fadeDown 0.6s ease-out both;
	}

	@keyframes fadeUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	.animate-fade-up {
		animation: fadeUp 0.6s ease-out 0.6s both;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 9999px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 9999px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.4);
	}
</style>

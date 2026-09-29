<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	function sortObjectbyValue(obj: Record<string, number>) {
		const ret: Record<string, number> = {};
		Object.keys(obj)
			.sort((a, b) => obj[b] - obj[a])
			.forEach((s) => (ret[s] = obj[s]));
		return ret;
	}

	interface Props {
		scores: any;
		question_results: Array<{
			username: string;
			answer: string;
			right: boolean;
			time_taken: number;
			score: number;
		}>;
		username: any;
	}

	let { scores = $bindable(), question_results, username }: Props = $props();
	let score_by_username = $state<Record<string, number>>({});

	if (JSON.stringify(scores) === '{}') {
		for (const i of question_results) {
			scores[i.username] = 0;
		}
	}
	for (const i of question_results) {
		score_by_username[i.username] = i.score;
	}
	for (const u of Object.keys(score_by_username)) {
		scores[u] = (score_by_username[u] ?? 0) + (scores[u] ?? 0);
	}
	scores = scores;

	let sorted_scores = $derived(sortObjectbyValue(scores));
	let parsed = $derived(parsePlayer(username || ''));

	let myResult = $derived(question_results?.find((r) => r.username === username));
	let pointsGained = $derived(myResult?.score ?? score_by_username[username] ?? 0);
	let isCorrect = $derived(Boolean(myResult?.right));
	let hasAnswered = $derived(myResult !== undefined);

	let totalScore = $derived(sorted_scores[username] ?? 0);

	let playerRank = $derived.by(() => {
		const keys = Object.keys(sorted_scores);
		const index = keys.indexOf(username);
		return index >= 0 ? index + 1 : null;
	});

	let totalPlayers = $derived(Object.keys(sorted_scores).length);

	function formatPoints(pts: number): string {
		return new Intl.NumberFormat('sk-SK').format(pts || 0);
	}
</script>

<div class="min-h-[85vh] w-full flex items-center justify-center p-4 sm:p-6 select-none">
	<div
		class="relative w-full max-w-sm sm:max-w-md bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center overflow-hidden ring-4 text-white {isCorrect
			? 'border-emerald-500/70 ring-emerald-500/20 shadow-emerald-500/20'
			: 'border-slate-700/80 ring-white/10 shadow-black/40'}"
	>
		<!-- Horný akcentný pásik -->
		<div
			class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r {isCorrect
				? 'from-emerald-400 via-teal-300 to-emerald-500'
				: 'from-amber-400 via-rose-400 to-amber-500'}"
		></div>

		<!-- Horný štítok Výsledok -->
		<div
			class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-3 {isCorrect
				? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
				: 'bg-white/10 text-slate-300 border border-white/15'}"
		>
			<span>📊</span>
			<span>{$t('words.result', { default: 'Výsledok' })}</span>
		</div>

		<!-- Ikona stavu: Správne / Nesprávne -->
		{#if hasAnswered}
			{#if isCorrect}
				<div
					class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-3xl sm:text-4xl shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-2"
				>
					✓
				</div>
				<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
					{$t('play_page.correct', { default: 'Správne!' })}
				</h2>
			{:else}
				<div
					class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 text-3xl sm:text-4xl shadow-[0_0_30px_rgba(244,63,94,0.4)] mb-2"
				>
					✕
				</div>
				<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
					{$t('play_page.incorrect', { default: 'Nesprávne' })}
				</h2>
			{/if}
		{:else}
			<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
				{$t('words.result', { default: 'Výsledok' })}
			</h2>
		{/if}

		<!-- Profil hráča: Avatar a meno -->
		<div
			class="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-full shadow-md my-4"
		>
			<AnimalAvatar avatarId={parsed.avatarId} size={38} class="shadow-sm shrink-0" />
			<span class="font-extrabold text-base sm:text-lg text-white tracking-wide truncate max-w-[200px]">
				{parsed.name}
			</span>
		</div>

		<!-- Získané body za túto otázku -->
		<div
			class="w-full rounded-2xl p-4 sm:p-5 my-2 text-center transition-all {pointsGained > 0
				? 'bg-emerald-500/15 border-2 border-emerald-400/50 shadow-lg ring-2 ring-emerald-500/20'
				: 'bg-slate-800/50 border border-slate-700/60'}"
		>
			<span
				class="text-xs uppercase font-extrabold tracking-widest block mb-1 {pointsGained > 0
					? 'text-emerald-300'
					: 'text-slate-400'}"
			>
				{pointsGained > 0 ? '⚡ Získané body' : 'Získané body'}
			</span>
			<div
				class="font-black font-mono tracking-tight leading-none {pointsGained > 0
					? 'text-5xl sm:text-6xl text-emerald-400 drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)]'
					: 'text-4xl sm:text-5xl text-slate-400'}"
			>
				+{formatPoints(pointsGained)}
			</div>
		</div>

		<!-- Celkové skóre (Total score) - Veľké a prominentné -->
		<div
			class="w-full bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 mt-3 shadow-xl ring-2 ring-amber-400/30 text-center"
		>
			<div
				class="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 mb-1"
			>
				<span class="text-base sm:text-lg">🏆</span>
				<span>{$t('play_page.total_score', { default: 'Celkové skóre' })}</span>
			</div>
			<div
				class="text-5xl sm:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 drop-shadow-md"
			>
				{formatPoints(totalScore)}
			</div>
		</div>

		<!-- Aktuálne umiestnenie v rebríčku -->
		{#if playerRank && totalPlayers > 0}
			<div
				class="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs sm:text-sm font-bold shadow-inner"
			>
				<span>🎖️</span>
				<span>
					Ste na <span class="text-amber-300 font-extrabold">{playerRank}.</span> mieste z {totalPlayers}
				</span>
			</div>
		{/if}
	</div>
</div>

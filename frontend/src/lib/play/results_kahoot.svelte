<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { parsePlayer } from '$lib/avatars';
	import { getLocalization } from '$lib/i18n';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';
	import {
		savePlayerAnswerRecord,
		getPlayerAnswerHistory,
		getSolution
	} from '$lib/play/session_storage';

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
		solution?: any;
		question?: any;
		question_index?: number | string;
	}

	let {
		scores = $bindable(),
		question_results,
		username,
		solution,
		question,
		question_index
	}: Props = $props();

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

	// Celkový pomer správnych a nesprávnych odpovedí hráča za celý kvíz
	let statsOverall = $derived.by(() => {
		let history = getPlayerAnswerHistory();
		const currentQKey =
			question_index !== undefined && question_index !== '' ? String(question_index) : null;

		if (hasAnswered && currentQKey !== null) {
			if (!history[currentQKey]) {
				history[currentQKey] = {
					right: isCorrect,
					score: pointsGained
				};
				savePlayerAnswerRecord(currentQKey, history[currentQKey]);
			}
		}

		const entries = Object.values(history);
		let correct = entries.filter((e) => e.right).length;
		let incorrect = entries.filter((e) => !e.right).length;

		if (entries.length === 0 && hasAnswered) {
			if (isCorrect) correct = 1;
			else incorrect = 1;
		}

		const total = correct + incorrect;
		const correctPct = total > 0 ? Math.round((correct / total) * 100) : isCorrect ? 100 : 0;
		const incorrectPct = total > 0 ? 100 - correctPct : isCorrect ? 0 : 100;

		return {
			correct,
			incorrect,
			total,
			correctPct,
			incorrectPct
		};
	});

	// Správna odpoveď (farba + text + tvar)
	let effectiveSolution = $derived(solution || getSolution());

	let correctAnswers = $derived.by(() => {
		const target = effectiveSolution || question;
		if (!target || !target.answers) {
			if (isCorrect && myResult?.answer) {
				return [
					{
						index: 0,
						shapeIndex: undefined,
						text: myResult.answer,
						color: '#10b981'
					}
				];
			}
			return [];
		}

		// ABCD / CHECK otázky
		if (Array.isArray(target.answers)) {
			const list: Array<{
				index: number;
				shapeIndex?: number;
				text: string;
				color: string;
			}> = [];

			target.answers.forEach((ans: any, idx: number) => {
				const color = ans.color ?? DEFAULT_ANSWER_COLORS[idx % DEFAULT_ANSWER_COLORS.length];
				if (ans.right === true) {
					list.push({
						index: idx,
						shapeIndex: idx,
						text: ans.answer,
						color
					});
				}
			});

			// Fallback: ak target nemá príznak right, ale hráč odpovedal správne
			if (list.length === 0 && isCorrect && myResult?.answer) {
				const foundIdx = target.answers.findIndex((a: any) => a.answer === myResult.answer);
				if (foundIdx >= 0) {
					const ans = target.answers[foundIdx];
					list.push({
						index: foundIdx,
						shapeIndex: foundIdx,
						text: ans.answer,
						color: ans.color ?? DEFAULT_ANSWER_COLORS[foundIdx % DEFAULT_ANSWER_COLORS.length]
					});
				}
			}

			return list;
		}

		// TEXT otázky
		if (target.type === 'TEXT' && Array.isArray(target.answers)) {
			return target.answers.map((a: any, idx: number) => ({
				index: idx,
				shapeIndex: undefined,
				text: a.answer,
				color: '#10b981'
			}));
		}

		// RANGE otázky
		if (target.type === 'RANGE' && target.answers) {
			const r = target.answers;
			const min = r.min_correct ?? r.min;
			const max = r.max_correct ?? r.max;
			const text = min === max ? `${min}` : `${min} - ${max}`;
			return [
				{
					index: 0,
					shapeIndex: undefined,
					text: `Správny rozsah: ${text}`,
					color: '#10b981'
				}
			];
		}

		return [];
	});
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

		<!-- Horný riadok krúžkov: Stav otázky + Zeleno-červený koláčový graf celkového pomeru -->
		{#if hasAnswered}
			<div class="flex items-center justify-center gap-6 sm:gap-8 my-2">
				<!-- 1. Krúžok: Správne / Nesprávne -->
				<div class="flex flex-col items-center">
					{#if isCorrect}
						<div
							class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-3xl sm:text-4xl shadow-[0_0_25px_rgba(16,185,129,0.4)]"
						>
							✓
						</div>
					{:else}
						<div
							class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 text-3xl sm:text-4xl shadow-[0_0_25px_rgba(244,63,94,0.4)]"
						>
							✕
						</div>
					{/if}
					<span
						class="text-[11px] sm:text-xs font-black tracking-wider uppercase mt-1.5 {isCorrect
							? 'text-emerald-400'
							: 'text-rose-400'}"
					>
						{isCorrect ? 'Správne' : 'Nesprávne'}
					</span>
				</div>

				<!-- 2. Krúžok: Zeleno / červený koláčový graf celkového pomeru s percentami -->
				<div class="flex flex-col items-center">
					<div
						class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden"
						style="background: conic-gradient(#10b981 0% {statsOverall.correctPct}%, #f43f5e {statsOverall.correctPct}% 100%);"
						title="Celkový pomer: {statsOverall.correct} správnych ({statsOverall.correctPct}%), {statsOverall.incorrect} nesprávnych ({statsOverall.incorrectPct}%)"
					>
						<!-- Donut stred -->
						<div
							class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/95 flex flex-col items-center justify-center shadow-inner"
						>
							<span class="text-xs sm:text-sm font-black font-mono text-white leading-none">
								{statsOverall.correctPct}%
							</span>
						</div>
					</div>
					<div
						class="flex items-center gap-1 text-[11px] sm:text-xs font-extrabold tracking-tight mt-1.5"
						title="Celkovo správne / nesprávne"
					>
						<span class="text-emerald-400 font-mono">✓ {statsOverall.correct}</span>
						<span class="text-slate-500">/</span>
						<span class="text-rose-400 font-mono">✕ {statsOverall.incorrect}</span>
					</div>
				</div>
			</div>

			<h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
				{isCorrect
					? $t('play_page.correct', { defaultValue: 'Správna odpoveď', default: 'Správna odpoveď' })
					: $t('play_page.incorrect', { defaultValue: 'Nesprávna odpoveď', default: 'Nesprávna odpoveď' })}
			</h2>
		{:else}
			<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
				{$t('words.result', { default: 'Výsledok' })}
			</h2>
		{/if}

		<!-- Správna odpoveď: Farba + Tvar + Text -->
		{#if correctAnswers.length > 0}
			<div
				class="w-full mt-3 p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md flex flex-col items-center gap-2"
			>
				<span
					class="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5"
				>
					<span>💡</span>
					<span>{correctAnswers.length > 1 ? 'Správne odpovede:' : 'Správna odpoveď:'}</span>
				</span>
				<div class="w-full flex flex-col gap-2">
					{#each correctAnswers as ans}
						<div
							class="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/20 shadow-md text-white font-black text-sm sm:text-base transition-transform"
							style="background-color: {ans.color};"
						>
							{#if ans.shapeIndex !== undefined}
								<div class="w-5 h-5 flex items-center justify-center shrink-0">
									<AnswerShape shapeIndex={ans.shapeIndex} class="w-4 h-4 text-white drop-shadow-sm" />
								</div>
							{/if}
							<span class="text-center drop-shadow select-none break-words">
								{ans.text}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Profil hráča: Avatar a meno -->
		<div
			class="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-full shadow-md my-3.5"
		>
			<AnimalAvatar avatarId={parsed.avatarId} size={38} class="shadow-sm shrink-0" />
			<span class="font-extrabold text-base sm:text-lg text-white tracking-wide truncate max-w-[200px]">
				{parsed.name}
			</span>
		</div>

		<!-- Získané body za túto otázku -->
		<div
			class="w-full rounded-2xl p-4 sm:p-5 my-1.5 text-center transition-all {pointsGained > 0
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
			class="w-full bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 mt-2.5 shadow-xl ring-2 ring-amber-400/30 text-center"
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
				class="inline-flex items-center gap-2 mt-3.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs sm:text-sm font-bold shadow-inner"
			>
				<span>🎖️</span>
				<span>
					Ste na <span class="text-amber-300 font-extrabold">{playerRank}.</span> mieste z {totalPlayers}
				</span>
			</div>
		{/if}
	</div>
</div>

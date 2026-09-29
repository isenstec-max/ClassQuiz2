<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Question } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Props {
		scores: {
			[key: string]: string | number;
		};
		title: string;
		timestamp: string;
		questions?: Question[];
		answers?: any[][];
	}

	let {
		scores = {},
		title = '',
		timestamp = '',
		questions = [],
		answers = []
	}: Props = $props();

	// Zoznam hráčov zoradený podľa skóre zostupne
	let players = $derived.by(() => {
		return Object.keys(scores)
			.map((u) => {
				const parsed = parsePlayer(u);
				return {
					username: u,
					name: parsed.name,
					avatarId: parsed.avatarId,
					score: parseInt(scores[u] as any, 10) || 0
				};
			})
			.sort((a, b) => b.score - a.score);
	});

	let playerCount = $derived(players.length);

	// Štatistiky odpovedí
	let stats = $derived.by(() => {
		let total = 0;
		let correct = 0;
		let incorrect = 0;

		if (Array.isArray(answers)) {
			for (const qAnswers of answers) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						total++;
						if (a && a.right) {
							correct++;
						} else {
							incorrect++;
						}
					}
				}
			}
		}

		const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
		const totalScore = players.reduce((sum, p) => sum + p.score, 0);
		const averageScore = playerCount > 0 ? Math.round(totalScore / playerCount) : 0;
		const qCount = questions && questions.length > 0 ? questions.length : answers.length;

		return {
			total,
			correct,
			incorrect,
			accuracy,
			averageScore,
			qCount
		};
	});

	// Prehľad úspešnosti jednotlivých otázok
	let questionBreakdown = $derived.by(() => {
		if (!Array.isArray(questions) || questions.length === 0) {
			return [];
		}
		return questions.map((q, idx) => {
			const qAnswers = Array.isArray(answers) && answers[idx] ? answers[idx] : [];
			const correctCount = qAnswers.filter((a: any) => a && a.right).length;
			const totalCount = qAnswers.length;
			const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

			return {
				index: idx + 1,
				questionText: q?.question || `Otázka ${idx + 1}`,
				correct: correctCount,
				total: totalCount,
				pct
			};
		});
	});

	let hardestQuestion = $derived.by(() => {
		const list = questionBreakdown.filter((q) => q.total > 0);
		if (list.length === 0) return null;
		return [...list].sort((a, b) => a.pct - b.pct)[0];
	});

	let easiestQuestion = $derived.by(() => {
		const list = questionBreakdown.filter((q) => q.total > 0);
		if (list.length === 0) return null;
		return [...list].sort((a, b) => b.pct - a.pct)[0];
	});

	const formatScore = (val: number) => {
		return new Intl.NumberFormat('sk-SK').format(val);
	};
</script>

<div class="flex flex-col gap-6">

	<!-- 1. KĽÚČOVÉ ŠTATISTICKÉ KARTY (GRID 2x3 alebo 3x2) -->
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

		<!-- Karta 1: Účastníci -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-indigo-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Účastníci</span>
				<div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
					👥
				</div>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{playerCount}</p>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">zapojených hráčov</p>
			</div>
		</div>

		<!-- Karta 2: Úspešnosť v % -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-emerald-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Úspešnosť</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">
					%
				</div>
			</div>
			<div>
				<div class="flex items-baseline gap-1">
					<p class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.accuracy}%</p>
				</div>
				<!-- Mini Progress Bar -->
				<div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2 flex">
					<div class="bg-emerald-500 h-full transition-all duration-500" style="width: {stats.accuracy}%"></div>
					<div class="bg-rose-400 h-full transition-all duration-500" style="width: {100 - stats.accuracy}%"></div>
				</div>
			</div>
		</div>

		<!-- Karta 3: Správne odpovede -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-emerald-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Správne</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
					✅
				</div>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stats.correct}</p>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">správnych odpovedí</p>
			</div>
		</div>

		<!-- Karta 4: Nesprávne odpovede -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-rose-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chybné</span>
				<div class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
					❌
				</div>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stats.incorrect}</p>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">nesprávnych odpovedí</p>
			</div>
		</div>

		<!-- Karta 5: Priemerné skóre -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-amber-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priemer</span>
				<div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
					⭐
				</div>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{formatScore(stats.averageScore)}</p>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">bodov na hráča</p>
			</div>
		</div>

		<!-- Karta 6: Otázky -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-teal-400/50 transition-all">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Otázky</span>
				<div class="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm">
					❓
				</div>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stats.qCount}</p>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">otázok v kvíze</p>
			</div>
		</div>

	</div>

	<!-- 2. STUPNE VÍŤAZOV & KVÍZOVÉ POSTREHY (2 stĺpce) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

		<!-- ĽAVÁ ČASŤ: Stupne víťazov (Top 3 pódium) -->
		<div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col">
			<div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
				<div class="flex items-center gap-2.5">
					<div class="p-2 rounded-xl bg-amber-400/10 text-amber-500">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
						</svg>
					</div>
					<div>
						<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
							{$t('results_page.top_podium', { default: 'Stupne víťazov' })}
						</h2>
						<p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Najlepší riešitelia kvízu</p>
					</div>
				</div>
				<span class="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
					Top 3
				</span>
			</div>

			{#if players.length === 0}
				<div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
					<p class="text-4xl mb-2">🎮</p>
					<p class="font-bold">Žiadne výsledky hráčov</p>
				</div>
			{:else}
				<!-- 3 pódium karty -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-auto">
					<!-- 2. Miesto (Striebro) -->
					{#if players.length >= 2}
						{@const p2 = players[1]}
						<div class="bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs order-2 sm:order-1">
							<div class="relative -mt-2 mb-2">
								<AnimalAvatar avatarId={p2.avatarId} size={56} class="shadow-sm" />
								<div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
									2
								</div>
							</div>
							<p class="font-black text-sm text-slate-900 dark:text-white truncate w-full">{p2.name}</p>
							<p class="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 mt-1">{formatScore(p2.score)} bodov</p>
						</div>
					{/if}

					<!-- 1. Miesto (Zlato - Hlavné uprostred) -->
					{#if players.length >= 1}
						{@const p1 = players[0]}
						<div class="bg-gradient-to-b from-amber-100/70 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-slate-800 dark:to-slate-800 border-2 border-amber-400/70 dark:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center text-center shadow-md order-1 sm:order-2 ring-4 ring-amber-400/15">
							<div class="relative -mt-3 mb-2">
								<span class="absolute -top-3 left-1/2 -translate-x-1/2 text-xl filter drop-shadow">👑</span>
								<AnimalAvatar avatarId={p1.avatarId} size={68} class="shadow-md" />
								<div class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 font-black text-sm flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
									1
								</div>
							</div>
							<p class="font-black text-base text-slate-900 dark:text-white truncate w-full">{p1.name}</p>
							<p class="font-mono font-black text-sm text-amber-600 dark:text-amber-400 mt-1">{formatScore(p1.score)} bodov</p>
						</div>
					{/if}

					<!-- 3. Miesto (Bronz) -->
					{#if players.length >= 3}
						{@const p3 = players[2]}
						<div class="bg-gradient-to-b from-amber-100/40 to-orange-50/30 dark:from-amber-950/20 dark:to-slate-800/40 border border-amber-600/30 dark:border-amber-700/40 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs order-3">
							<div class="relative -mt-2 mb-2">
								<AnimalAvatar avatarId={p3.avatarId} size={56} class="shadow-sm" />
								<div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-orange-400 text-amber-950 font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
									3
								</div>
							</div>
							<p class="font-black text-sm text-slate-900 dark:text-white truncate w-full">{p3.name}</p>
							<p class="font-mono font-bold text-xs text-slate-600 dark:text-slate-300 mt-1">{formatScore(p3.score)} bodov</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- PRAVÁ ČASŤ: Kvízové postrehy (Insights pre učiteľa) -->
		<div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
			<div>
				<div class="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
					<div class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<div>
						<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Postrehy z kvízu</h2>
						<p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Analýza náročnosti otázok</p>
					</div>
				</div>

				<!-- Najťažšia otázka -->
				{#if hardestQuestion}
					<div class="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 mb-3.5">
						<div class="flex items-center justify-between gap-2 mb-1.5">
							<span class="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
								<span>⚠️</span>
								<span>{$t('results_page.hardest_question', { default: 'Najťažšia otázka' })}</span>
							</span>
							<span class="px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
								{hardestQuestion.pct}% úspešnosť
							</span>
						</div>
						<p class="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
							{@html hardestQuestion.questionText}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
							Iba {hardestQuestion.correct} z {hardestQuestion.total} odpovedí bolo správnych.
						</p>
					</div>
				{/if}

				<!-- Najľahšia otázka -->
				{#if easiestQuestion}
					<div class="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
						<div class="flex items-center justify-between gap-2 mb-1.5">
							<span class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
								<span>🌟</span>
								<span>{$t('results_page.easiest_question', { default: 'Najľahšia otázka' })}</span>
							</span>
							<span class="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
								{easiestQuestion.pct}% úspešnosť
							</span>
						</div>
						<p class="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
							{@html easiestQuestion.questionText}
						</p>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
							{easiestQuestion.correct} z {easiestQuestion.total} hráčov odpovedalo správne.
						</p>
					</div>
				{/if}
			</div>
		</div>

	</div>

	<!-- 3. PREHĽAD ÚSPEŠNOSTI VŠETKÝCH OTÁZOK -->
	{#if questionBreakdown.length > 0}
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
			<div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
				<div class="flex items-center gap-2.5">
					<div class="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
						</svg>
					</div>
					<div>
						<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
							{$t('results_page.question_breakdown', { default: 'Úspešnosť jednotlivých otázok' })}
						</h2>
						<p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Percentuálna úspešnosť každej otázky v kvíze</p>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-3">
				{#each questionBreakdown as q}
					<div class="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div class="flex items-center gap-3 flex-1 min-w-0">
							<span class="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-600 shrink-0">
								#{q.index}
							</span>
							<p class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
								{@html q.questionText}
							</p>
						</div>

						<div class="flex items-center gap-4 sm:w-64 shrink-0">
							<!-- Bar -->
							<div class="flex-1 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
								<div
									class="h-full transition-all duration-500 {q.pct >= 70 ? 'bg-emerald-500' : q.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}"
									style="width: {q.pct}%"
								></div>
							</div>
							<span class="text-xs font-black w-12 text-right {q.pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : q.pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
								{q.pct}%
							</span>
							<span class="text-xs text-slate-400 dark:text-slate-500 font-medium w-16 text-right">
								{q.correct}/{q.total}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

</div>

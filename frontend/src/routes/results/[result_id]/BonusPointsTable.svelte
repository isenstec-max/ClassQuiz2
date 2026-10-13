<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import AccuracyDonut from '$lib/components/AccuracyDonut.svelte';
	import {
		evaluateBonusPoints,
		exportBonusPointsToXls,
		copyBonusPointsToClipboard,
		type EvaluatedParticipant
	} from '$lib/helpers/bonusPoints';

	interface Props {
		final_results?: any;
		scores?: Record<string, number | string>;
		players?: any[];
		quizTitle?: string;
		resultId?: string;
	}

	let {
		final_results = null,
		scores = {},
		players = [],
		quizTitle = 'Kvíz',
		resultId = ''
	}: Props = $props();

	let searchQuery = $state('');
	let copied = $state(false);

	let evaluation = $derived.by(() => {
		return evaluateBonusPoints(final_results, scores, players);
	});

	let evaluatedParticipants = $derived(evaluation.participants);
	let pointsStats = $derived(evaluation.stats);
	let totalQuestions = $derived(evaluation.totalQuestions);

	let filteredParticipants = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return evaluatedParticipants;
		return evaluatedParticipants.filter(
			(p) =>
				p.cleanName.toLowerCase().includes(q) ||
				p.username.toLowerCase().includes(q) ||
				p.pointsLabel.toLowerCase().includes(q) ||
				p.reason.toLowerCase().includes(q)
		);
	});

	function handleExportXls() {
		exportBonusPointsToXls(evaluatedParticipants, quizTitle);
	}

	async function handleCopy() {
		const ok = await copyBonusPointsToClipboard(evaluatedParticipants);
		if (ok) {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		}
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Summary Card & Action Bar -->
	<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<span class="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-400/30">
					⭐ ZÁPOČTOVÉ BODY
				</span>
				<span class="text-xs text-slate-500 dark:text-slate-400 font-bold">2 / 1 / 0,5 / 0,25</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
				Hodnotenie a export zápočtových bodov
			</h2>
			<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
				Body priradené automaticky na základe umiestnenia a úspešnosti v kvíze.
			</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap items-center gap-2.5">
			<!-- Export XLS -->
			<button
				type="button"
				onclick={handleExportXls}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40"
				title="Stiahnuť tabuľku s 2 stĺpcami (Meno, Body) pre Excel"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				<span>Exportovať XLS</span>
				<span class="text-[10px] px-1.5 py-0.5 rounded bg-black/25 uppercase font-mono">.xls</span>
			</button>

			<!-- Copy to Clipboard -->
			<button
				type="button"
				onclick={handleCopy}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
				title="Skopírovať tabuľku do schránky (vložiť do Excelu)"
			>
				{#if copied}
					<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<span class="text-emerald-600 dark:text-emerald-400">Skopírované!</span>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
					</svg>
					<span>Kopírovať</span>
				{/if}
			</button>

			<!-- Download Full Quiz Spreadsheet if resultId provided -->
			{#if resultId}
				<a
					href="/api/v1/results/export/{resultId}"
					target="_blank"
					download=""
					class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 shadow-xs hover:scale-105 active:scale-95 transition-all"
					title="Stiahnuť kompletný hárok s odpoveďami a časmi"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<span>Kompletný kvíz (.xlsx)</span>
				</a>
			{/if}
		</div>
	</div>

	<!-- Stats Counters Row -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
				👥
			</div>
			<div>
				<div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Účastníci</div>
				<div class="text-2xl font-black text-slate-800 dark:text-white">{pointsStats.total}</div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
				🎯
			</div>
			<div>
				<div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Získali body</div>
				<div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
					{pointsStats.awarded} <span class="text-xs font-semibold text-slate-400">({pointsStats.total > 0 ? Math.round((pointsStats.awarded / pointsStats.total) * 100) : 0} %)</span>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex items-center gap-4">
			<div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-2xl shrink-0">
				⭐
			</div>
			<div>
				<div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Súčet bodov</div>
				<div class="text-2xl font-black text-amber-500">{pointsStats.sumPoints} bodov</div>
			</div>
		</div>
	</div>

	<!-- Rules Banner -->
	<div class="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
		<div class="flex items-center gap-2 font-black">
			<span>📌 Pravidlá bodovania:</span>
		</div>
		<div class="flex flex-wrap items-center gap-2.5 font-bold">
			<span class="px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-800 dark:text-yellow-200 border border-yellow-400/40">🥇 1. miesto = 2 body</span>
			<span class="px-2.5 py-1 rounded-lg bg-slate-300/30 text-slate-800 dark:text-slate-200 border border-slate-300/50">🥈 2. miesto = 1 bod</span>
			<span class="px-2.5 py-1 rounded-lg bg-amber-700/20 text-amber-800 dark:text-amber-200 border border-amber-700/40">🥉 3. miesto = 0,5 bodu</span>
			<span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40">✅ Úspešnosť ≥ 80 % = 0,25 bodu</span>
		</div>
	</div>

	<!-- Search input -->
	<div class="relative">
		<span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</span>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Hľadať účastníka podľa mena..."
			class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
		/>
	</div>

	<!-- Participants Table -->
	<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						<th class="py-4 px-6 text-center w-16">Miesto</th>
						<th class="py-4 px-6">Meno študenta</th>
						<th class="py-4 px-6 text-center">Kvízové skóre</th>
						<th class="py-4 px-6 text-center">Úspešnosť</th>
						<th class="py-4 px-6 text-center">Zápočtové body</th>
						<th class="py-4 px-6">Dôvod udelenia</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
					{#if filteredParticipants.length === 0}
						<tr>
							<td colspan="6" class="py-12 text-center text-slate-400 text-sm">
								Nenašli sa žiadni účastníci zodpovedajúci vyhľadávaniu.
							</td>
						</tr>
					{:else}
						{#each filteredParticipants as p}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
								<!-- Rank -->
								<td class="py-3.5 px-6 text-center whitespace-nowrap">
									{#if p.rank === 1}
										<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-900 font-black text-sm shadow-md shadow-amber-500/25">
											🥇 1
										</span>
									{:else if p.rank === 2}
										<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 font-black text-sm shadow-md">
											🥈 2
										</span>
									{:else if p.rank === 3}
										<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-sm shadow-md">
											🥉 3
										</span>
									{:else}
										<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-xs">
											#{p.rank}
										</span>
									{/if}
								</td>

								<!-- Student Name & Avatar -->
								<td class="py-3.5 px-6 whitespace-nowrap">
									<div class="flex items-center gap-3">
										<AnimalAvatar avatarId={p.avatarId} size={36} class="shrink-0" />
										<div class="flex flex-col">
											<span class="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
												{p.cleanName}
											</span>
											{#if p.cleanName !== p.username}
												<span class="text-[11px] text-slate-400 font-mono">
													@{p.username}
												</span>
											{/if}
										</div>
									</div>
								</td>

								<!-- Score -->
								<td class="py-3.5 px-6 text-center whitespace-nowrap">
									<span class="font-mono font-black text-sm text-slate-800 dark:text-slate-200">
										{new Intl.NumberFormat('sk-SK').format(p.score)}
									</span>
								</td>

								<!-- Accuracy -->
								<td class="py-3.5 px-6 text-center whitespace-nowrap">
									<div class="inline-flex items-center gap-2">
										<AccuracyDonut
											correct={p.correct}
											incorrect={Math.max(0, p.totalAnswered - p.correct)}
											total={p.totalAnswered}
											size={30}
											strokeWidth={3.5}
										/>
										<span class="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
											{p.pct} %
										</span>
									</div>
								</td>

								<!-- Bonus Points Badge -->
								<td class="py-3.5 px-6 text-center whitespace-nowrap">
									{#if p.points === 2}
										<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-md">
											⭐ +2 body
										</span>
									{:else if p.points === 1}
										<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-2xs">
											⭐ +1 bod
										</span>
									{:else if p.points === 0.5}
										<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-600/20 text-amber-800 dark:text-amber-200 border border-amber-600/40">
											⭐ +0,5 bodu
										</span>
									{:else if p.points === 0.25}
										<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40">
											✨ +0,25 bodu
										</span>
									{:else}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800">
											0 bodov
										</span>
									{/if}
								</td>

								<!-- Reason -->
								<td class="py-3.5 px-6 whitespace-nowrap">
									<span class="text-xs font-medium text-slate-500 dark:text-slate-400">
										{p.reason}
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

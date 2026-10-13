<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import {
		evaluateBonusPoints,
		exportBonusPointsToXls,
		copyBonusPointsToClipboard,
		type EvaluatedParticipant
	} from '$lib/helpers/bonusPoints';

	interface Props {
		open: boolean;
		final_results?: any;
		scores?: Record<string, number>;
		players?: any[];
		quizTitle?: string;
	}

	let {
		open = $bindable(false),
		final_results = null,
		scores = {},
		players = [],
		quizTitle = 'Kvíz'
	}: Props = $props();

	let searchQuery = $state('');
	let copied = $state(false);

	const close = () => {
		open = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
		}
	};

	let evaluation = $derived.by(() => {
		return evaluateBonusPoints(final_results, scores, players);
	});

	let evaluatedParticipants = $derived(evaluation.participants);
	let pointsStats = $derived(evaluation.stats);
	let totalQuestions = $derived(evaluation.totalQuestions);

	// Filtrovanie podľa vyhľadávania
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

	function exportToXls() {
		exportBonusPointsToXls(evaluatedParticipants, quizTitle);
	}

	async function copyTableToClipboard() {
		const ok = await copyBonusPointsToClipboard(evaluatedParticipants);
		if (ok) {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in pointer-events-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/40 overflow-hidden flex flex-col max-h-[92vh] transition-all transform animate-scale-up"
		>
			<!-- Horná zlatá / jantárová lišta -->
			<div
				class="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-4 sm:py-5 text-white flex items-center justify-between shadow-lg"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="relative w-11 h-11 rounded-2xl bg-amber-500/90 border-2 border-white/80 shadow-md flex items-center justify-center shrink-0"
					>
						<!-- Ikonka listu papiera -->
						<svg
							class="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<!-- Písmeno B odznak -->
						<span
							class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-white text-amber-700 font-black text-xs leading-none shadow-sm border border-amber-300"
						>
							B
						</span>
					</div>
					<div>
						<h2 class="text-xl sm:text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
							<span>Zoznam účastníkov & bodovanie</span>
							<span class="text-xs px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 border border-amber-300/40 font-bold uppercase">
								Zápočet
							</span>
						</h2>
						<p class="text-xs text-amber-100 font-medium">
							Pridelené body podľa umiestnenia a percentuálnej úspešnosti
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={close}
					class="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shrink-0"
					aria-label="Zavrieť"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Pravidlá bodovania (Prehľadné pilulky hore) -->
			<div class="px-6 py-3 bg-amber-50 dark:bg-slate-950/70 border-b border-amber-200/60 dark:border-slate-800">
				<div class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
					Pravidlá pridelenia bodov:
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
					<div class="flex items-center gap-2 p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/40">
						<span class="text-base">🥇</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">1. miesto</div>
							<div class="font-black text-amber-600 dark:text-amber-400">+2 body</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700">
						<span class="text-base">🥈</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">2. miesto</div>
							<div class="font-black text-slate-600 dark:text-slate-300">+1 bod</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-800/40">
						<span class="text-base">🥉</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">3. miesto</div>
							<div class="font-black text-orange-600 dark:text-orange-400">+0,5 bodu</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/40">
						<span class="text-base">🎯</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">Úspešnosť ≥ 80 %</div>
							<div class="font-black text-emerald-600 dark:text-emerald-400">+0,25 bodu</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Akčný panel: Vyhľadávanie + Tlačidlá na Export XLS a Kopírovanie -->
			<div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
				<!-- Vyhľadávacie pole -->
				<div class="relative flex-1 min-w-[200px]">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Hľadať účastníka podľa mena..."
						class="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
						>
							✕
						</button>
					{/if}
				</div>

				<!-- Exportovacie tlačidlá -->
				<div class="flex items-center gap-2 w-full sm:w-auto">
					<!-- Tlačidlo Exportovať do XLS (so šípkou a tabuľkou) -->
					<button
						type="button"
						onclick={exportToXls}
						class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 border border-emerald-400/50 transition cursor-pointer"
						title="Stiahnuť tabuľku vo formáte XLS (Meno a Body)"
					>
						<!-- Šípka dole / download -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Exportovať XLS</span>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-black/25 uppercase font-mono">.xls</span>
					</button>

					<!-- Rýchle kopírovanie (Meno + Body) -->
					<button
						type="button"
						onclick={copyTableToClipboard}
						class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition cursor-pointer"
						title="Kopírovať tabuľku (Meno a Body) do schránky pre vloženie do Excelu"
					>
						{#if copied}
							<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-emerald-600 dark:text-emerald-400 font-black">Skopírované!</span>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span>Kopírovať</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Zoznam účastníkov -->
			<div class="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2 text-slate-800 dark:text-slate-100 text-sm">
				<!-- Súhrnná info lišta -->
				<div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 mb-1">
					<span>
						Celkovo účastníkov: <strong class="text-slate-800 dark:text-slate-200">{pointsStats.total}</strong>
						{#if pointsStats.awarded > 0}
							&bull; S pridelenými bodmi: <strong class="text-emerald-600 dark:text-emerald-400">{pointsStats.awarded}</strong>
						{/if}
					</span>
					<span class="font-mono text-[11px]">
						Formát XLS: <span class="text-slate-700 dark:text-slate-300 font-semibold">[Meno] [Body]</span>
					</span>
				</div>

				{#if filteredParticipants.length === 0}
					<div class="py-12 text-center text-slate-400">
						<div class="text-4xl mb-2">🔍</div>
						<p class="font-semibold">Žiadny účastník nezodpovedá vyhľadávaniu.</p>
					</div>
				{:else}
					<div class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-xs">
						{#each filteredParticipants as p (p.username)}
							<div class="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
								<!-- Poradie a Účastník -->
								<div class="flex items-center gap-3 min-w-0">
									<!-- Poradie -->
									<div class="w-8 text-center shrink-0">
										{#if p.rank === 1}
											<span class="text-xl" title="1. miesto">🥇</span>
										{:else if p.rank === 2}
											<span class="text-xl" title="2. miesto">🥈</span>
										{:else if p.rank === 3}
											<span class="text-xl" title="3. miesto">🥉</span>
										{:else}
											<span class="font-mono font-bold text-xs text-slate-400">#{p.rank}</span>
										{/if}
									</div>

									<!-- Avatar -->
									<div class="shrink-0">
										<AnimalAvatar avatarId={p.avatarId} size={36} class="shadow-xs" />
									</div>

									<!-- Meno a štatistika odpovedí -->
									<div class="min-w-0">
										<div class="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base leading-tight">
											{p.cleanName}
										</div>
										<div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
											<span class="font-mono font-medium text-slate-600 dark:text-slate-300">
												{new Intl.NumberFormat('sk-SK').format(p.score)} b v kvíze
											</span>
											<span>&bull;</span>
											<span class="{p.pct >= 80 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}">
												Úspešnosť {p.pct} % ({p.correct}/{p.totalQuizQuestions})
											</span>
										</div>
									</div>
								</div>

								<!-- Pridelené body -->
								<div class="shrink-0 text-right">
									{#if p.points > 0}
										<div
											class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-xs border {p.rank === 1
												? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
												: p.rank === 2
												? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
												: p.rank === 3
												? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700'
												: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'}"
										>
											<span class="font-black text-sm sm:text-base tracking-tight">
												+{String(p.points).replace('.', ',')}
											</span>
											<span class="text-xs font-bold opacity-80">
												{p.points === 1 ? 'bod' : p.points === 2 ? 'body' : 'bodu'}
											</span>
										</div>
										<div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
											{p.reason}
										</div>
									{:else}
										<div class="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
											0 bodov
										</div>
										<div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
											&lt; 80 %
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Spodná lišta -->
			<div class="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
				<div class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
					Tabuľka obsahuje 2 stĺpce pripravené pre import do Excelu alebo zápočtových systémov.
				</div>
				<div class="flex items-center gap-2 w-full sm:w-auto justify-end">
					<button
						type="button"
						onclick={exportToXls}
						class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Exportovať XLS</span>
					</button>
					<button
						type="button"
						onclick={close}
						class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
					>
						Zavrieť
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

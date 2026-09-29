<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { PageData } from './$types';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let searchQuery = $state('');

	const parsePlayerCount = (scores: any) => {
		if (!scores) return 0;
		if (typeof scores === 'string') {
			try {
				return Object.keys(JSON.parse(scores)).length;
			} catch {
				return 0;
			}
		}
		return Object.keys(scores).length;
	};

	let totalPlayers = $derived.by(() => {
		if (!data.results) return 0;
		return data.results.reduce((acc, r) => acc + parsePlayerCount(r.player_scores), 0);
	});

	let filteredResults = $derived.by(() => {
		if (!data.results) return [];
		if (!searchQuery.trim()) return data.results;
		const q = searchQuery.toLowerCase().trim();
		return data.results.filter((r) => {
			const title = (r.title || '').toLowerCase();
			const note = (r.note || '').toLowerCase();
			return title.includes(q) || note.includes(q);
		});
	});

	const formatDate = (ts: string | number) => {
		if (!ts) return '';
		try {
			const d = new Date(ts);
			return d.toLocaleDateString('sk-SK', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return String(ts);
		}
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - Výsledky hier</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-6xl mx-auto flex flex-col gap-6">

		<!-- Top Header Card: Title, Summary Badges & Search -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
			<div class="flex items-center gap-4">
				<div class="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
					<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
						{$t('results_page.title', { default: 'História hier a výsledky' })}
					</h1>
					<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
						Prehľad všetkých odohratých kvízov, hráčov a celkových štatistík
					</p>
				</div>
			</div>

			<!-- Metrics pills -->
			<div class="flex items-center gap-2.5 self-start md:self-center">
				<div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs">
					<span class="text-sm">🎮</span>
					<div class="flex flex-col">
						<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Kvízy</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-white leading-none">{data.results.length}</span>
					</div>
				</div>

				<div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 shadow-xs">
					<span class="text-sm">👥</span>
					<div class="flex flex-col">
						<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Hráči</span>
						<span class="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 leading-none">{totalPlayers}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Search Bar -->
		{#if data.results.length > 0}
			<div class="relative w-full">
				<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Hľadať kvíz podľa názvu alebo poznámky..."
					class="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm text-sm"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
					>
						✕
					</button>
				{/if}
			</div>
		{/if}

		<!-- Main Content: Results Table / Cards -->
		{#if data.results.length === 0}
			<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
				<div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
					📊
				</div>
				<h2 class="text-xl font-bold text-slate-800 dark:text-white">{$t('results_page.no_results_so_far')}</h2>
				<p class="text-sm text-slate-500 dark:text-slate-400 max-w-md">
					Po odohraní prvého kvízu so žiakmi alebo kolegami sa tu zobrazia podrobné výsledky a štatistiky.
				</p>
				<a
					href="/dashboard"
					class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition hover:scale-105 active:scale-95"
				>
					<span>{$t('words.dashboard')}</span>
					<span>→</span>
				</a>
			</div>
		{:else if filteredResults.length === 0}
			<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
				<span class="text-3xl">🔍</span>
				<h2 class="text-lg font-bold text-slate-800 dark:text-white">Nenašli sa žiadne zhody</h2>
				<p class="text-xs text-slate-400">Skúste zadať iné kľúčové slovo alebo vyčistite vyhľadávanie.</p>
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					class="mt-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
				>
					Zrušiť filter
				</button>
			</div>
		{:else}
			<!-- Desktop & Tablet Table -->
			<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
								<th class="py-4 px-6">{$t('results_page.quiz_title')}</th>
								<th class="py-4 px-6">{$t('results_page.date_played')}</th>
								<th class="py-4 px-6 text-center">{$t('results_page.player_count')}</th>
								<th class="py-4 px-6">{$t('words.note')}</th>
								<th class="py-4 px-6 text-right">Akcia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
							{#each filteredResults as result}
								{@const count = parsePlayerCount(result.player_scores)}
								<tr class="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors group">
									<!-- Quiz Title -->
									<td class="py-4 px-6">
										<a
											href="/results/{result.id}"
											class="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2"
										>
											<span class="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
											<span>{@html result.title}</span>
										</a>
									</td>

									<!-- Date Played -->
									<td class="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">
										<div class="flex items-center gap-1.5 text-xs font-medium">
											<svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<span>{formatDate(result.timestamp)}</span>
										</div>
									</td>

									<!-- Player Count Badge -->
									<td class="py-4 px-6 text-center whitespace-nowrap">
										<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
											<span>👥</span>
											<span>{count}</span>
										</span>
									</td>

									<!-- Note -->
									<td class="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
										{#if result.note}
											<span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
												{result.note}
											</span>
										{:else}
											<span class="italic text-slate-300 dark:text-slate-600">—</span>
										{/if}
									</td>

									<!-- Action Link -->
									<td class="py-4 px-6 text-right whitespace-nowrap">
										<a
											href="/results/{result.id}"
											class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 text-slate-700 dark:text-slate-200 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
										>
											<span>Zobraziť</span>
											<span class="transition-transform group-hover:translate-x-0.5">→</span>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

	</div>
</div>

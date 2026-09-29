<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { getLocalization } from '$lib/i18n';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Props {
		scores: {
			[key: string]: string | number;
		};
		custom_field?: {
			[key: string]: string;
		};
		answers?: { [key: string]: any }[][];
	}

	let { scores = {}, custom_field = {}, answers = [] }: Props = $props();

	let searchQuery = $state('');

	// Výpočet správnych odpovedí a času pre každého hráča
	let playerStats = $derived.by(() => {
		const correctMap: Record<string, number> = {};
		const totalMap: Record<string, number> = {};
		const totalTimeMap: Record<string, number> = {};
		const timeCountMap: Record<string, number> = {};

		if (Array.isArray(answers)) {
			for (const qAnswers of answers) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						if (!a || !a.username) continue;
						const user = a.username;
						if (!correctMap[user]) correctMap[user] = 0;
						if (!totalMap[user]) totalMap[user] = 0;
						if (!totalTimeMap[user]) totalTimeMap[user] = 0;
						if (!timeCountMap[user]) timeCountMap[user] = 0;

						totalMap[user]++;
						if (a.right) {
							correctMap[user]++;
						}
						if (a.time_taken !== undefined && a.time_taken !== null && !isNaN(Number(a.time_taken))) {
							totalTimeMap[user] += Math.max(0, Number(a.time_taken));
							timeCountMap[user]++;
						}
					}
				}
			}
		}

		const totalQuestions = answers.length;

		return Object.keys(scores)
			.map((uname) => {
				const parsed = parsePlayer(uname);
				const score = parseInt(scores[uname] as any, 10) || 0;
				const correct = correctMap[uname] || 0;
				const answered = totalMap[uname] || 0;
				const total = totalQuestions > 0 ? totalQuestions : answered;
				const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
				const countWithTime = timeCountMap[uname] || 0;
				const avgTimeMs = countWithTime > 0 ? totalTimeMap[uname] / countWithTime : null;
				const avgTimeSec = avgTimeMs !== null ? (avgTimeMs / 1000).toFixed(2) : null;
				const totalTimeSec = countWithTime > 0 ? (totalTimeMap[uname] / 1000).toFixed(2) : null;

				return {
					username: uname,
					name: parsed.name,
					avatarId: parsed.avatarId,
					score,
					correct,
					total,
					pct,
					avgTimeSec,
					totalTimeSec,
					customField: custom_field[uname] || ''
				};
			})
			.sort((a, b) => b.score - a.score)
			.map((p, idx) => ({ ...p, rank: idx + 1 }));
	});

	let filteredPlayers = $derived.by(() => {
		if (!searchQuery.trim()) return playerStats;
		const q = searchQuery.toLowerCase().trim();
		return playerStats.filter((p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
	});

	const hasCustomFields = $derived(Object.keys(custom_field).length > 0);

	const formatScore = (val: number) => {
		return new Intl.NumberFormat('sk-SK').format(val);
	};
</script>

<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">

	<!-- Header tabuľky & vyhľadávanie -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
		<div class="flex items-center gap-2.5">
			<div class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
					{$t('words.player', { count: 2, default: 'Výsledky hráčov' })}
				</h2>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Rebríček, presnosť odpovedí a reakčné časy všetkých účastníkov</p>
			</div>
		</div>

		<!-- Hľadanie -->
		<div class="relative w-full sm:w-64">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={$t('results_page.search_players', { default: 'Hľadať hráča...' })}
				class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
			/>
			<svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- Tabuľka hráčov -->
	{#if filteredPlayers.length === 0}
		<div class="py-12 flex flex-col items-center justify-center text-center text-slate-400">
			<p class="text-3xl mb-2">🔍</p>
			<p class="font-bold">Nenašli sa žiadni hráči</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left border-separate border-spacing-y-2">
				<thead>
					<tr class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
						<th class="px-4 py-2 w-16">Poradie</th>
						<th class="px-4 py-2">Hráč</th>
						<th class="px-4 py-2 w-44">Správne odpovede</th>
						<th class="px-4 py-2 text-right w-36">Priemerný čas</th>
						<th class="px-4 py-2 text-right w-32">Body</th>
						{#if hasCustomFields}
							<th class="px-4 py-2 w-40">{$t('result_page.custom_field', { default: 'Vlastné pole' })}</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each filteredPlayers as p}
						<tr class="bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all rounded-2xl group">
							<!-- Poradie -->
							<td class="px-4 py-3 rounded-l-2xl">
								{#if p.rank === 1}
									<span class="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center border border-amber-400/40 shadow-xs">
										🥇 1
									</span>
								{:else if p.rank === 2}
									<span class="w-8 h-8 rounded-xl bg-slate-300/30 text-slate-600 dark:text-slate-300 font-black text-sm flex items-center justify-center border border-slate-400/30 shadow-xs">
										🥈 2
									</span>
								{:else if p.rank === 3}
									<span class="w-8 h-8 rounded-xl bg-orange-400/20 text-orange-600 dark:text-orange-400 font-black text-sm flex items-center justify-center border border-orange-400/30 shadow-xs">
										🥉 3
									</span>
								{:else}
									<span class="w-8 h-8 rounded-xl bg-white dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
										#{p.rank}
									</span>
								{/if}
							</td>

							<!-- Hráč (Avatar + Meno) -->
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<AnimalAvatar avatarId={p.avatarId} size={36} class="shrink-0 drop-shadow-xs" />
									<span class="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
										{p.name}
									</span>
								</div>
							</td>

							<!-- Úspešnosť / Správne odpovede -->
							<td class="px-4 py-3">
								<div class="flex flex-col gap-1">
									<div class="flex items-center justify-between text-xs font-bold">
										<span class="text-slate-700 dark:text-slate-300">{p.correct} z {p.total}</span>
										<span class="{p.pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : p.pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
											{p.pct}%
										</span>
									</div>
									<div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
										<div
											class="h-full transition-all duration-300 {p.pct >= 70 ? 'bg-emerald-500' : p.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}"
											style="width: {p.pct}%"
										></div>
									</div>
								</div>
							</td>

							<!-- Čas odpovede (Priemerný čas na otázku s dvoma desatinnými miestami) -->
							<td class="px-4 py-3 text-right">
								{#if p.avgTimeSec !== null}
									<div class="flex flex-col items-end">
										<span class="inline-flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
											<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span>{p.avgTimeSec}s</span>
										</span>
										{#if p.totalTimeSec !== null}
											<span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
												spolu {p.totalTimeSec}s
											</span>
										{/if}
									</div>
								{:else}
									<span class="text-xs text-slate-400 font-mono">—</span>
								{/if}
							</td>

							<!-- Skóre (Body) -->
							<td class="px-4 py-3 text-right">
								<span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
									<span>⭐</span>
									<span>{formatScore(p.score)}</span>
								</span>
							</td>

							<!-- Vlastné pole -->
							{#if hasCustomFields}
								<td class="px-4 py-3 rounded-r-2xl text-xs font-medium text-slate-500 dark:text-slate-400">
									{p.customField || '—'}
								</td>
							{:else}
								<td class="rounded-r-2xl"></td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

</div>

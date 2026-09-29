<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { PageData } from './$types';
	import { getLocalization } from '$lib/i18n';
	import { DateTime } from 'luxon';

	const { t } = getLocalization();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const controllers = data.controllers || [];

	const formatDate = (dateStr?: string | null): string => {
		if (!dateStr) return $t('words.never');
		const dt = DateTime.fromISO(dateStr);
		return dt.isValid ? dt.toLocaleString(DateTime.DATETIME_MED) : dateStr;
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - Ovládače</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-6xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<a
					href="/account/settings"
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-3"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Späť do nastavení účtu
				</a>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
					</svg>
					ClassQuiz2Controller
				</div>
				<h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
					Fyzické ovládače (Buzzer)
				</h1>
				<p class="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
					Správa hardvérových herných ovládačov a bezdrôtových tlačidiel pre kvízy v triede.
				</p>
			</div>

			<div>
				<a
					href="/account/controllers/add"
					class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					<span>{$t('controllers.add_new_controller')}</span>
				</a>
			</div>
		</div>

		{#if controllers.length === 0}
			<!-- Empty State -->
			<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
				<div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
					<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white">
						Zatiaľ nemáte pripojený žiadny ovládač
					</h3>
					<p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
						Pripojte si vlastný ClassQuiz2Controller box pomocou Wi-Fi a umožnite žiakom odpovedať stlačením fyzického tlačidla.
					</p>
				</div>
				<div class="pt-2">
					<a
						href="/account/controllers/add"
						class="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						<span>{$t('controllers.add_new_controller')}</span>
					</a>
				</div>
			</div>
		{:else}
			<!-- Table -->
			<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
								<th class="py-4 px-6">{$t('words.name')}</th>
								<th class="py-4 px-6">{$t('controllers.player_name')}</th>
								<th class="py-4 px-6">{$t('controllers.first_seen')}</th>
								<th class="py-4 px-6">{$t('controllers.last_seen')}</th>
								<th class="py-4 px-6">{$t('words.version')}</th>
								<th class="py-4 px-6 text-right">Detail</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
							{#each controllers as controller}
								<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
									<!-- Name -->
									<td class="py-4 px-6">
										<a
											href="/account/controllers/{controller.id}"
											class="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2.5"
										>
											<div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
												</svg>
											</div>
											<span>{controller.name}</span>
										</a>
									</td>

									<!-- Player Name -->
									<td class="py-4 px-6 text-slate-700 dark:text-slate-300">
										<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-xs">
											{controller.player_name}
										</span>
									</td>

									<!-- First Seen -->
									<td class="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs sm:text-sm whitespace-nowrap">
										{formatDate(controller.first_seen)}
									</td>

									<!-- Last Seen -->
									<td class="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs sm:text-sm whitespace-nowrap">
										{formatDate(controller.last_seen)}
									</td>

									<!-- OS Version -->
									<td class="py-4 px-6 whitespace-nowrap">
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
											{controller.os_version ?? $t('words.unknown')}
										</span>
									</td>

									<!-- Action -->
									<td class="py-4 px-6 text-right whitespace-nowrap">
										<a
											href="/account/controllers/{controller.id}"
											class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200/80 dark:border-emerald-800/80"
										>
											<span>Upraviť</span>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
											</svg>
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

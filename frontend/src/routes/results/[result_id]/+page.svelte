<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { PageData } from './$types';
	import PlayerOverview from './player_overview.svelte';
	import QuestionOverview from './question_overview.svelte';
	import GeneralOverview from './general_overview.svelte';
	import { fade } from 'svelte/transition';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	enum SelectedTab {
		Overview = 'overview',
		Players = 'players',
		Questions = 'questions'
	}

	let selected_tab: SelectedTab = $state(SelectedTab.Overview);

	// Bezpečné spracovanie JSON údajov
	const parseJSON = (d: any) => {
		if (typeof d === 'string') {
			try {
				return JSON.parse(d);
			} catch {
				return d;
			}
		}
		return d;
	};

	let results = $derived(data.results || {});
	let parsedScores = $derived(parseJSON(results.player_scores) || {});
	let parsedAnswers = $derived(parseJSON(results.answers) || []);
	let parsedQuestions = $derived(parseJSON(results.questions) || []);
	let parsedCustomFields = $derived(parseJSON(results.custom_field_data) || {});

	let playerCount = $derived(Object.keys(parsedScores).length);
	let questionCount = $derived(parsedQuestions.length || parsedAnswers.length || 0);

	let formattedDate = $derived.by(() => {
		if (!results.timestamp) return '';
		try {
			return new Date(results.timestamp).toLocaleDateString('sk-SK', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return results.timestamp;
		}
	});
</script>

<svelte:head>
	<title>ClassQuiz2 - {results.title || 'Výsledky kvízu'}</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20 px-3 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-6xl mx-auto flex flex-col gap-6">

		<!-- Top Header: Návrat späť + Názov kvízu -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm">
			<div class="flex flex-col gap-2">
				<a
					href="/results"
					class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors w-fit"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>{$t('results_page.back_to_results', { default: 'Všetky výsledky' })}</span>
				</a>
				<div class="flex items-center gap-3">
					<div class="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<div>
						<h1 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
							{@html results.title || 'Výsledky kvízu'}
						</h1>
						{#if formattedDate}
							<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
								{formattedDate}
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Rýchle počty -->
			<div class="flex items-center gap-2 self-start sm:self-center">
				<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
					<span>👥</span>
					<span>{playerCount} {playerCount === 1 ? 'hráč' : playerCount >= 2 && playerCount <= 4 ? 'hráči' : 'hráčov'}</span>
				</span>
				<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-2xs">
					<span>❓</span>
					<span>{questionCount} {questionCount === 1 ? 'otázka' : questionCount >= 2 && questionCount <= 4 ? 'otázky' : 'otázok'}</span>
				</span>
			</div>
		</div>

		<!-- Segmented Tab Control (Modern Pill Switcher) -->
		<div class="flex items-center justify-center p-1.5 bg-slate-200/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl max-w-lg mx-auto shadow-inner border border-slate-300/60 dark:border-slate-800 w-full">
			<!-- Tab 1: Prehľad -->
			<button
				onclick={() => (selected_tab = SelectedTab.Overview)}
				class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer {selected_tab === SelectedTab.Overview ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
			>
				<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
				<span>{$t('words.overview', { default: 'Prehľad' })}</span>
			</button>

			<!-- Tab 2: Hráči -->
			<button
				onclick={() => (selected_tab = SelectedTab.Players)}
				class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer {selected_tab === SelectedTab.Players ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
			>
				<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<span>{$t('words.player', { count: 2, default: 'Hráči' })}</span>
				<span class="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
					{playerCount}
				</span>
			</button>

			<!-- Tab 3: Otázky -->
			<button
				onclick={() => (selected_tab = SelectedTab.Questions)}
				class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer {selected_tab === SelectedTab.Questions ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
			>
				<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{$t('words.question', { count: 2, default: 'Otázky' })}</span>
				<span class="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
					{questionCount}
				</span>
			</button>
		</div>

		<!-- Tab Content Panels -->
		{#if selected_tab === SelectedTab.Overview}
			<div in:fade|global={{ duration: 150 }}>
				<GeneralOverview
					scores={parsedScores}
					title={results.title}
					timestamp={results.timestamp}
					questions={parsedQuestions}
					answers={parsedAnswers}
				/>
			</div>
		{:else if selected_tab === SelectedTab.Players}
			<div in:fade|global={{ duration: 150 }}>
				<PlayerOverview
					custom_field={parsedCustomFields}
					scores={parsedScores}
					answers={parsedAnswers}
				/>
			</div>
		{:else if selected_tab === SelectedTab.Questions}
			<div in:fade|global={{ duration: 150 }}>
				<QuestionOverview
					questions={parsedQuestions}
					answers={parsedAnswers}
				/>
			</div>
		{/if}

	</div>
</div>

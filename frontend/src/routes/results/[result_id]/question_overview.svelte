<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Question } from '$lib/quiz_types';
	import { slide } from 'svelte/transition';
	import QuestionTab from './question_tab_dropdown.svelte';
	import { QuizQuestionType } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface Props {
		questions?: Question[];
		answers?: {
			username: string;
			answer: string;
			right: boolean;
			time_taken: number;
			score: number;
		}[][];
	}

	let { questions = [], answers = [] }: Props = $props();

	let question_open: number | null = $state(null);

	const toggle_dropdown = (q_index: number) => {
		question_open = question_open === q_index ? null : q_index;
	};

	const get_average_score = (q_index: number): number => {
		const q_answers = answers[q_index];
		if (!q_answers || q_answers.length === 0) return 0;
		let summed = 0;
		for (const a of q_answers) {
			summed += a.score || 0;
		}
		return Math.round(summed / q_answers.length);
	};

	const get_accuracy = (q_index: number): { correct: number; total: number; pct: number } => {
		const q_answers = answers[q_index];
		if (!q_answers || q_answers.length === 0) return { correct: 0, total: 0, pct: 0 };
		let correct = 0;
		for (const a of q_answers) {
			if (a && a.right) correct++;
		}
		const pct = Math.round((correct / q_answers.length) * 100);
		return { correct, total: q_answers.length, pct };
	};

	const get_type_label = (type: any): string => {
		switch (type) {
			case QuizQuestionType.ABCD:
			case 'ABCD':
				return 'Výber z možností';
			case QuizQuestionType.CHECK:
			case 'CHECK':
				return 'Viacero správnych';
			case QuizQuestionType.TRUE_FALSE:
			case 'TRUE_FALSE':
				return 'Pravda / Nepravda';
			case QuizQuestionType.TEXT:
			case 'TEXT':
				return 'Voľná odpoveď';
			case QuizQuestionType.RANGE:
			case 'RANGE':
				return 'Číselný rozsah';
			case QuizQuestionType.ORDER:
			case 'ORDER':
				return 'Zoradenie';
			case QuizQuestionType.VOTING:
			case 'VOTING':
				return 'Hlasovanie';
			default:
				return 'Otázka';
		}
	};
</script>

<div class="flex flex-col gap-4">

	<!-- Header -->
	<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
		<div class="flex items-center gap-2.5">
			<div class="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<div>
				<h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
					{$t('words.question', { count: 2, default: 'Prehľad otázok' })}
				</h2>
				<p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Kliknutím na otázku zobrazíte detailné rozdelenie odpovedí</p>
			</div>
		</div>

		<span class="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
			{questions.length} otázok
		</span>
	</div>

	<!-- Zoznam otázok ako moderné akordeón karty -->
	{#if questions.length === 0}
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
			<p class="text-3xl mb-2">❓</p>
			<p class="font-bold">Žiadne otázky v kvíze</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each questions as question, i}
				{@const acc = get_accuracy(i)}
				{@const avg = get_average_score(i)}
				{@const isOpen = question_open === i}

				<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">

					<!-- Hlavička karty otázky -->
					<div
						role="button"
						tabindex="0"
						class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
						onclick={() => toggle_dropdown(i)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggle_dropdown(i);
							}
						}}
					>
						<!-- Ľavá časť: Číslo otázky, typ a text -->
						<div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
							<span class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
								#{i + 1}
							</span>

							<div class="flex flex-col gap-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tracking-wider">
										{get_type_label(question.type)}
									</span>
								</div>
								<h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
									{@html question.question}
								</h3>
							</div>
						</div>

						<!-- Pravá časť: Štatistiky & Chevron -->
						<div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
							{#if question.type !== QuizQuestionType.VOTING}
								<!-- Úspešnosť -->
								<div class="flex items-center gap-2">
									<span class="px-2.5 py-1 rounded-xl text-xs font-black border {acc.pct >= 70 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800' : acc.pct >= 40 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-800'}">
										{acc.pct}% úspešnosť
									</span>
									<span class="text-xs text-slate-400 font-medium hidden md:inline">
										({acc.correct}/{acc.total})
									</span>
								</div>

								<!-- Priemerné skóre -->
								<span class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
									⭐ {avg} b.
								</span>
							{/if}

							<!-- Rozbaľovací chevron -->
							<div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-transform duration-200 {isOpen ? 'rotate-180 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : ''}">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Rozbalený obsah -->
					{#if isOpen}
						<div transition:slide={{ duration: 200 }}>
							<QuestionTab {question} answers={answers[i] || []} />
						</div>
					{/if}

				</div>
			{/each}
		</div>
	{/if}

</div>

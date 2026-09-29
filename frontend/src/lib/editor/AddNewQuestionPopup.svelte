<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Answers, Question } from '$lib/quiz_types';
	import { QuizQuestionType } from '$lib/quiz_types';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getLocalization } from '$lib/i18n';


	interface Props {
		questions: Question[];
		open: boolean;
		selected_question: number;
	}

	let { questions = $bindable(), open = $bindable(), selected_question = $bindable() }: Props = $props();

	const { t } = getLocalization();
	onMount(() => {
		document.body.addEventListener('keydown', close_start_game_if_esc_is_pressed);
	});
	const close_start_game_if_esc_is_pressed = (key: KeyboardEvent) => {
		if (key.code === 'Escape') {
			open = false;
		}
	};
	const on_parent_click = (e: Event) => {
		if (e.target === e.currentTarget) {
			open = false;
		}
	};

	const question_types: {
		name: string;
		description: string;
		answers: Answers;
		type: QuizQuestionType;
	}[] = [
		{
			name: $t('words.multiple_choice'),
			description: $t('editor.abcd_description'),
			answers: [],
			type: QuizQuestionType.ABCD
		},
		{
			name: $t('words.voting'),
			description: $t('editor.voting_description'),
			answers: [],
			type: QuizQuestionType.VOTING
		},
		{
			name: $t('words.check_choice'),
			description: $t('editor.check_choice_description'),
			answers: [],
			type: QuizQuestionType.CHECK
		},
		{
			name: $t('words.order'),
			description: $t('editor.order_description'),
			answers: [],
			type: QuizQuestionType.ORDER
		},
		{
			name: $t('words.text'),
			description: $t('editor.text_description'),
			answers: [],
			type: QuizQuestionType.TEXT
		},
		{
			name: $t('words.range'),
			description: $t('editor.range_description'),
			answers: {
				max: 10,
				min: 0,
				max_correct: 7,
				min_correct: 3
			},
			type: QuizQuestionType.RANGE
		}
	];

	const add_question = (index: number) => {
		const empty_question: Question = {
			type: question_types[index].type,
			time: '20',
			question: '',
			image: undefined,
			answers: question_types[index].answers
		};
		questions = [...questions, { ...empty_question }];
		selected_question = questions.length - 1;
		open = false;
	};
</script>

<div
	class="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4"
	onclick={on_parent_click}
	transition:fade={{ duration: 100 }}
>
	<div
		class="w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col overflow-hidden"
	>
		<!-- Header -->
		<div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
					+
				</div>
				<div>
					<h2 class="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white">
						{$t('quiztivity.editor.select_page_type')}
					</h2>
					<p class="text-xs text-slate-500 dark:text-slate-400">
						Vyberte typ otázky pre váš kvíz
					</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => (open = false)}
				class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
			>
				✕
			</button>
		</div>

		<!-- Grid of Question Types -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1 py-1">
			{#each question_types as qt, i}
				<button
					type="button"
					class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 hover:border-emerald-500/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-left flex flex-col justify-between group cursor-pointer"
					onclick={() => add_question(i)}
				>
					<div>
						<div class="flex items-center justify-between mb-2">
							<span class="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
								{qt.name}
							</span>
							<span class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center text-xs font-bold transition-all">
								→
							</span>
						</div>
						<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
							{qt.description}
						</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- Footer -->
		<div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
			<div>
				{$t('editor.need_more_help')}
				<a
					href="/docs/quiz/question-types"
					target="_blank"
					class="font-bold underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
				>
					{$t('editor.visit_docs')}
				</a>
			</div>
			<button
				type="button"
				onclick={() => (open = false)}
				class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
			>
				{$t('words.cancel')}
			</button>
		</div>
	</div>
</div>

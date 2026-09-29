<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { run, preventDefault } from 'svelte/legacy';

	import type { Answer, EditorData } from '../quiz_types';
	import { QuizQuestionType } from '../quiz_types';
	import { fade } from 'svelte/transition';
	import { reach } from 'yup';
	import { ABCDQuestionSchema } from '$lib/yupSchemas';
	import { getLocalization } from '$lib/i18n';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const { t } = getLocalization();

	const default_colors = DEFAULT_ANSWER_COLORS;

	interface Props {
		selected_question: number;
		check_choice?: boolean;
		data: EditorData;
	}

	let { selected_question, check_choice = false, data = $bindable() }: Props = $props();
	if (!Array.isArray(data.questions[selected_question].answers)) {
		data.questions[selected_question].answers = [];
	}
	const save_colors = (data_local: EditorData) => {
		if (selected_question === 0) {
			for (let i = 0; i < data_local.questions[selected_question].answers.length; i++) {
				localStorage.setItem(
					`quiz_color:${i}:${data_local.title}`,
					data_local.questions[selected_question].answers[i].color
				);
			}
		}
	};

	const get_empty_answer = (i: number): Answer => {
		return {
			answer: '',
			color: default_colors[i % default_colors.length],
			right: false
		};
	};
	run(() => {
		save_colors(data);
	});
	data.questions[selected_question].type =
		check_choice === true ? QuizQuestionType.CHECK : QuizQuestionType.ABCD;
	const set_colors_if_unset = () => {
		for (let i = 0; i < data.questions[selected_question].answers.length; i++) {
			if (!data.questions[selected_question].answers[i].color) {
				data.questions[selected_question].answers[i].color = default_colors[i % default_colors.length];
			}
		}
	};
	run(() => {
		set_colors_if_unset();
		data;
		selected_question;
	});
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full px-4 md:px-10">
	{#if Array.isArray(data.questions[selected_question].answers)}
		{#each data.questions[selected_question].answers as answer, index}
			<div
				out:fade={{ duration: 150 }}
				class="group rounded-lg shadow-lg flex items-center px-4 py-3 min-h-[72px] w-full transition-all relative border border-black/10 hover:shadow-xl"
				style="background-color: {answer.color ?? default_colors[index % default_colors.length]};"
				class:ring-2={!reach(ABCDQuestionSchema, 'answer').isValidSync(answer.answer)}
				class:ring-yellow-400={!reach(ABCDQuestionSchema, 'answer').isValidSync(answer.answer)}
			>
				<!-- Geometrický útvar na boku (trojuholník, kosoštvorec, krúžok, štvorec) -->
				<div class="shrink-0 flex items-center justify-center mr-3">
					<AnswerShape shapeIndex={index} class="w-8 h-8 text-white drop-shadow-md" />
				</div>

				<!-- Text odpovede (biely, čitateľný, výrazný) -->
				<input
					bind:value={answer.answer}
					type="text"
					class="flex-1 bg-transparent text-white placeholder-white/60 font-semibold text-lg md:text-xl outline-hidden border-b-2 border-transparent focus:border-white/40 transition-all text-left px-2"
					placeholder={$t('editor.enter_answer')}
				/>

				<!-- Tlačidlo správnej odpovede na pravej strane (krúžok / zelená fajka) -->
				<button
					type="button"
					class="shrink-0 ml-2 focus:outline-none transition-transform active:scale-90"
					aria-label="Toggle correct answer"
					onclick={() => {
						answer.right = !answer.right;
					}}
				>
					{#if answer.right}
						<div class="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{:else}
						<div class="w-9 h-9 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 transition shadow-sm"></div>
					{/if}
				</button>

				<!-- Tlačidlo zmazania odpovede -->
				<button
					class="rounded-full absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow hover:scale-110"
					type="button"
					aria-label="Delete answer"
					onclick={() => {
						data.questions[selected_question].answers.splice(index, 1);
						data.questions[selected_question].answers =
							data.questions[selected_question].answers;
					}}
				>
					✕
				</button>

				<!-- Diskrétny výber farby -->
				<input
					class="absolute bottom-1 right-2 w-3.5 h-3.5 rounded cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition border-0 bg-transparent"
					type="color"
					title="Farba odpovede"
					bind:value={answer.color}
					oncontextmenu={preventDefault(() => {
						answer.color = default_colors[index % default_colors.length];
					})}
				/>
			</div>
		{/each}
	{/if}
	{#if data.questions[selected_question].answers.length < 4}
		<button
			class="min-h-[72px] p-4 rounded-lg bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200"
			type="button"
			in:fade={{ duration: 150 }}
			onclick={() => {
				data.questions[selected_question].answers = [
					...data.questions[selected_question].answers,
					{ ...get_empty_answer(data.questions[selected_question].answers.length) }
				];
			}}
		>
			<span class="text-2xl font-bold">+</span>
			<span class="font-medium text-lg">{$t('editor_page.add_an_answer')}</span>
		</button>
	{/if}
</div>

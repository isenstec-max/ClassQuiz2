<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Question } from '$lib/quiz_types';
	import { get_foreground_color } from '$lib/helpers';
	import CircularTimer from '$lib/play/circular_progress.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const default_colors = DEFAULT_ANSWER_COLORS;

	interface Props {
		question: Question;
		selected_answer?: string;
		game_mode: any;
		timer_res: any;
		circular_progress: any;
	}

	let {
		question,
		selected_answer = $bindable(),
		game_mode,
		timer_res,
		circular_progress
	}: Props = $props();
	let _selected_answers = $state([false, false, false, false]);

	const selectAnswer = (i: number) => {
		_selected_answers[i] = !_selected_answers[i];
		selected_answer = '';
		for (let i = 0; i < _selected_answers.length; i++) {
			if (_selected_answers[i]) {
				selected_answer += String(i);
			}
		}
		selected_answer = selected_answer;
		console.log(_selected_answers, selected_answer);
	};
</script>

<div class="w-full h-[95%]">
	<div
		class="absolute top-0 bottom-0 left-0 right-0 m-auto rounded-full h-fit w-fit border-2 border-black shadow-2xl z-40"
	>
		<CircularTimer text={timer_res} progress={circular_progress} color="#ef4444" />
	</div>

	<div class="grid grid-cols-2 gap-3 w-full p-4 h-full">
		{#each question.answers as answer, i}
			<button
				class="rounded-2xl h-full flex items-center justify-center disabled:opacity-60 p-4 border-2 border-white/20 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative"
				style="background-color: {answer.color ??
					default_colors[i % default_colors.length]}; color: {get_foreground_color(
					answer.color ?? default_colors[i % default_colors.length]
				)}"
				onclick={() => selectAnswer(i)}
				class:ring-4={_selected_answers[i]}
				class:ring-white={_selected_answers[i]}
				class:opacity-100={_selected_answers[i]}
				class:opacity-70={!_selected_answers[i]}
			>
				{#if game_mode === 'kahoot'}
					<AnswerShape shapeIndex={i} class="w-16 h-16 md:w-24 md:h-24 text-white drop-shadow-lg" />
				{:else}
					<div class="flex items-center gap-3 w-full px-2">
						<AnswerShape shapeIndex={i} class="w-8 h-8 md:w-10 md:h-10 text-white shrink-0 drop-shadow-md" />
						<p class="m-auto font-semibold text-lg md:text-2xl text-white break-words">{answer.answer}</p>
					</div>
				{/if}
				{#if _selected_answers[i]}
					<div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

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

	const getAnswerTextClass = (text: string) => {
		const len = text ? text.trim().length : 0;
		if (len > 50) return 'text-[11px] sm:text-xs md:text-sm leading-tight';
		if (len > 25) return 'text-xs sm:text-sm md:text-base leading-snug';
		if (len > 12) return 'text-sm sm:text-base md:text-xl leading-snug';
		return 'text-base sm:text-xl md:text-2xl leading-normal';
	};

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

	<div class="grid grid-cols-2 gap-3 w-full p-3 sm:p-4 h-full">
		{#each question.answers as answer, i}
			<button
				class="rounded-2xl h-full flex items-center justify-center disabled:opacity-60 p-2 sm:p-4 border-2 border-white/20 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
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
					<div class="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 p-1 sm:p-1.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10 flex items-center justify-center pointer-events-none z-10 shadow-sm">
						<AnswerShape shapeIndex={i} class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white drop-shadow-sm" />
					</div>
					<div class="w-full h-full flex items-center justify-center px-2 py-6 sm:px-4 sm:py-7 overflow-hidden">
						<p
							class="font-black text-white text-center drop-shadow-md select-none max-w-full {getAnswerTextClass(answer.answer)}"
							style="overflow-wrap: anywhere; word-break: break-word;"
						>
							{answer.answer}
						</p>
					</div>
				{/if}
				{#if _selected_answers[i]}
					<div class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md z-10">
						<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

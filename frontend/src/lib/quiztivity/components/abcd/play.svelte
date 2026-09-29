<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Abcd } from '$lib/quiztivity/types';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const default_colors = DEFAULT_ANSWER_COLORS;

	interface Props {
		data: Abcd | undefined;
	}

	let { data }: Props = $props();

	let selected_answer: number | undefined = $state();

	const select_answer = (i: number) => {
		selected_answer = i;
		console.log(data);
	};
</script>

<div>
	<h1 class="text-center text-4xl">{data.question}</h1>

	<div class="grid grid-cols-1 lg:grid-cols-2 m-4 gap-4">
		{#each data.answers as answer, i}
			<button
				class="rounded-xl p-5 flex items-center shadow-lg transition-all border border-black/10 cursor-pointer"
				style="background-color: {default_colors[i % default_colors.length]};"
				onclick={() => {
					select_answer(i);
				}}
				class:opacity-50={selected_answer !== undefined && !answer.correct}
				class:scale-105={selected_answer === i}
			>
				<div class="shrink-0 flex items-center justify-center mr-3">
					<AnswerShape shapeIndex={i} class="w-8 h-8 text-white drop-shadow-md" />
				</div>
				<span class="m-auto font-bold text-2xl text-white break-words">{answer.answer}</span>
			</button>
		{/each}
	</div>
</div>

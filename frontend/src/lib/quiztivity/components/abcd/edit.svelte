<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Abcd } from '$lib/quiztivity/types';
	import { getLocalization } from '$lib/i18n';
	import BrownButton from '$lib/components/buttons/brown.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const default_colors = DEFAULT_ANSWER_COLORS;

	interface Props {
		data: Abcd | undefined;
	}

	let { data = $bindable() }: Props = $props();

	if (!data) {
		data = {
			question: '',
			answers: []
		};
	}

	const { t } = getLocalization();
</script>

<div>
	<div class="flex justify-center">
		<input
			class="bg-transparent outline-hidden text-3xl text-center"
			placeholder="Enter question here..."
			bind:value={data.question}
		/>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 m-4 gap-4">
		{#each data.answers as answer, i}
			<div
				class="rounded-lg p-4 flex items-center shadow-md relative"
				style="background-color: {default_colors[i % default_colors.length]};"
			>
				<div class="shrink-0 flex items-center justify-center mr-3">
					<AnswerShape shapeIndex={i} class="w-7 h-7 text-white drop-shadow-sm" />
				</div>
				<input
					bind:value={answer.answer}
					class="w-full my-auto bg-transparent outline-hidden text-left font-semibold text-white placeholder-white/60 text-lg"
					placeholder="Enter answer here"
				/>
				<button
					type="button"
					class="shrink-0 ml-2 focus:outline-none transition-transform active:scale-95"
					onclick={() => {
						answer.correct = !answer.correct;
					}}
				>
					{#if answer.correct}
						<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
						</div>
					{:else}
						<div class="w-8 h-8 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 transition shadow-sm"></div>
					{/if}
				</button>
			</div>
		{/each}
	</div>
	<div class="flex justify-center w-full">
		{#if data.answers.length < 4}
			<div class="w-1/4">
				<BrownButton
					type="button"
					onclick={() => {
						data.answers = [
							...data.answers,
							{
								answer: '',
								correct: false
							}
						];
					}}
				>
					{$t('words.add')}
				</BrownButton>
			</div>
		{/if}
	</div>
</div>

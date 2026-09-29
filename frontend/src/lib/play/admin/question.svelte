<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { QuizQuestionType } from '$lib/quiz_types';
	import type { QuizData } from '$lib/quiz_types';
	import { get_foreground_color } from '$lib/helpers.js';
	import { kahoot_icons } from '$lib/play/kahoot_mode_assets/kahoot_icons.js';
	import CircularTimer from '$lib/play/circular_progress.svelte';
	import MediaComponent from '$lib/editor/MediaComponent.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { getLocalization } from '$lib/i18n';

	interface Props {
		quiz_data: QuizData;
		selected_question: number;
		timer_res: string;
		answer_count: number;
		default_colors: string[];
	}

	let {
		quiz_data,
		selected_question,
		timer_res = $bindable(),
		answer_count,
		default_colors
	}: Props = $props();

	const { t } = getLocalization();

	let circular_progress = $derived.by(() => {
		try {
			return (
				1 -
				((100 / parseInt(quiz_data.questions[selected_question].time)) *
					parseInt(timer_res)) /
					100
			);
		} catch {
			return 0;
		}
	});
</script>

<div class="flex flex-col justify-center w-screen h-1/6">
	<h1 class="text-6xl text-center">
		{@html quiz_data.questions[selected_question].question}
	</h1>
	<!--			<span class='text-center py-2 text-lg'>{$t('admin_page.time_left')}: {timer_res}</span>-->
	<div class="grid grid-cols-3 my-2">
		<span></span>
		<div class="m-auto">
			<CircularTimer text={timer_res} progress={circular_progress} color="#ef4444" />
		</div>
		<p class="m-auto text-3xl">
			{$t('admin_page.answers_submitted', { answer_count: answer_count })}
		</p>
	</div>
</div>
{#if quiz_data.questions[selected_question].image !== null}
	<div class="flex w-full">
		<MediaComponent
			src={quiz_data.questions[selected_question].image}
			muted={false}
			css_classes="max-h-[20vh] object-cover mx-auto mb-8 w-auto"
		/>
	</div>
{/if}
{#if quiz_data.questions[selected_question].type === QuizQuestionType.ABCD || quiz_data.questions[selected_question].type === QuizQuestionType.VOTING || quiz_data.questions[selected_question].type === QuizQuestionType.CHECK}
	<div class="grid grid-cols-2 gap-4 w-full p-6">
		{#each quiz_data.questions[selected_question].answers as answer, i}
			<div
				class="rounded-xl h-fit min-h-[80px] flex items-center px-4 py-3 shadow-lg border border-black/10 transition-all"
				style="background-color: {answer.color ?? default_colors[i % default_colors.length]};"
				class:opacity-40={!answer.right &&
					timer_res === '0' &&
					quiz_data.questions[selected_question].type === QuizQuestionType.ABCD}
			>
				<div class="shrink-0 flex items-center justify-center pl-2">
					<AnswerShape shapeIndex={i} class="w-10 h-10 text-white drop-shadow-md" />
				</div>
				<span
					class="text-center font-bold text-2xl md:text-3xl px-4 py-2 w-full text-white break-words"
					>{answer.answer}</span
				>
				{#if answer.right && timer_res === '0'}
					<div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shrink-0 shadow-md">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
					</div>
				{:else}
					<span class="w-10 shrink-0"></span>
				{/if}
			</div>
		{/each}
	</div>
{:else if quiz_data.questions[selected_question].type === QuizQuestionType.TEXT}
	{#if timer_res === '0'}
		<div class="grid grid-cols-2 gap-2 w-full p-4">
			{#each quiz_data.questions[selected_question].answers as answer, i}
				<div class="rounded-lg h-fit flex bg-[#B07156]">
					<span class="text-center text-2xl px-2 py-4 w-full text-black"
						>{answer.answer}</span
					>
					<span class="pl-4 w-10"></span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex justify-center">
			<p class="text-2xl">{$t('admin_page.enter_answer_into_field')}</p>
		</div>
	{/if}
{/if}

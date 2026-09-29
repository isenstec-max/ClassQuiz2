<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { EditorData, Question } from '../quiz_types';
	import { QuizQuestionType } from '$lib/quiz_types';
	import { reach } from 'yup';
	import { ABCDQuestionSchema, dataSchema } from '../yupSchemas';
	import { createTippy } from 'svelte-tippy';
	import { getLocalization } from '$lib/i18n';
	import AddNewQuestionPopup from '$lib/editor/AddNewQuestionPopup.svelte';
	import { fade } from 'svelte/transition';

	const { t } = getLocalization();

	interface Props {
		data: EditorData;
		selected_question?: any;
	}

	let { data = $bindable(), selected_question = $bindable(-1) }: Props = $props();

	let reorder_mode = $state(false);

	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'right'
	});
	let arr_of_cards = $state(Array(data.questions.length));
	let propertyCard = $state();
	let add_new_question_popup_open = $state(false);

	const empy_slide: Question = {
		type: QuizQuestionType.SLIDE,
		time: '120',
		question: 'Slide',
		image: undefined,
		answers: ''
	};

	const swapArrayElements = (arr, a: number, b: number) => {
		let _arr = [...arr];
		let temp = _arr[a];
		_arr[a] = _arr[b];
		_arr[b] = temp;
		return _arr;
	};

	const setSelectedQuestion = (index: number): void => {
		if (reorder_mode) {
			return;
		}
		selected_question = index;
		if (index === -1) {
			propertyCard.scrollIntoView({
				behavior: 'smooth'
			});
		} else {
			arr_of_cards[index].scrollIntoView({
				behavior: 'smooth'
			});
		}
	};
	/*	onMount(() => {
            propertyCard.scrollIntoView({
                behavior: 'smooth'
            });
        });*/
</script>

<div class="h-full flex flex-col overflow-hidden relative">
	<!-- Top reorder bar -->
	<div class="px-3 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-900/40">
		<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
			Snímky ({data.questions.length})
		</span>
		<button
			type="button"
			onclick={() => (reorder_mode = !reorder_mode)}
			class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer {reorder_mode ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}"
		>
			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
			</svg>
			<span>{#if reorder_mode}{$t('editor.disable_reorder')}{:else}{$t('editor.enable_reorder')}{/if}</span>
		</button>
	</div>

	<!-- Scrollable list of cards -->
	<div class="flex-1 overflow-y-auto p-3 space-y-3">
		<!-- Cover Slide Card -->
		<div
			bind:this={propertyCard}
			class="rounded-2xl p-3 cursor-pointer transition-all border relative shadow-xs {selected_question === -1 ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10' : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}"
			onclick={() => setSelectedQuestion(-1)}
		>
			<div class="flex items-center justify-between mb-2">
				<span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md {selected_question === -1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
					{$t('words.settings')}
				</span>
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						data.public = !data.public;
					}}
					class="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition {data.public ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}"
				>
					{#if data.public}
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span>{$t('words.public')}</span>
					{:else}
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
						<span>{$t('words.private')}</span>
					{/if}
				</button>
			</div>
			<div
				use:tippy={{ content: data.title === '' ? "It's empty!" : data.title }}
				class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate mb-1"
				class:text-rose-500={!reach(dataSchema, 'title').isValidSync(data.title)}
			>
				{#if data.title}
					{@html data.title}
				{:else}
					<span class="italic text-slate-400 font-normal">{$t('editor.no_title')}</span>
				{/if}
			</div>
			<div
				use:tippy={{ content: data.description === '' ? "It's empty!" : data.description }}
				class="text-xs text-slate-500 dark:text-slate-400 truncate"
				class:text-rose-500={!reach(dataSchema, 'description').isValidSync(data.description)}
			>
				{#if data.description}
					{data.description}
				{:else}
					<span class="italic text-slate-400">{$t('editor.empty')}</span>
				{/if}
			</div>
		</div>

		<!-- Questions List -->
		{#each data.questions as question, index}
			<div
				class="rounded-2xl p-3 cursor-pointer transition-all border relative group shadow-xs {index === selected_question ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10' : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}"
				onclick={() => {
					setSelectedQuestion(index);
				}}
				bind:this={arr_of_cards[index]}
			>
				<!-- Reorder overlay -->
				{#if reorder_mode}
					<div
						transition:fade|global={{ duration: 90 }}
						class="absolute inset-0 z-10 grid grid-cols-2 bg-slate-900/40 backdrop-blur-xs rounded-2xl items-center justify-center p-2 gap-2"
					>
						<button
							type="button"
							class="h-full flex items-center justify-center bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition cursor-pointer text-slate-800 dark:text-white"
							aria-label="Move card up"
							class:opacity-40={index === 0}
							class:pointer-events-none={index === 0}
							onclick={(e) => {
								e.stopPropagation();
								data.questions = swapArrayElements(data.questions, index, index - 1);
							}}
						>
							<svg class="w-5 h-5" fill="none" stroke-width="2.5" stroke="currentColor" viewBox="0 0 24 24">
								<path d="m4.5 15.75 7.5-7.5 7.5 7.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
						<button
							type="button"
							class="h-full flex items-center justify-center bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition cursor-pointer text-slate-800 dark:text-white"
							aria-label="Move card down"
							class:opacity-40={index + 1 === data.questions.length}
							class:pointer-events-none={index + 1 === data.questions.length}
							onclick={(e) => {
								e.stopPropagation();
								data.questions = swapArrayElements(data.questions, index, index + 1);
							}}
						>
							<svg class="w-5 h-5" fill="none" stroke-width="2.5" stroke="currentColor" viewBox="0 0 24 24">
								<path d="m19.5 8.25-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
					</div>
				{/if}

				<!-- Header of Question Card -->
				<div class="flex items-center justify-between mb-1.5">
					<div class="flex items-center gap-1.5">
						<span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md {index === selected_question ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}">
							#{index + 1}
						</span>
						<span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
							{question.type}
						</span>
					</div>

					<!-- Delete button -->
					<button
						class="w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all flex items-center justify-center text-xs opacity-70 group-hover:opacity-100 cursor-pointer"
						type="button"
						title="Zmazať otázku"
						onclick={(e) => {
							e.stopPropagation();
							if (confirm('Naozaj chcete vymazať túto otázku?')) {
								selected_question = -1;
								data.questions.splice(index, 1);
								data.questions = data.questions;
							}
						}}
					>
						✕
					</button>
				</div>

				<!-- Question text -->
				<div
					use:tippy={{
						content: question.question === '' ? 'No title' : question.question
					}}
					class="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate mb-2"
					class:text-rose-500={!reach(dataSchema, 'questions[].question').isValidSync(question.question)}
				>
					{#if question.question === ''}
						<span class="italic text-slate-400 font-normal">{$t('editor.no_title')}</span>
					{:else}
						{@html question.question}
					{/if}
				</div>

				<!-- Image thumbnail if available -->
				{#if question.image}
					<div class="flex justify-center pb-2">
						<img
							src="/api/v1/storage/download/{question.image}"
							class="h-8 w-auto max-w-full rounded-md border border-slate-200 dark:border-slate-700 object-cover"
							alt="Not available"
						/>
					</div>
				{/if}

				<!-- Answer previews -->
				{#if question.type === QuizQuestionType.ABCD || question.type === QuizQuestionType.CHECK}
					<div class="grid grid-cols-2 gap-1.5">
						{#if Array.isArray(question.answers)}
							{#each question.answers as answer}
								<div
									class="truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium text-center text-white flex items-center justify-center"
									style="background-color: {answer.color ?? (answer.right ? '#10b981' : '#ef4444')};"
									use:tippy={{
										content: answer.answer === '' ? $t('editor.empty') : answer.answer
									}}
								>
									{#if answer.right}
										<span class="mr-1 font-bold">✓</span>
									{/if}
									<span class="truncate">{answer.answer === '' ? '...' : answer.answer}</span>
								</div>
							{/each}
						{/if}
					</div>
				{:else if question.type === QuizQuestionType.RANGE}
					<div class="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 text-center font-mono">
						[{question.answers.min_correct} - {question.answers.max_correct}]
					</div>
				{:else if question.type === QuizQuestionType.VOTING || question.type === QuizQuestionType.TEXT}
					{#if Array.isArray(question.answers)}
						<div class="grid grid-cols-2 gap-1">
							{#each question.answers as answer}
								<div class="truncate rounded-md px-1 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-center">
									{answer.answer === '' ? '...' : answer.answer}
								</div>
							{/each}
						</div>
					{/if}
				{:else if question.type === QuizQuestionType.SLIDE}
					<div class="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">
						Informačná snímka
					</div>
				{:else if question.type === QuizQuestionType.ORDER}
					<div class="text-[10px] text-slate-400 dark:text-slate-500 italic text-center">
						Zoradenie položiek
					</div>
				{/if}
			</div>
		{/each}

		<!-- Add Question & Slide Buttons -->
		<div class="grid grid-cols-2 gap-2 pt-2">
			<button
				type="button"
				class="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
				onclick={() => {
					add_new_question_popup_open = true;
				}}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				<span>{$t('words.question')}</span>
			</button>
			<button
				type="button"
				class="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
				onclick={() => {
					data.questions = [...data.questions, { ...empy_slide }];
				}}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
				<span>{$t('words.slide')}</span>
			</button>
		</div>
	</div>
</div>
{#if add_new_question_popup_open}
	<AddNewQuestionPopup
		bind:questions={data.questions}
		bind:open={add_new_question_popup_open}
		bind:selected_question
	/>
{/if}

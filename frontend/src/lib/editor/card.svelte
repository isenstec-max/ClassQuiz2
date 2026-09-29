<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { EditorData } from '$lib/quiz_types';
	import { QuizQuestionType } from '$lib/quiz_types';
	import RangeEditor from '$lib/editor/RangeSelectorEditorPart.svelte';
	import { reach } from 'yup';
	import { dataSchema } from '$lib/yupSchemas';
	import Spinner from '../Spinner.svelte';
	import { createTippy } from 'svelte-tippy';
	import { getLocalization } from '$lib/i18n';
	import MediaComponent from '$lib/editor/MediaComponent.svelte';
	import { fade } from 'svelte/transition';
	// import MediaComponent from "$lib/editor/MediaComponent.svelte";

	const { t } = getLocalization();

	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'top'
	});

	interface Props {
		data: EditorData;
		selected_question: number;
		edit_id: string;
	}

	let {
		data = $bindable(),
		selected_question = $bindable(),
		edit_id = $bindable()
	}: Props = $props();

	let advanced_options_open = $state(false);

	let uppyOpen = $state(false);
	let unique = $state({});

	/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
	const correctTimeInput = (_) => {
		let time = data.questions[selected_question].time;
		if (time === null || time === undefined) {
			data.questions[selected_question].time = '';
			time = '';
		}
		if (data.questions[selected_question].time > 3) {
			data.questions[selected_question].time = data.questions[selected_question].time
				.toString()
				.slice(0, 3);
		}
	};
	const set_unique = () => {
		unique = {};
	};
	run(() => {
		correctTimeInput(data.questions[selected_question].time);
	});
	run(() => {
		selected_question;
		set_unique();
	});
	let image_url = $state('');

	const update_image_url = () => {
		image_url = data.questions[selected_question].image;
	};
	run(() => {
		update_image_url();
		selected_question;
		data.questions;
	});

	const type_to_name = {
		RANGE: $t('words.range'),
		ABCD: $t('words.multiple_choice'),
		VOTING: $t('words.voting'),
		TEXT: $t('words.text'),
		ORDER: $t('words.order'),
		CHECK: $t('words.check_choice')
	};

	/*
    if (typeof data.questions[selected_question].type !== QuizQuestionType) {
        console.log(data.questions[selected_question].type !== QuizQuestionType.ABCD || data.questions[selected_question].type !== QuizQuestionType.RANGE)
        data.questions[selected_question].type = QuizQuestionType.ABCD;
    }
     */
</script>

<div class="w-full pb-10">
	<div class="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
		<!-- macOS Chrome Header -->
		<div class="px-6 py-3.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="w-3.5 h-3.5 rounded-full bg-rose-400/90 shadow-xs"></span>
				<span class="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-xs"></span>
				<span class="w-3.5 h-3.5 rounded-full bg-emerald-400/90 shadow-xs"></span>
			</div>
			<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
				<span class="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold">#{selected_question + 1}</span>
				<span>{type_to_name[String(data.questions[selected_question].type)] || data.questions[selected_question].type}</span>
			</div>
			<button
				class="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
				type="button"
				use:tippy={{ content: $t('editor.advanced_settings') }}
				onclick={() => (advanced_options_open = true)}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</button>
		</div>

		<!-- Card Content -->
		<div class="p-6 md:p-10 space-y-6">
			{#if data.questions[selected_question].type === QuizQuestionType.SLIDE}
				{#await import('./slide.svelte')}
					<Spinner my_20={false} />
				{:then c}
					<c.default bind:data={data.questions[selected_question]} />
				{/await}
			{:else}
				{@const type = data.questions[selected_question].type}
				<!-- Question Title Editor -->
				<div class="flex flex-col items-center gap-2">
					<label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						{$t('words.question')}
					</label>
					<div class="w-full flex justify-center">
						{#key unique}
							{#await import('$lib/inline-editor.svelte')}
								<Spinner my_20={false} />
							{:then c}
								<div
									class="w-full max-w-2xl rounded-2xl transition"
									class:ring-2={!reach(dataSchema, 'questions[].question').isValidSync(data.questions[selected_question].question)}
									class:ring-rose-500={!reach(dataSchema, 'questions[].question').isValidSync(data.questions[selected_question].question)}
								>
									<c.default bind:text={data.questions[selected_question].question} />
								</div>
							{/await}
						{/key}
					</div>
				</div>

				<!-- Media Uploader / Preview -->
				{#if data.questions[selected_question].image}
					<div class="flex justify-center w-full">
						<div class="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md max-h-72">
							<MediaComponent bind:src={image_url} />
							<div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<button
									class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
									type="button"
									onclick={() => {
										data.questions[selected_question].image = null;
									}}
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									<span>{$t('words.delete')}</span>
								</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="w-full flex justify-center">
						{#await import('$lib/editor/uploader.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default
								bind:modalOpen={uppyOpen}
								bind:edit_id
								bind:data
								bind:selected_question
								video_upload={true}
							/>
						{/await}
					</div>
				{/if}

				<!-- Controls bar: Time limit & Question type -->
				<div class="flex items-center justify-center gap-4 py-2">
					<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
						<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Časový limit:</span>
						<input
							type="number"
							max="999"
							min="1"
							class="w-14 bg-transparent rounded-lg text-center font-bold text-sm border border-slate-300 dark:border-slate-600 px-1 py-0.5 outline-hidden focus:ring-2 focus:ring-emerald-500/50"
							bind:value={data.questions[selected_question].time}
						/>
						<span class="text-xs font-bold text-slate-600 dark:text-slate-300">s</span>
					</div>

					<div class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
						{type_to_name[String(data.questions[selected_question].type)]}
					</div>
				</div>

				<!-- Answers Section -->
				<div class="w-full pt-2">
					{#if type === QuizQuestionType.ABCD || type === QuizQuestionType.CHECK}
						{#await import('$lib/editor/ABCDEditorPart.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default
								bind:data
								bind:selected_question
								check_choice={type === QuizQuestionType.CHECK}
							/>
						{/await}
					{:else if type === QuizQuestionType.RANGE}
						<RangeEditor bind:selected_question bind:data />
					{:else if type === QuizQuestionType.VOTING}
						{#await import('$lib/editor/VotingEditorPart.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default bind:data bind:selected_question />
						{/await}
					{:else if type === QuizQuestionType.TEXT}
						{#await import('$lib/editor/TextEditorPart.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default bind:data bind:selected_question />
						{/await}
					{:else if type === QuizQuestionType.ORDER}
						{#await import('$lib/editor/OrderEditorPart.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default bind:data bind:selected_question />
						{/await}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

{#if advanced_options_open}
	<div
		class="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		transition:fade|global={{ duration: 150 }}
	>
		<div class="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col gap-4">
			<div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
				<h2 class="text-xl font-extrabold text-slate-800 dark:text-white">{$t('editor.advanced_settings')}</h2>
				<button
					type="button"
					onclick={() => (advanced_options_open = false)}
					class="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
				>
					✕
				</button>
			</div>

			<label class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 cursor-pointer">
				<span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{$t('editor.hide_question_results')}</span>
				<input
					type="checkbox"
					class="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
					bind:checked={data.questions[selected_question]['hide_results']}
				/>
			</label>

			<div class="mt-2 w-full">
				<button
					type="button"
					onclick={() => (advanced_options_open = false)}
					class="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition cursor-pointer"
				>
					{$t('words.close')}
				</button>
			</div>
		</div>
	</div>
{/if}

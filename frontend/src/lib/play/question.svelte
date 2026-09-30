<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { Question } from '$lib/quiz_types';
	import { QuizQuestionType } from '$lib/quiz_types';
	import { socket } from '$lib/socket';
	import Spinner from '../Spinner.svelte';
	import { getLocalization } from '$lib/i18n';
	import { kahoot_icons } from './kahoot_mode_assets/kahoot_icons';
	import CircularTimer from '$lib/play/circular_progress.svelte';
	import { flip } from 'svelte/animate';
	import BrownButton from '$lib/components/buttons/brown.svelte';
	import { get_foreground_color } from '../helpers';
	import MediaComponent from '$lib/editor/MediaComponent.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';
	import { onMount } from 'svelte';

	const { t } = getLocalization();

	const getMobileAnswerClass = (text: any): string => {
		const str = (text ?? '').toString().trim();
		const len = str.length;
		if (len === 0) return 'text-2xl';
		if (len === 1) return 'text-8xl font-black leading-none';
		if (len <= 2) return 'text-6xl sm:text-7xl font-black leading-none';
		if (len <= 4) return 'text-4xl sm:text-5xl font-extrabold leading-tight';
		if (len <= 6) return 'text-3xl sm:text-4xl font-extrabold leading-snug';

		const words = str.split(/\s+/);
		const maxWord = Math.max(...words.map((w) => w.length));

		if (maxWord <= 9 && len <= 10) return 'text-2xl sm:text-3xl font-extrabold leading-snug';
		if (maxWord <= 13 && len <= 26) return 'text-xl sm:text-2xl font-bold leading-snug';
		if (maxWord <= 15 && len <= 45) return 'text-lg sm:text-xl font-bold leading-snug';
		if (len <= 75) return 'text-base sm:text-lg font-semibold leading-snug';
		return 'text-sm font-semibold leading-snug';
	};

	const getDesktopAnswerClass = (answers: any[]): string => {
		if (!answers || !Array.isArray(answers) || answers.length === 0) return 'md:text-2xl md:leading-snug';

		let maxTotalLen = 0;
		let maxWordLen = 0;
		for (const a of answers) {
			const str = (a?.answer ?? '').toString().trim();
			if (str.length > maxTotalLen) maxTotalLen = str.length;
			const words = str.split(/\s+/);
			for (const w of words) {
				if (w.length > maxWordLen) maxWordLen = w.length;
			}
		}

		if (maxTotalLen <= 1) return 'md:text-7xl md:leading-none';
		if (maxTotalLen <= 3) return 'md:text-5xl md:leading-tight';
		if (maxTotalLen <= 6) return 'md:text-4xl md:leading-tight';
		if (maxTotalLen <= 12 && maxWordLen <= 12) return 'md:text-3xl md:leading-snug';
		if (maxTotalLen <= 26 && maxWordLen <= 16) return 'md:text-2xl md:leading-snug';
		if (maxTotalLen <= 50) return 'md:text-xl md:leading-snug';
		if (maxTotalLen <= 80) return 'md:text-lg md:leading-snug';
		return 'md:text-base md:leading-snug';
	};

	interface Props {
		question: Question;
		game_mode: any;
		question_index: string | number;
		solution: any;
	}

	let {
		question = $bindable(),
		game_mode = $bindable(),
		question_index,
		solution
	}: Props = $props();

	if (question.type === undefined) {
		question.type = QuizQuestionType.ABCD;
	} else {
		question.type = QuizQuestionType[question.type];
	}

	let timer_res = $state(question.time);
	let selected_answer: string = $state();
	let desktopClass = $derived(getDesktopAnswerClass(question?.answers));

	onMount(() => {
		if (typeof window !== 'undefined') {
			const saved = sessionStorage.getItem(`cq_sel_ans_${question_index}`);
			if (saved) {
				selected_answer = saved;
			}
		}
	});

	// Stop the timer if the question is answered
	const timer = (time: string) => {
		let seconds = Number(time);
		let timer_interval = setInterval(() => {
			if (timer_res === '0') {
				clearInterval(timer_interval);
				return;
			} else {
				seconds--;
			}

			timer_res = seconds.toString();
		}, 1000);
	};
	socket.on('everyone_answered', (_) => {
		timer_res = '0';
	});

	timer(question.time);

	$effect(() => {
		if (solution !== undefined) {
			timer_res = '0';
		}
	});

	const selectAnswer = (answer: string) => {
		selected_answer = answer;
		if (typeof window !== 'undefined') {
			try {
				sessionStorage.setItem(`cq_sel_ans_${question_index}`, answer);
			} catch (e) {}
		}
		socket.emit('submit_answer', {
			question_index: question_index,
			answer: answer
		});
	};

	const select_complex_answer = (data) => {
		selected_answer = 'a';
		if (typeof window !== 'undefined') {
			try {
				sessionStorage.setItem(`cq_sel_ans_${question_index}`, 'a');
			} catch (e) {}
		}
		const new_array = [];
		for (let i = 0; i < data.length; i++) {
			new_array.push({ answer: data[i].answer });
		}
		socket.emit('submit_answer', {
			question_index: question_index,
			answer: 'a',
			complex_answer: new_array
		});
	};

	let text_input = $state('');

	let slider_value = $state([0]);
	if (question.type === QuizQuestionType.RANGE) {
		slider_value[0] = (question.answers.max - question.answers.min) / 2 + question.answers.min;
	}
	const set_answer_if_not_set_range = (time) => {
		if (question.type !== QuizQuestionType.RANGE) {
			return;
		}
		if (selected_answer === undefined && time === '0') {
			selected_answer = `${slider_value[0]}`;
			selectAnswer(selected_answer);
		}
	};

	if (question.type === QuizQuestionType.ORDER) {
		for (let i = 0; i < question.answers.length; i++) {
			question.answers[i] = { ...question.answers[i], id: i };
		}
	}

	const swapArrayElements = (arr, a: number, b: number) => {
		let _arr = [...arr];
		let temp = _arr[a];
		_arr[a] = _arr[b];
		_arr[b] = temp;
		return _arr;
	};
	$effect(() => {
		set_answer_if_not_set_range(timer_res);
	});
	let circular_progress = $derived.by(() => {
		try {
			return 1 - ((100 / question.time) * parseInt(timer_res)) / 100;
		} catch {
			return 0;
		}
	});

	let timer_color = $derived.by(() => {
		try {
			const total = Number(question.time);
			const current = Number(timer_res);
			if (!total || isNaN(total) || total <= 0) return '#10b981';
			const ratio = current / total;
			if (ratio > 0.5) return '#10b981';
			if (ratio > 0.25) return '#f59e0b';
			return '#ef4444';
		} catch {
			return '#10b981';
		}
	});

	const get_div_height = (): string => {
		if (game_mode === 'normal') {
			if (question.image) {
				return '66.666667';
			} else {
				return '83.333333';
			}
		} else {
			return '100';
		}
	};
	const default_colors = DEFAULT_ANSWER_COLORS;
</script>

<div class="h-screen w-screen flex flex-col justify-between overflow-hidden relative select-none">
	<!-- Horná lišta odpočtu času s plynulou zmenou farby -->
	{#if timer_res !== '0'}
		<span
			class="fixed top-0 left-0 h-2 sm:h-2.5 transition-all duration-300 shadow-md z-50 rounded-r-full"
			style="width: {((Number(timer_res) / Number(question.time)) * 100)}vw; background-color: {timer_color};"
		></span>
	{/if}

	{#if game_mode === 'normal'}
		<!-- Moderná karta s textom otázky -->
		<div
			class="w-full max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 flex flex-col items-center shrink-0 z-20"
			class:mt-6={[QuizQuestionType.RANGE, QuizQuestionType.ORDER, QuizQuestionType.TEXT]}
		>
			<div class="w-full bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl text-white px-5 sm:px-8 py-3.5 sm:py-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 text-center flex flex-col items-center gap-1.5 sm:gap-2 transition-all">
				{#if question_index !== undefined && question_index !== ''}
					<span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase shadow-inner">
						<span>Otázka {Number(question_index) + 1}</span>
					</span>
				{/if}
				<h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug drop-shadow text-white break-words max-w-3xl">
					{@html question.question}
				</h1>
			</div>
			{#if question.image !== null && game_mode !== 'kahoot'}
				<div class="mt-2 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 max-h-[20vh]">
					<MediaComponent
						src={question.image}
						css_classes="object-contain max-h-[20vh] mx-auto rounded-xl"
					/>
				</div>
			{/if}

			<!-- Notifikácia po odkliknutí odpovede: Počkaj na vyhodnotenie otázky + točiaci sa krúžok s logom -->
			{#if selected_answer !== undefined}
				<div class="mt-3 sm:mt-4 w-full max-w-lg mx-auto flex items-center justify-center gap-3.5 px-6 py-3 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-500/60 shadow-2xl animate-fade-down z-30">
					<div class="relative w-11 h-11 flex items-center justify-center shrink-0">
						<div class="absolute inset-0 rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400 border-r-cyan-400 border-b-indigo-500 animate-spin"></div>
						<div class="w-6 h-6 flex items-center justify-center">
							<svg class="w-6 h-6 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<linearGradient id="cq2-spin-gold" x1="20" y1="25" x2="45" y2="75" gradientUnits="userSpaceOnUse">
										<stop offset="0%" stop-color="#FDE047" />
										<stop offset="100%" stop-color="#F59E0B" />
									</linearGradient>
									<linearGradient id="cq2-spin-coral" x1="55" y1="20" x2="85" y2="75" gradientUnits="userSpaceOnUse">
										<stop offset="0%" stop-color="#FB923C" />
										<stop offset="100%" stop-color="#E11D48" />
									</linearGradient>
									<linearGradient id="cq2-spin-q" x1="32" y1="28" x2="78" y2="78" gradientUnits="userSpaceOnUse">
										<stop offset="0%" stop-color="#10B981" />
										<stop offset="35%" stop-color="#06B6D4" />
										<stop offset="70%" stop-color="#6366F1" />
										<stop offset="100%" stop-color="#8B5CF6" />
									</linearGradient>
								</defs>
								<path d="M 33 13 C 33 21 28 25 21 25 C 28 25 33 29 33 37 C 33 29 38 25 45 25 C 38 25 33 21 33 13 Z" fill="#FBBF24" />
								<path d="M 48 10 C 48 14.5 45 16.5 41 16.5 C 45 16.5 48 18.5 48 23 C 48 18.5 51 16.5 55 16.5 C 51 16.5 48 14.5 48 10 Z" fill="#FDE047" />
								<rect x="18" y="32" width="34" height="44" rx="8" transform="rotate(-20 35 54)" fill="url(#cq2-spin-gold)" />
								<rect x="52" y="24" width="34" height="44" rx="8" transform="rotate(24 69 46)" fill="url(#cq2-spin-coral)" />
								<path d="M 76.5 43.5 A 23 23 0 1 0 78.5 65" stroke="white" stroke-width="18" stroke-linecap="round" fill="none" />
								<path d="M 64 62 L 81 79" stroke="white" stroke-width="18" stroke-linecap="round" />
								<path d="M 76.5 43.5 A 23 23 0 1 0 78.5 65" stroke="url(#cq2-spin-q)" stroke-width="12" stroke-linecap="round" fill="none" />
								<path d="M 64 62 L 81 79" stroke="url(#cq2-spin-q)" stroke-width="12" stroke-linecap="round" />
							</svg>
						</div>
					</div>
					<div class="flex flex-col text-left">
						<span class="text-sm sm:text-base font-black text-white tracking-wide">
							{$t('play.wait_for_evaluation', { default: 'Počkaj na vyhodnotenie otázky' })}
						</span>
						<span class="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
							<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
							{$t('play.answer_recorded', { default: 'Odpoveď bola zaznamenaná ✓' })}
						</span>
					</div>
				</div>
			{/if}
		</div>
	{:else if selected_answer !== undefined}
		<!-- Pre iný mód (napr. Kahoot mode bez textu otázky na mobile) -->
		<div class="w-full max-w-lg mx-auto px-4 pt-4 z-30">
			<div class="flex items-center justify-center gap-3.5 px-6 py-3 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-500/60 shadow-2xl animate-fade-down">
				<div class="relative w-11 h-11 flex items-center justify-center shrink-0">
					<div class="absolute inset-0 rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400 border-r-cyan-400 border-b-indigo-500 animate-spin"></div>
					<div class="w-6 h-6 flex items-center justify-center">
						<svg class="w-6 h-6 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
							<defs>
								<linearGradient id="cq2-spin-gold-k" x1="20" y1="25" x2="45" y2="75" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stop-color="#FDE047" />
									<stop offset="100%" stop-color="#F59E0B" />
								</linearGradient>
								<linearGradient id="cq2-spin-coral-k" x1="55" y1="20" x2="85" y2="75" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stop-color="#FB923C" />
									<stop offset="100%" stop-color="#E11D48" />
								</linearGradient>
								<linearGradient id="cq2-spin-q-k" x1="32" y1="28" x2="78" y2="78" gradientUnits="userSpaceOnUse">
									<stop offset="0%" stop-color="#10B981" />
									<stop offset="35%" stop-color="#06B6D4" />
									<stop offset="70%" stop-color="#6366F1" />
									<stop offset="100%" stop-color="#8B5CF6" />
								</linearGradient>
							</defs>
							<path d="M 33 13 C 33 21 28 25 21 25 C 28 25 33 29 33 37 C 33 29 38 25 45 25 C 38 25 33 21 33 13 Z" fill="#FBBF24" />
							<path d="M 48 10 C 48 14.5 45 16.5 41 16.5 C 45 16.5 48 18.5 48 23 C 48 18.5 51 16.5 55 16.5 C 51 16.5 48 14.5 48 10 Z" fill="#FDE047" />
							<rect x="18" y="32" width="34" height="44" rx="8" transform="rotate(-20 35 54)" fill="url(#cq2-spin-gold-k)" />
							<rect x="52" y="24" width="34" height="44" rx="8" transform="rotate(24 69 46)" fill="url(#cq2-spin-coral-k)" />
							<path d="M 76.5 43.5 A 23 23 0 1 0 78.5 65" stroke="white" stroke-width="18" stroke-linecap="round" fill="none" />
							<path d="M 64 62 L 81 79" stroke="white" stroke-width="18" stroke-linecap="round" />
							<path d="M 76.5 43.5 A 23 23 0 1 0 78.5 65" stroke="url(#cq2-spin-q-k)" stroke-width="12" stroke-linecap="round" fill="none" />
							<path d="M 64 62 L 81 79" stroke="url(#cq2-spin-q-k)" stroke-width="12" stroke-linecap="round" />
						</svg>
					</div>
				</div>
				<div class="flex flex-col text-left">
					<span class="text-sm sm:text-base font-black text-white tracking-wide">
						{$t('play.wait_for_evaluation', { default: 'Počkaj na vyhodnotenie otázky' })}
					</span>
					<span class="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
						<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
						{$t('play.answer_recorded', { default: 'Odpoveď bola zaznamenaná ✓' })}
					</span>
				</div>
			</div>
		</div>
	{/if}
	{#if timer_res !== '0'}
		{#if question.type === QuizQuestionType.ABCD || question.type === QuizQuestionType.VOTING}
			<div class="w-full relative flex-1 min-h-0 p-3 sm:p-5">
				<div
					class="absolute top-0 bottom-0 left-0 right-0 m-auto rounded-full h-fit w-fit border-2 border-black/40 shadow-2xl z-40"
				>
					<CircularTimer text={timer_res} progress={circular_progress} color={timer_color} />
				</div>

				<div class="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full">
					{#each question.answers as answer, i}
						<button
							class="rounded-2xl h-full flex items-center justify-center p-2 sm:p-4 border-2 border-white/20 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group {selected_answer === answer.answer ? 'ring-4 ring-white shadow-2xl scale-[1.01]' : selected_answer !== undefined ? 'opacity-40' : ''}"
							style="background-color: {answer.color ??
								default_colors[i % default_colors.length]}; color: {get_foreground_color(
								answer.color ?? default_colors[i % default_colors.length]
							)}"
							disabled={selected_answer !== undefined}
							onclick={() => selectAnswer(answer.answer)}
						>
							{#if game_mode === 'kahoot'}
								<AnswerShape shapeIndex={i} class="w-16 h-16 md:w-24 md:h-24 text-white drop-shadow-lg" />
							{:else}
								<div class="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 p-1 sm:p-1.5 rounded-lg bg-black/25 backdrop-blur-xs border border-white/10 flex items-center justify-center pointer-events-none z-10 shadow-sm">
									<AnswerShape shapeIndex={i} class="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white drop-shadow-sm" />
								</div>
								<div class="w-full h-full flex items-center justify-center px-2 py-3 sm:px-4 sm:py-5 overflow-hidden">
									<p
										class="font-black text-white text-center drop-shadow-md select-none max-w-full {getMobileAnswerClass(answer.answer)} {desktopClass}"
										style="overflow-wrap: anywhere; word-break: break-word;"
									>
										{answer.answer}
									</p>
								</div>
							{/if}
							{#if selected_answer === answer.answer}
								<div class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-slate-900 flex items-center justify-center font-black shadow-lg text-sm sm:text-base z-10">
									✓
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{:else if question.type === QuizQuestionType.RANGE}
			{#await import('svelte-range-slider-pips')}
				<Spinner />
			{:then c}
				<div class="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full my-auto">
					<div class="w-full bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6">
						<div class="w-full py-4" class:pointer-events-none={selected_answer !== undefined}>
							<c.default
								bind:values={slider_value}
								bind:min={question.answers.min}
								bind:max={question.answers.max}
								id="pips-slider"
								pips
								float
								all="label"
							/>
						</div>
						<div class="w-full max-w-xs">
							<BrownButton onclick={() => selectAnswer(slider_value[0])}>
								{$t('words.submit', { default: 'Odoslať' })}
							</BrownButton>
						</div>
					</div>
				</div>
			{/await}
		{:else if question.type === QuizQuestionType.TEXT}
			<div class="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full my-auto">
				<div class="w-full bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-5">
					<p class="text-white text-base sm:text-lg font-bold">Zadajte vašu odpoveď</p>
					<input
						type="text"
						bind:value={text_input}
						disabled={selected_answer !== undefined}
						placeholder="Napíšte odpoveď..."
						class="bg-slate-800 text-white border-2 border-slate-600 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl block w-full p-3.5 text-center text-lg sm:text-xl font-bold transition disabled:opacity-50"
					/>
					<div class="w-full max-w-xs">
						<BrownButton
							type="button"
							disabled={!text_input || text_input.length === 0}
							onclick={() => {
								selectAnswer(text_input);
							}}
						>
							{$t('words.submit', { default: 'Odoslať' })}
						</BrownButton>
					</div>
				</div>
			</div>
		{:else if question.type === QuizQuestionType.ORDER}
			<div class="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full overflow-y-auto py-4">
				<div class="w-full bg-slate-900/85 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-3">
					<p class="text-white text-base sm:text-lg font-bold text-center mb-1">Zoraďte položky v správnom poradí</p>
					{#each question.answers as answer, i (answer.id)}
						<div
							class="w-full flex items-center justify-between rounded-2xl p-3 shadow-lg border border-white/10"
							animate:flip={{ duration: 100 }}
							style="background-color: {answer.color ?? '#b07156'}"
						>
							<p class="font-bold text-base sm:text-lg md:text-xl text-white px-2 truncate flex-1">{answer.answer}</p>
							<div class="flex items-center gap-1.5 shrink-0">
								<button
									onclick={() => {
										question.answers = swapArrayElements(question.answers, i, i - 1);
									}}
									class="disabled:opacity-30 bg-black/30 hover:bg-black/50 p-2 rounded-xl text-white transition active:scale-95"
									type="button"
									aria-label="Move item up"
									disabled={i === 0 || Boolean(selected_answer)}
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
								</button>
								<button
									onclick={() => {
										question.answers = swapArrayElements(question.answers, i, i + 1);
									}}
									class="disabled:opacity-30 bg-black/30 hover:bg-black/50 p-2 rounded-xl text-white transition active:scale-95"
									type="button"
									aria-label="Move item down"
									disabled={i === question.answers.length - 1 || Boolean(selected_answer)}
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
								</button>
							</div>
						</div>
					{/each}
					<div class="w-full mt-3 flex justify-center">
						<div class="w-full max-w-xs">
							<BrownButton
								type="button"
								disabled={Boolean(selected_answer)}
								onclick={() => {
									select_complex_answer(question.answers);
								}}
							>
								{$t('words.submit', { default: 'Odoslať' })}
							</BrownButton>
						</div>
					</div>
				</div>
			</div>
		{:else if question.type === QuizQuestionType.CHECK}
			{#await import('./questions/check.svelte')}
				<Spinner />
			{:then c}
				<c.default
					{question}
					bind:selected_answer
					{game_mode}
					{timer_res}
					{circular_progress}
				/>
				<div class="flex justify-center h-[5%]">
					<div class="w-1/2">
						<BrownButton
							type="button"
							disabled={selected_answer === undefined}
							onclick={() => selectAnswer(selected_answer)}
							>{$t('words.submit')}
						</BrownButton>
					</div>
				</div>
			{/await}
		{/if}
	{/if}
</div>

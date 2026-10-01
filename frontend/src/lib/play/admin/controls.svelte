<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { QuizQuestionType } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import { SocketGameControls } from '$lib/play/admin/socket_game_controls.ts';
	import type { GameState } from '$lib/play/admin/game_state.ts';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		bg_color: string;
		socket_game_controls: SocketGameControls;
		game_token: string;
		game_state: GameState;
	}

	let { bg_color, socket_game_controls, game_token, game_state = $bindable() }: Props = $props();

	const { t } = getLocalization();

	let show_end_confirm = $state(false);

	const handleConfirmEndTest = () => {
		show_end_confirm = false;
		if (game_state.timer_res !== '0') {
			socket_game_controls.show_solutions();
			game_state.timer_res = '0';
		}
		setTimeout(() => {
			triggerFinalResults();
		}, 100);
	};

	const show_solutions = () => {
		socket_game_controls.show_solutions();
		game_state.timer_res = '0';
	};

	let countdown = $state(5);
	let countdownInterval: any = null;
	let finalResultsTriggered = false;

	const triggerFinalResults = () => {
		if (finalResultsTriggered) return;
		finalResultsTriggered = true;
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
		socket_game_controls.get_final_results();
	};

	let isLastQuestionResults = $derived.by(() => {
		if (!game_state.quiz_data?.questions?.length) return false;
		const isLast = game_state.selected_question + 1 === game_state.quiz_data.questions.length;
		const isFinished =
			(game_state.timer_res === '0' && game_state.question_results !== null) ||
			game_state.quiz_data?.questions?.[game_state.selected_question]?.type === QuizQuestionType.SLIDE;
		const noFinalResultsYet =
			JSON.stringify(game_state.final_results) === JSON.stringify([null]);

		return isLast && isFinished && noFinalResultsYet;
	});

	$effect(() => {
		if (isLastQuestionResults && !countdownInterval && !finalResultsTriggered) {
			countdown = 5;
			countdownInterval = setInterval(() => {
				if (countdown > 1) {
					countdown -= 1;
				} else {
					clearInterval(countdownInterval);
					countdownInterval = null;
					triggerFinalResults();
				}
			}, 1000);
		}

		return () => {
			if (!isLastQuestionResults && countdownInterval) {
				clearInterval(countdownInterval);
				countdownInterval = null;
			}
		};
	});

	// 1. Počítadlo 5 až 0: otázka skončila -> čiastočné výsledky
	let isQuestionFinishedWaitingResults = $derived.by(() => {
		if (!game_state.quiz_data?.questions?.length || game_state.selected_question < 0) return false;
		if (game_state.quiz_data.questions[game_state.selected_question]?.type === QuizQuestionType.SLIDE) return false;
		return game_state.timer_res === '0' && game_state.question_results === null;
	});

	let resultsCountdown = $state(5);
	let resultsInterval: any = null;
	let resultsTriggered = false;
	let isResultsPaused = $state(false);

	const triggerShowResults = () => {
		if (resultsTriggered) return;
		resultsTriggered = true;
		if (resultsInterval) {
			clearInterval(resultsInterval);
			resultsInterval = null;
		}
		if (game_state.quiz_data?.questions?.[game_state.selected_question]?.hide_results === true) {
			socket_game_controls.get_question_results(game_token, game_state.shown_question_now);
			setTimeout(() => {
				socket_game_controls.set_question_number(game_state.selected_question + 1);
			}, 200);
		} else {
			socket_game_controls.get_question_results(game_token, game_state.shown_question_now);
		}
	};

	const toggleResultsPause = (e: MouseEvent) => {
		e.stopPropagation();
		isResultsPaused = !isResultsPaused;
		if (isResultsPaused && resultsInterval) {
			clearInterval(resultsInterval);
			resultsInterval = null;
		} else if (!isResultsPaused && isQuestionFinishedWaitingResults && !resultsInterval) {
			startResultsCountdown();
		}
	};

	const startResultsCountdown = () => {
		if (resultsInterval) clearInterval(resultsInterval);
		resultsInterval = setInterval(() => {
			if (resultsCountdown > 1) {
				resultsCountdown -= 1;
			} else {
				resultsCountdown = 0;
				clearInterval(resultsInterval);
				resultsInterval = null;
				triggerShowResults();
			}
		}, 1000);
	};

	$effect(() => {
		if (isQuestionFinishedWaitingResults && !resultsInterval && !resultsTriggered && !isResultsPaused) {
			resultsCountdown = 5;
			startResultsCountdown();
		}

		if (!isQuestionFinishedWaitingResults) {
			if (resultsInterval) {
				clearInterval(resultsInterval);
				resultsInterval = null;
			}
			resultsTriggered = false;
			resultsCountdown = 5;
			isResultsPaused = false;
		}

		return () => {
			if (resultsInterval) {
				clearInterval(resultsInterval);
				resultsInterval = null;
			}
		};
	});

	// 2. Počítadlo 10 až 0: čiastočné výsledky -> ďalšia otázka
	let isPartialResultsShowing = $derived.by(() => {
		if (!game_state.quiz_data?.questions?.length || game_state.selected_question < 0) return false;
		const isLast = game_state.selected_question + 1 === game_state.quiz_data.questions.length;
		if (isLast) return false;
		return game_state.timer_res === '0' && game_state.question_results !== null;
	});

	let nextQuestionCountdown = $state(10);
	let nextQuestionInterval: any = null;
	let nextQuestionTriggered = false;
	let isNextQuestionPaused = $state(false);

	const triggerNextQuestion = () => {
		if (nextQuestionTriggered) return;
		nextQuestionTriggered = true;
		if (nextQuestionInterval) {
			clearInterval(nextQuestionInterval);
			nextQuestionInterval = null;
		}
		socket_game_controls.set_question_number(game_state.selected_question + 1);
	};

	const toggleNextQuestionPause = (e: MouseEvent) => {
		e.stopPropagation();
		isNextQuestionPaused = !isNextQuestionPaused;
		if (isNextQuestionPaused && nextQuestionInterval) {
			clearInterval(nextQuestionInterval);
			nextQuestionInterval = null;
		} else if (!isNextQuestionPaused && isPartialResultsShowing && !nextQuestionInterval) {
			startNextQuestionCountdown();
		}
	};

	const startNextQuestionCountdown = () => {
		if (nextQuestionInterval) clearInterval(nextQuestionInterval);
		nextQuestionInterval = setInterval(() => {
			if (nextQuestionCountdown > 1) {
				nextQuestionCountdown -= 1;
			} else {
				nextQuestionCountdown = 0;
				clearInterval(nextQuestionInterval);
				nextQuestionInterval = null;
				triggerNextQuestion();
			}
		}, 1000);
	};

	$effect(() => {
		if (isPartialResultsShowing && !nextQuestionInterval && !nextQuestionTriggered && !isNextQuestionPaused) {
			nextQuestionCountdown = 10;
			startNextQuestionCountdown();
		}

		if (!isPartialResultsShowing) {
			if (nextQuestionInterval) {
				clearInterval(nextQuestionInterval);
				nextQuestionInterval = null;
			}
			nextQuestionTriggered = false;
			nextQuestionCountdown = 10;
			isNextQuestionPaused = false;
		}

		return () => {
			if (nextQuestionInterval) {
				clearInterval(nextQuestionInterval);
				nextQuestionInterval = null;
			}
		};
	});

	// Reset pri zmene otázky
	let lastQuestionIndex = $state(game_state.selected_question);
	$effect(() => {
		if (game_state.selected_question !== lastQuestionIndex) {
			lastQuestionIndex = game_state.selected_question;
			finalResultsTriggered = false;
			resultsTriggered = false;
			nextQuestionTriggered = false;
			isResultsPaused = false;
			isNextQuestionPaused = false;
			resultsCountdown = 5;
			nextQuestionCountdown = 10;
			if (resultsInterval) {
				clearInterval(resultsInterval);
				resultsInterval = null;
			}
			if (nextQuestionInterval) {
				clearInterval(nextQuestionInterval);
				nextQuestionInterval = null;
			}
		}
	});
</script>

{#if isLastQuestionResults}
	<!-- Veľká slávnostná karta vyhodnotenia a stupňov víťazov V STREDE OBRAZOVKY -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto select-none animate-fade-in">
		<!-- Žiariace ambientné orby v pozadí modalu -->
		<div class="absolute w-96 h-96 bg-amber-500/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
		<div class="absolute w-80 h-80 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none"></div>

		<div class="relative w-full max-w-lg bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl border-2 border-amber-400/80 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(245,158,11,0.35)] text-center flex flex-col items-center overflow-hidden ring-4 ring-amber-400/20">
			<!-- Horná zlatá lišta -->
			<div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

			<!-- Horný štítok -->
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase mb-4 shadow-inner">
				<span class="relative flex h-2.5 w-2.5">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
				</span>
				<span>Všetky otázky zodpovedané</span>
			</div>

			<!-- Trofej a titulok -->
			<div class="text-6xl sm:text-7xl mb-2 animate-bounce">🏆</div>
			<h2 class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 tracking-tight">
				Koniec kvízu!
			</h2>
			<p class="text-xs sm:text-sm text-slate-300 font-medium mt-1 mb-2">
				Pripravte sa na slávnostné stupne víťazov
			</p>

			<!-- Animované odpočítavanie s číslami rastúcimi stále väčšie a väčšie -->
			<div class="relative w-40 h-36 sm:w-48 sm:h-44 flex flex-col items-center justify-center my-2">
				<div class="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/40 animate-spin-slow"></div>
				<div class="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-amber-500/10 blur-xl animate-pulse"></div>

				{#key countdown}
					<div
						class="animate-pop-zoom font-decorative font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 drop-shadow-[0_10px_35px_rgba(245,158,11,0.9)] select-none leading-none {countdown === 5 ? 'text-7xl scale-100' : countdown === 4 ? 'text-8xl scale-110' : countdown === 3 ? 'text-9xl scale-125' : countdown === 2 ? 'text-9xl sm:text-[8.5rem] scale-140' : 'text-9xl sm:text-[10rem] scale-160'}"
					>
						{countdown}
					</div>
				{/key}
			</div>

			<span class="text-xs uppercase tracking-widest font-extrabold text-amber-300/80 mb-2">
				Automatické prepnutie za {countdown}s
			</span>

			<!-- Veľké prominentné tlačidlo Zobraziť stupne víťazov -->
			<button
				type="button"
				onclick={triggerFinalResults}
				class="group relative w-full py-4 sm:py-5 px-6 sm:px-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl sm:text-2xl tracking-wide shadow-[0_15px_40px_rgba(245,158,11,0.5)] border-2 border-amber-200 ring-4 ring-amber-400/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3.5 mt-4"
			>
				<span class="text-2xl sm:text-3xl">🏆</span>
				<span class="drop-shadow-sm font-extrabold tracking-tight">Zobraziť stupne víťazov</span>
				<div class="p-1.5 rounded-xl bg-black/15 text-slate-950 group-hover:translate-x-1.5 transition-transform">
					<svg class="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</div>
			</button>
		</div>
	</div>
{:else}
	<!-- Hore v pravom rohu: počítadlo 5 až 0 (prepnutie na čiastočné výsledky) -->
	{#if isQuestionFinishedWaitingResults}
		<div class="fixed top-3 sm:top-4 right-3 sm:right-5 z-50 pointer-events-auto animate-fade-in select-none">
			<div
				role="button"
				tabindex="0"
				onclick={triggerShowResults}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerShowResults(); }}
				class="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-sky-400 shadow-2xl shadow-sky-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-sky-500/20"
				title="Zobraziť výsledky (alebo počkajte na automatické prepnutie)"
			>
				<div class="relative w-8 h-8 rounded-full bg-sky-500/25 border-2 border-sky-400 flex items-center justify-center shrink-0">
					{#key resultsCountdown}
						<span class="font-mono font-black text-sm sm:text-base text-sky-300 drop-shadow">
							{resultsCountdown}
						</span>
					{/key}
					{#if !isResultsPaused}
						<span class="absolute inset-0 rounded-full border border-sky-400 animate-ping opacity-40"></span>
					{/if}
				</div>
				<div class="flex flex-col text-left pr-1">
					<span class="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-sky-400">
						Výsledky za
					</span>
					<span class="text-xs sm:text-sm font-black text-white leading-tight">
						{resultsCountdown} s
					</span>
				</div>
				<button
					type="button"
					onclick={toggleResultsPause}
					class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0 ml-0.5 cursor-pointer"
					title={isResultsPaused ? 'Spustiť odpočítavanie' : 'Pozastaviť odpočítavanie'}
					aria-label={isResultsPaused ? 'Spustiť' : 'Pozastaviť'}
				>
					{#if isResultsPaused}
						<svg class="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					{:else}
						<svg class="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Hore v pravom rohu na čiastočných výsledkoch: počítadlo 10 až 0 (prepnutie na ďalšiu otázku) -->
	{#if isPartialResultsShowing}
		<div class="fixed top-3 sm:top-4 right-3 sm:right-5 z-50 pointer-events-auto animate-fade-in select-none">
			<div
				role="button"
				tabindex="0"
				onclick={triggerNextQuestion}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerNextQuestion(); }}
				class="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20"
				title="Ďalšia otázka (alebo počkajte na automatické prepnutie)"
			>
				<div class="relative w-8 h-8 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center shrink-0">
					{#key nextQuestionCountdown}
						<span class="font-mono font-black text-sm sm:text-base text-emerald-300 drop-shadow">
							{nextQuestionCountdown}
						</span>
					{/key}
					{#if !isNextQuestionPaused}
						<span class="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-40"></span>
					{/if}
				</div>
				<div class="flex flex-col text-left pr-1">
					<span class="text-[10px] sm:text-[11px] uppercase font-black tracking-wider text-emerald-400">
						Ďalšia otázka za
					</span>
					<span class="text-xs sm:text-sm font-black text-white leading-tight">
						{nextQuestionCountdown} s
					</span>
				</div>
				<button
					type="button"
					onclick={toggleNextQuestionPause}
					class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0 ml-0.5 cursor-pointer"
					title={isNextQuestionPaused ? 'Spustiť odpočítavanie' : 'Pozastaviť odpočítavanie'}
					aria-label={isNextQuestionPaused ? 'Spustiť' : 'Pozastaviť'}
				>
					{#if isNextQuestionPaused}
						<svg class="w-3.5 h-3.5 fill-current text-emerald-400" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					{:else}
						<svg class="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Normálna horná lišta ovládania počas kvízu -->
	<div
		class="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none w-auto max-w-[95vw] px-2"
	>
		<div class="pointer-events-auto flex items-center justify-center gap-2 sm:gap-3 shrink-0">
			{#if game_state.timer_res === '0' && game_state.selected_question >= 0}
				{#if game_state.selected_question + 1 !== game_state.quiz_data.questions.length && game_state.question_results !== null}
					<button
						onclick={triggerNextQuestion}
						class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20 whitespace-nowrap shrink-0"
					>
						<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-emerald-400/40 shrink-0">
							{$t('words.next', { default: 'Ďalej' })}
						</span>
						<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap inline-flex shrink-0">
							<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
							<span class="font-decorative text-sm sm:text-base md:text-xl font-black text-amber-300 drop-shadow flex items-center gap-0.5">
								<span>{game_state.selected_question + 2}</span>
								<span class="text-slate-400 text-xs font-light">/</span>
								<span class="text-slate-300 text-xs sm:text-sm">{game_state.quiz_data.questions.length}</span>
							</span>
						</span>
						<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0">
							<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</div>
					</button>
				{/if}
				{#if game_state.question_results === null && game_state.selected_question !== -1}
					{#if game_state.quiz_data.questions[game_state.selected_question].type === QuizQuestionType.SLIDE}
						<button
							onclick={() => {
								socket_game_controls.set_question_number(
									game_state.selected_question + 1
								);
							}}
							class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20 whitespace-nowrap shrink-0"
						>
							<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-emerald-400/40 shrink-0">
								{$t('words.next', { default: 'Ďalej' })}
							</span>
							<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap inline-flex shrink-0">
								<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
								<span class="font-decorative text-sm sm:text-base md:text-xl font-black text-amber-300 drop-shadow flex items-center gap-0.5">
									<span>{game_state.selected_question + 2}</span>
									<span class="text-slate-400 text-xs font-light">/</span>
									<span class="text-slate-300 text-xs sm:text-sm">{game_state.quiz_data.questions.length}</span>
								</span>
							</span>
							<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0">
								<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</div>
						</button>
					{:else if game_state.quiz_data.questions[game_state.selected_question]?.hide_results === true}
						<button
							onclick={() => {
								socket_game_controls.get_question_results(
									game_token,
									game_state.shown_question_now
								);
								setTimeout(() => {
									socket_game_controls.set_question_number(
										game_state.selected_question + 1
									);
								}, 200);
							}}
							class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20 whitespace-nowrap shrink-0"
						>
							<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-emerald-400/40 shrink-0">
								{$t('words.next', { default: 'Ďalej' })}
							</span>
							<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap inline-flex shrink-0">
								<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
								<span class="font-decorative text-sm sm:text-base md:text-xl font-black text-amber-300 drop-shadow flex items-center gap-0.5">
									<span>{game_state.selected_question + 2}</span>
									<span class="text-slate-400 text-xs font-light">/</span>
									<span class="text-slate-300 text-xs sm:text-sm">{game_state.quiz_data.questions.length}</span>
								</span>
							</span>
							<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0">
								<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</div>
						</button>
					{:else}
						<button
							onclick={triggerShowResults}
							class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-sky-400/70 shadow-2xl shadow-sky-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-sky-500/20 whitespace-nowrap shrink-0"
						>
							<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-sky-300 bg-sky-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-sky-400/40 shrink-0">
								{$t('words.results', { default: 'Výsledky' })}
							</span>
							<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide flex items-center gap-2 whitespace-nowrap inline-flex shrink-0">
								<span>{$t('admin_page.show_results')}</span>
							</span>
							<div class="p-1 rounded-lg bg-sky-500/20 text-sky-300 group-hover:scale-110 transition-transform shrink-0">
								<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
						</button>
					{/if}
				{/if}
			{:else if game_state.selected_question !== -1}
				{#if game_state.quiz_data.questions[game_state.selected_question].type === QuizQuestionType.SLIDE}
					<button
						onclick={() => {
							socket_game_controls.set_question_number(game_state.selected_question + 1);
						}}
						class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20 whitespace-nowrap shrink-0"
					>
						<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-emerald-400/40 shrink-0">
							{$t('words.next', { default: 'Ďalej' })}
						</span>
						<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide flex items-center gap-1.5 sm:gap-2 whitespace-nowrap inline-flex shrink-0">
							<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
							<span class="font-decorative text-sm sm:text-base md:text-xl font-black text-amber-300 drop-shadow flex items-center gap-0.5">
								<span>{game_state.selected_question + 2}</span>
								<span class="text-slate-400 text-xs font-light">/</span>
								<span class="text-slate-300 text-xs sm:text-sm">{game_state.quiz_data.questions.length}</span>
							</span>
						</span>
						<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0">
							<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</div>
					</button>
				{:else}
					<button
						onclick={show_solutions}
						class="group flex flex-nowrap items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-rose-500/60 shadow-2xl shadow-rose-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-rose-500/20 whitespace-nowrap shrink-0"
					>
						<span class="text-[10px] sm:text-xs uppercase font-black tracking-widest text-rose-300 bg-rose-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-rose-400/40 shrink-0 flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
							STOP
						</span>
						<span class="font-extrabold text-xs sm:text-sm md:text-base lg:text-lg text-white tracking-wide whitespace-nowrap inline-block shrink-0">
							{$t('admin_page.stop_time_and_solutions')}
						</span>
						<div class="p-1 rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform shrink-0">
							<svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24">
								<rect x="6" y="6" width="12" height="12" rx="2" />
							</svg>
						</div>
					</button>
				{/if}
			{/if}

			{#if game_state.selected_question !== -1}
				<!-- Tlačidlo: Ukončiť test (v osobitnom ovále napravo) -->
				<button
					type="button"
					onclick={() => (show_end_confirm = true)}
					class="group flex flex-nowrap items-center gap-2 sm:gap-2.5 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-rose-500/60 hover:border-rose-400 shadow-2xl shadow-rose-950/40 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-rose-500/20 whitespace-nowrap shrink-0"
					title="Ukončiť test a prejsť na vyhodnotenie"
				>
					<!-- Červená ikonka krížika v ovále naľavo pred textom -->
					<span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/25 border border-rose-400/50 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
						<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</span>
					<span class="font-extrabold text-xs sm:text-sm md:text-base text-rose-200 group-hover:text-white tracking-wide shrink-0">
						Ukončiť test
					</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Potvrdzovacie dialógové okno: Naozaj ukončiť test? -->
	{#if show_end_confirm}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none"
			transition:fade={{ duration: 150 }}
		>
			<div
				class="relative w-full max-w-md bg-slate-900/95 dark:bg-black/95 backdrop-blur-2xl border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(244,63,94,0.35)] text-center flex flex-col items-center overflow-hidden ring-4 ring-rose-500/20"
				transition:scale={{ duration: 200, start: 0.9 }}
			>
				<!-- Horná červená lišta -->
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-400 to-rose-600"></div>

				<!-- Ikonka krížika -->
				<div class="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400/60 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/20">
					<svg class="w-8 h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</div>

				<h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
					Naozaj ukončiť test?
				</h3>
				<p class="text-sm text-slate-300 font-medium mb-6 leading-relaxed">
					Zostávajúce otázky sa preskočia a okamžite sa zobrazí konečné vyhodnotenie a stupne víťazov s doterajšími bodmi.
				</p>

				<!-- Tlačidlá Áno / Nie -->
				<div class="flex items-center justify-center gap-3 w-full">
					<button
						type="button"
						onclick={() => (show_end_confirm = false)}
						class="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-600/80 transition-all cursor-pointer hover:scale-105 active:scale-95"
					>
						Nie
					</button>
					<button
						type="button"
						onclick={handleConfirmEndTest}
						class="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/30 border border-rose-400/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
					>
						Áno
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	@keyframes popZoom {
		0% {
			transform: scale(0.35);
			opacity: 0;
			filter: blur(8px);
		}
		50% {
			transform: scale(1.18);
			opacity: 1;
			filter: blur(0px);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	.animate-pop-zoom {
		animation: popZoom 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes spinSlow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.animate-spin-slow {
		animation: spinSlow 12s linear infinite;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.animate-fade-in {
		animation: fadeIn 0.3s ease-out forwards;
	}
</style>

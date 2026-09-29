<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { QuizQuestionType } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import { SocketGameControls } from '$lib/play/admin/socket_game_controls.ts';
	import type { GameState } from '$lib/play/admin/game_state.ts';

	interface Props {
		bg_color: string;
		socket_game_controls: SocketGameControls;
		game_token: string;
		game_state: GameState;
	}

	let { bg_color, socket_game_controls, game_token, game_state = $bindable() }: Props = $props();

	const { t } = getLocalization();

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
	<!-- Normálna horná lišta ovládania počas kvízu -->
	<div
		class="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none w-full max-w-xl px-4"
	>
		<div class="pointer-events-auto">
			{#if game_state.timer_res === '0' && game_state.selected_question >= 0}
				{#if game_state.selected_question + 1 !== game_state.quiz_data.questions.length && game_state.question_results !== null}
					<button
						onclick={() => {
							socket_game_controls.set_question_number(game_state.selected_question + 1);
						}}
						class="group flex items-center gap-3.5 px-7 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20"
					>
						<span class="text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/40 shrink-0">
							{$t('words.next', { default: 'Ďalej' })}
						</span>
						<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
							<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
							<span class="font-decorative text-xl sm:text-3xl font-black text-amber-300 drop-shadow flex items-center gap-1">
								<span>{game_state.selected_question + 2}</span>
								<span class="text-slate-400 text-sm sm:text-base font-light">/</span>
								<span class="text-slate-300 text-sm sm:text-lg">{game_state.quiz_data.questions.length}</span>
							</span>
						</span>
						<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
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
							class="group flex items-center gap-3.5 px-7 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20"
						>
							<span class="text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/40 shrink-0">
								{$t('words.next', { default: 'Ďalej' })}
							</span>
							<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
								<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
								<span class="font-decorative text-xl sm:text-3xl font-black text-amber-300 drop-shadow flex items-center gap-1">
									<span>{game_state.selected_question + 2}</span>
									<span class="text-slate-400 text-sm sm:text-base font-light">/</span>
									<span class="text-slate-300 text-sm sm:text-lg">{game_state.quiz_data.questions.length}</span>
								</span>
							</span>
							<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
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
							class="group flex items-center gap-3.5 px-7 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20"
						>
							<span class="text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/40 shrink-0">
								{$t('words.next', { default: 'Ďalej' })}
							</span>
							<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
								<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
								<span class="font-decorative text-xl sm:text-3xl font-black text-amber-300 drop-shadow flex items-center gap-1">
									<span>{game_state.selected_question + 2}</span>
									<span class="text-slate-400 text-sm sm:text-base font-light">/</span>
									<span class="text-slate-300 text-sm sm:text-lg">{game_state.quiz_data.questions.length}</span>
								</span>
							</span>
							<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</div>
						</button>
					{:else}
						<button
							onclick={() =>
								socket_game_controls.get_question_results(
									game_token,
									game_state.shown_question_now
								)}
							class="group flex items-center gap-3.5 px-8 sm:px-11 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-sky-400/70 shadow-2xl shadow-sky-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-sky-500/20"
						>
							<span class="text-xs uppercase font-black tracking-widest text-sky-300 bg-sky-500/20 px-3 py-1 rounded-xl border border-sky-400/40 shrink-0">
								{$t('words.results', { default: 'Výsledky' })}
							</span>
							<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
								<span>{$t('admin_page.show_results')}</span>
							</span>
							<div class="p-1 rounded-lg bg-sky-500/20 text-sky-300 group-hover:scale-110 transition-transform">
								<svg class="w-6 h-6 sm:w-7 sm:h-7 fill-none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
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
						class="group flex items-center gap-3.5 px-7 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20"
					>
						<span class="text-xs uppercase font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-400/40 shrink-0">
							{$t('words.next', { default: 'Ďalej' })}
						</span>
						<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide flex items-center gap-2">
							<span>{$t('admin_page.next_question_title', { default: 'Ďalšia otázka' })}</span>
							<span class="font-decorative text-xl sm:text-3xl font-black text-amber-300 drop-shadow flex items-center gap-1">
								<span>{game_state.selected_question + 2}</span>
								<span class="text-slate-400 text-sm sm:text-base font-light">/</span>
								<span class="text-slate-300 text-sm sm:text-lg">{game_state.quiz_data.questions.length}</span>
							</span>
						</span>
						<div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:translate-x-1 transition-transform">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</div>
					</button>
				{:else}
					<button
						onclick={show_solutions}
						class="group flex items-center gap-3.5 px-7 sm:px-10 py-3 sm:py-3.5 rounded-2xl bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl border-2 border-rose-500/60 shadow-2xl shadow-rose-500/30 text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-rose-500/20"
					>
						<span class="text-xs uppercase font-black tracking-widest text-rose-300 bg-rose-500/20 px-3 py-1 rounded-xl border border-rose-400/40 shrink-0 flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
							STOP
						</span>
						<span class="font-extrabold text-lg sm:text-2xl text-white tracking-wide">
							{$t('admin_page.stop_time_and_solutions')}
						</span>
						<div class="p-1 rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
							<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
								<rect x="6" y="6" width="12" height="12" rx="2" />
							</svg>
						</div>
					</button>
				{/if}
			{/if}
		</div>
	</div>
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

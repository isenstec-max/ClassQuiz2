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
</script>

<div
	class="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none w-full max-w-xl px-4"
>
	<div class="pointer-events-auto">
		{#if game_state.selected_question + 1 === game_state.quiz_data.questions.length && ((game_state.timer_res === '0' && game_state.question_results !== null) || game_state.quiz_data?.questions?.[game_state.selected_question]?.type === QuizQuestionType.SLIDE)}
			{#if JSON.stringify(game_state.final_results) === JSON.stringify([null])}
				<button
					onclick={() => socket_game_controls.get_final_results()}
					class="group flex items-center gap-3 px-8 sm:px-11 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 font-black text-lg sm:text-2xl tracking-wide shadow-2xl shadow-amber-500/40 border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-amber-400/30 animate-bounce"
				>
					<span class="text-2xl sm:text-3xl">🏆</span>
					<span class="drop-shadow-sm">
						{$t('admin_page.get_final_results')}
					</span>
				</button>
			{/if}
		{:else if game_state.timer_res === '0' && game_state.selected_question >= 0}
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

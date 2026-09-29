<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { getLocalization } from '$lib/i18n';
	import { socket } from './socket';
	import { QuizQuestionType } from '$lib/quiz_types';
	import Spinner from '$lib/Spinner.svelte';
	import Controls from '$lib/play/admin/controls.svelte';
	import Question from '$lib/play/admin/question.svelte';
	import { SocketGameControls } from '$lib/play/admin/socket_game_controls.ts';
	import type { IGameState } from '$lib/play/admin/game_state.ts';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { parsePlayer } from '$lib/avatars';

	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const { t } = getLocalization();
	const default_colors = DEFAULT_ANSWER_COLORS;

	let final_results_clicked = $state(false);
	let timer_interval: NodeJS.Timeout;

	interface Props {
		game_token: string;
		game_pin?: string;
		bg_color: string;
		game_state: IGameState;
	}

	let { game_token, game_pin = '', bg_color, game_state = $bindable() }: Props = $props();

	socket.on('get_question_results', () => {
		console.log('get_question_results');
	});
	socket.on('set_question_number', (data) => {
		game_state.timer_res = '0';
		game_state.question_results = null;
		game_state.shown_question_now = data.question_index;
		game_state.timer_res = game_state.quiz_data.questions[data.question_index].time;
		game_state.selected_question = game_state.selected_question + 1;
		game_state.answer_count = 0;

		clearInterval(timer_interval);
		timer(game_state.timer_res);
	});

	socket.on('solutions', (_) => {
		game_state.timer_res = '0';
		clearInterval(timer_interval);
	});

	socket.on('final_results', (data) => {
		final_results_clicked = true;
		game_state.timer_res = '0';
		game_state.final_results = data;
	});

	socket.on('everyone_answered', (_) => {
		game_state.timer_res = '0';
	});

	socket.on('question_results', (data) => {
		game_state.question_results = data;
		game_state.timer_res = '0';
	});

	socket.on('player_answer', (_) => {
		game_state.answer_count += 1;
	});

	const timer = (time: string) => {
		let seconds = Number(time);
		timer_interval = setInterval(() => {
			if (game_state.timer_res === '0') {
				clearInterval(timer_interval);
				return;
			} else {
				seconds--;
			}

			game_state.timer_res = seconds.toString();
		}, 1000);
	};

	const socket_game_controls: SocketGameControls = new SocketGameControls(socket);

	let time_ratio = $derived.by(() => {
		try {
			if (!game_state.quiz_data || game_state.selected_question < 0) return 1;
			const total = parseInt(
				game_state.quiz_data.questions[game_state.selected_question].time
			);
			const current = parseInt(game_state.timer_res);
			if (!total || isNaN(total) || total <= 0) return 1;
			return current / total;
		} catch {
			return 1;
		}
	});

	let timer_bar_class = $derived.by(() => {
		if (time_ratio > 0.5) return 'bg-emerald-500';
		if (time_ratio > 0.25) return 'bg-amber-500';
		return 'bg-red-500';
	});
</script>

{#if game_state.control_visible}
	<Controls {bg_color} {socket_game_controls} {game_token} bind:game_state />
{/if}
{#if game_state.timer_res !== '0' && game_state.selected_question >= 0}
	<span
		class="fixed top-0 left-0 {timer_bar_class} h-2.5 md:h-3 transition-all duration-300 shadow-md z-40"
		style="width: {(100 /
			parseInt(game_state.quiz_data.questions[game_state.selected_question].time)) *
			parseInt(game_state.timer_res)}vw"
	></span>
{/if}

<div
	class="w-full h-full min-h-screen"
	class:pt-14={game_state.control_visible}
	class:md:pt-16={game_state.control_visible}
	class:pt-6={!game_state.control_visible}
>
	{#if game_state.timer_res !== undefined && !final_results_clicked && !game_state.question_results}
		<!-- Question is shown -->
		{#if game_state.quiz_data.questions[game_state.selected_question].type === QuizQuestionType.SLIDE}
			{#await import('$lib/play/admin/slide.svelte')}
				<Spinner my_20={false} />
			{:then c}
				<c.default
					question={game_state.quiz_data.questions[game_state.selected_question]}
				/>
			{/await}
		{:else}
			<Question
				quiz_data={game_state.quiz_data}
				selected_question={game_state.selected_question}
				timer_res={game_state.timer_res}
				answer_count={game_state.answer_count}
				{default_colors}
				{game_pin}
			/>
		{/if}
	{/if}
	{#if game_state.timer_res === '0' && JSON.stringify(game_state.final_results) === JSON.stringify( [null] ) && game_state.quiz_data.questions[game_state.selected_question].type !== QuizQuestionType.SLIDE && game_state.question_results !== null && game_state.quiz_data.questions[game_state.selected_question]?.hide_results !== true}
		{#if game_state.question_results === undefined}
			{#if !final_results_clicked}
				<div class="w-full flex justify-center">
					<h1 class="text-3xl">{$t('admin_page.no_answers')}</h1>
				</div>
			{/if}
		{:else if game_state.quiz_data.questions[game_state.selected_question].type === QuizQuestionType.VOTING}
			{#await import('$lib/play/admin/results.svelte')}
				<Spinner />
			{:then c}
				<c.default
					bind:data={game_state.player_scores}
					question={game_state.quiz_data.questions[game_state.selected_question]}
					new_data={game_state.question_results}
					{game_pin}
					players={game_state.players}
					question_index={game_state.selected_question + 1}
					total_questions={game_state.quiz_data?.questions?.length || 1}
				/>
			{/await}
		{:else}
			{#await import('$lib/play/admin/results.svelte')}
				<Spinner />
			{:then c}
				<c.default
					bind:data={game_state.player_scores}
					question={game_state.quiz_data.questions[game_state.selected_question]}
					new_data={game_state.question_results}
					{game_pin}
					players={game_state.players}
					question_index={game_state.selected_question + 1}
					total_questions={game_state.quiz_data?.questions?.length || 1}
				/>
			{/await}
		{/if}
	{/if}
	{#if game_state.selected_question === -1}
		<div class="relative w-full min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 md:p-8 overflow-hidden select-none">
			<!-- Žiariace ambientné orby v pozadí -->
			<div class="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-emerald-500/25 to-teal-400/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
			<div class="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

			<!-- Plávajúce geometrické tvary odpovedí v pozadí -->
			<div class="absolute top-12 left-12 md:left-20 opacity-25 pointer-events-none animate-float-1">
				<AnswerShape shapeIndex={0} class="w-14 h-14 md:w-20 md:h-20 text-red-400 drop-shadow-xl" />
			</div>
			<div class="absolute bottom-16 left-12 md:left-24 opacity-25 pointer-events-none animate-float-2">
				<AnswerShape shapeIndex={1} class="w-16 h-16 md:w-24 md:h-24 text-blue-400 drop-shadow-xl" />
			</div>
			<div class="absolute top-16 right-12 md:right-24 opacity-25 pointer-events-none animate-float-3">
				<AnswerShape shapeIndex={2} class="w-14 h-14 md:w-20 md:h-20 text-amber-400 drop-shadow-xl" />
			</div>
			<div class="absolute bottom-20 right-12 md:right-28 opacity-25 pointer-events-none animate-float-4">
				<AnswerShape shapeIndex={3} class="w-16 h-16 md:w-22 md:h-22 text-emerald-400 drop-shadow-xl" />
			</div>

			<!-- Hlavná uvítacia karta kvízu -->
			<div class="relative z-10 w-full max-w-4xl bg-slate-900/85 dark:bg-black/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 md:p-14 border border-white/20 shadow-2xl text-center flex flex-col items-center">
				<!-- Horný badge -->
				<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs md:text-sm font-black tracking-widest uppercase mb-6 shadow-inner">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</span>
					<span>Kvíz je pripravený</span>
				</div>

				<!-- Názov kvízu s gradientom a okrasným fontom -->
				<h1 class="font-decorative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] leading-tight mb-4">
					{@html game_state.quiz_data.title}
				</h1>

				<!-- Popis kvízu (ak je zadaný) -->
				{#if game_state.quiz_data.description}
					<div class="inline-block px-6 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100 font-bold text-lg md:text-2xl shadow-lg mt-2 max-w-2xl">
						{@html game_state.quiz_data.description}
					</div>
				{/if}

				<!-- Obalový obrázok (ak existuje) -->
				{#if game_state.quiz_data.cover_image}
					<div class="mt-8 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl max-h-[30vh] w-auto">
						<img
							class="max-h-[30vh] max-w-full object-contain block mx-auto"
							src="/api/v1/storage/download/{game_state.quiz_data.cover_image}"
							alt="Cover obrázok"
						/>
					</div>
				{/if}

				<!-- Prihlásení hráči s karikatúrami -->
				{#if game_state.players && game_state.players.length > 0}
					<div class="mt-8 pt-6 border-t border-white/10 w-full flex flex-col items-center">
						<span class="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
							Prihlásení hráči ({game_state.players.length})
						</span>
						<div class="flex flex-wrap items-center justify-center gap-2 max-w-2xl max-h-36 overflow-y-auto pr-1">
							{#each game_state.players as p}
								{@const parsed = parsePlayer(p.username)}
								<div class="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700/60 shadow-md">
									<AnimalAvatar avatarId={parsed.avatarId} size={24} />
									<span class="text-xs md:text-sm font-bold text-white truncate max-w-[120px]">{parsed.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Spodná infolišta: PIN, Počet otázok, Inštrukcia -->
				<div class="mt-8 pt-6 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm">
					{#if game_pin}
						<div class="flex items-center gap-2 bg-slate-800/95 px-4 py-2 rounded-xl border border-white/15 shadow">
							<span class="text-slate-400 font-bold uppercase tracking-wider">PIN hry:</span>
							<span class="text-amber-400 font-black font-mono text-base tracking-widest">{game_pin}</span>
						</div>
					{/if}
					<div class="flex items-center gap-2 bg-slate-800/95 px-4 py-2 rounded-xl border border-white/15 text-slate-200 font-bold shadow">
						<span>📝 {game_state.quiz_data.questions.length} otázok</span>
					</div>
					<div class="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30 font-extrabold shadow">
						<span>👉 Pokračujte kliknutím na tlačidlo hore</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes floatSlow1 {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-16px) rotate(6deg);
		}
	}
	@keyframes floatSlow2 {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(16px) rotate(-6deg);
		}
	}
	@keyframes floatSlow3 {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-14px) rotate(-5deg);
		}
	}
	@keyframes floatSlow4 {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(14px) rotate(5deg);
		}
	}
	.animate-float-1 {
		animation: floatSlow1 7s ease-in-out infinite;
	}
	.animate-float-2 {
		animation: floatSlow2 9s ease-in-out infinite;
	}
	.animate-float-3 {
		animation: floatSlow3 8s ease-in-out infinite;
	}
	.animate-float-4 {
		animation: floatSlow4 10s ease-in-out infinite;
	}
</style>

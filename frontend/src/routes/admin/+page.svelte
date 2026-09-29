<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { socket } from '$lib/socket';
	import { getLocalization } from '$lib/i18n';
	import { navbarVisible } from '$lib/stores.svelte.ts';
	import SomeAdminScreen from '$lib/admin.svelte';
	import GameNotStarted from '$lib/play/admin/game_not_started.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import FinalResults from '$lib/play/admin/final_results.svelte';
	import { page } from '$app/state';
	import { SocketGameControls } from '$lib/play/admin/socket_game_controls.ts';
	import type { IGameState } from '$lib/play/admin/game_state.ts';
	import { QuizQuestionType, type QuizData } from '$lib/quiz_types';
	import type { Player, PlayerAnswer } from '$lib/admin';
	import { tinykeys } from '$lib/tinykeys';

	navbarVisible.visible = false;

	const { t } = getLocalization();

	// let gameData = {
	// 	game_id: 'a7ddb6af-79ab-45e0-b996-6254c1ad9818',
	// 	game_pin: '66190765'

	interface Props {
		// };
		data: any;
	}

	class GameState implements IGameState {
		public game_id: string;
		public players: Player[];
		public player_scores: Record<string, number>;
		public selected_question: number;
		public timer_res: string;
		public question_results: any;
		public answer_count: number;
		public shown_question_now: number;
		public final_results: Array<null> | Array<Array<PlayerAnswer>>;
		public game_started: boolean;
		public quiz_data: QuizData;
		public control_visible: boolean;

		constructor(game_id: string) {
			this.game_id = game_id;
			this.players = $state([]);
			this.player_scores = $state({});
			this.selected_question = $state(-1);
			this.timer_res = $state(undefined);
			this.quiz_data = $state(null);
			this.control_visible = $state(true);
			this.shown_question_now = $state(-1);
			this.final_results = $state([null]);
			this.game_started = $state(false);
			this.question_results = $state(null);
			this.answer_count = $state(0);
		}

		is_game_ready_to_start(): boolean {
			return !this.game_started && this.players.length > 0;
		}

		is_game_starting(): boolean {
			return this.game_started && this.selected_question === -1;
		}

		is_active_question_last_question(): boolean {
			return this.selected_question + 1 === this.quiz_data.questions.length;
		}

		is_question_results_visible(): boolean {
			return this.timer_res === '0' && this.question_results !== null;
		}

		is_active_question_slide(): boolean {
			return (
				this.quiz_data?.questions?.[this.selected_question]?.type === QuizQuestionType.SLIDE
			);
		}

		is_question_ended(): boolean {
			return (
				this.timer_res === '0' &&
				this.question_results === null &&
				this.selected_question !== -1
			);
		}

		is_question_still_ongoing(): boolean {
			return this.timer_res !== '0' && this.selected_question !== -1;
		}
	}

	let { data }: Props = $props();
	let game_mode = $state();
	let { auto_connect, game_token } = $state(data);
	const game_pin = data.game_pin;
	let errorMessage = $state('');
	let success = $state(false);
	let dataexport_download_a: HTMLAnchorElement | undefined = $state();
	let warnToLeave = true;
	let export_token = $state(undefined);
	let downloading = $state(false);
	let download_success = $state(false);

	const socket_game_controls: SocketGameControls = new SocketGameControls(socket);
	let game_state: GameState = $state(new GameState(game_token));

	const connect = async () => {
		socket.emit('register_as_admin', {
			game_pin: game_pin,
			game_id: game_token
		});
		const res = await fetch(`/api/v1/quiz/play/check_captcha/${game_pin}`);
		const json = await res.json();
		game_mode = json.game_mode;
	};
	onMount(() => {
		if (auto_connect) {
			connect();
		}
		tinykeys(window, {
			Enter: next_action,
			Space: next_action
		});
	});
	socket.on('session_id', (d) => {
		const session_id = d.session_id;
	});

	socket.on('registered_as_admin', (data) => {
		game_state.quiz_data = JSON.parse(data['game']);
		console.log(game_state.quiz_data);
		success = true;
	});
	socket.on('player_joined', (int_data) => {
		game_state.players = [...game_state.players, int_data];
	});
	socket.on('already_registered_as_admin', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		errorMessage = $t('admin_page.already_registered_as_admin');
	});

	socket.on('start_game', (_) => {
		game_state.game_started = true;
	});

	socket.on('control_visibility', (data) => {
		game_state.control_visible = data.visible;
	});

	/*	socket.on('question_results', (int_data) => {
        try {
            int_data = JSON.parse(int_data);
        } catch (e) {
            console.error('Failed to parse question results');
            return;
        }
        question_results = int_data;
    });*/
	socket.on('export_token', (int_data) => {
		warnToLeave = false;
		if (dataexport_download_a) {
			dataexport_download_a.href = `/api/v1/quiz/export_data/${int_data}?ts=${new Date().getTime()}&game_pin=${game_pin}`;
			dataexport_download_a.click();
		}
		downloading = false;
		download_success = true;

		setTimeout(() => {
			warnToLeave = true;
		}, 200);

		setTimeout(() => {
			download_success = false;
		}, 3500);
	});

	socket.on('results_saved_successfully', (_) => {
		results_saved = true;
	});

	const confirmUnload = () => {
		if (warnToLeave) {
			event.preventDefault();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			event.returnValue = '';
		}
	};

	const request_answer_export = (e?: Event) => {
		if (e) e.preventDefault();
		if (downloading) return;
		downloading = true;
		if (!results_saved) {
			socket.emit('save_quiz');
		}
		socket.emit('get_export_token');
	};
	const save_quiz = () => {
		socket.emit('save_quiz');
	};

	$effect(() => {
		if (show_final_results && !results_saved) {
			socket.emit('save_quiz');
		}
	});

	let darkMode = false;
	if (browser) {
		darkMode =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) &&
				window.matchMedia('(prefers-color-scheme: dark)').matches);
	}

	let bg_color = $derived(
		game_state.quiz_data ? game_state.quiz_data.background_color : undefined
	);
	let bg_image = $derived(
		game_state.quiz_data ? game_state.quiz_data.background_image : undefined
	);
	let results_saved = $state(false);

	let show_final_results = $derived(
		JSON.stringify(game_state.final_results) !== JSON.stringify([null])
	);

	// This function in called in every keyboard event in this page
	const next_action = () => {
		if (
			game_state.is_active_question_last_question() &&
			(game_state.is_question_results_visible() || game_state.is_active_question_slide())
		) {
			socket_game_controls.get_final_results();
		} else if (
			game_state.is_game_starting() ||
			game_state.is_question_results_visible() ||
			game_state.is_active_question_slide()
		) {
			socket_game_controls.set_question_number(game_state.selected_question + 1);
		} else if (game_state.is_question_still_ongoing()) {
			socket_game_controls.show_solutions();
			game_state.timer_res = '0';
		} else if (game_state.is_question_ended()) {
			socket_game_controls.get_question_results(game_token, game_state.shown_question_now);
		} else {
			console.warn('No action available for this event');
		}
	};
</script>

<svelte:window onbeforeunload={confirmUnload} />
<svelte:head>
	<title>ClassQuiz2 - Host</title>
</svelte:head>
<div
	class="min-h-screen min-w-full"
	style="background-repeat: no-repeat;background-size: 100% 100%;background-image: {bg_image
		? `url('${bg_image}')`
		: `unset`}; background-color: {bg_color ? bg_color : 'transparent'}"
	class:text-black={bg_color}
>
	{#if !success}
		{#if errorMessage !== ''}
			<div class="flex justify-center items-center min-h-[60vh]">
				<p class="text-red-700 bg-red-100 p-4 rounded-xl border border-red-300 font-bold">{errorMessage}</p>
			</div>
		{:else}
			<div class="flex flex-col justify-center items-center min-h-[60vh] gap-3">
				<div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
				<p class="text-slate-700 dark:text-slate-200 font-bold">Pripájanie k hre...</p>
			</div>
		{/if}
	{:else if !game_state.game_started}
		<GameNotStarted
			{game_pin}
			bind:game_state
			{socket_game_controls}
			cqc_code={page.url.searchParams.get('cqc_code')}
		/>
	{:else if JSON.stringify(game_state.final_results) !== JSON.stringify([null])}
		{#if game_state.control_visible}
			<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full max-w-xl px-4 pointer-events-auto">
				<!-- Jedno samostatné tlačidlo, ktoré rovno stiahne výsledky -->
				<button
					onclick={request_answer_export}
					disabled={downloading}
					class="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-extrabold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-600/30 border-2 border-emerald-300 ring-4 ring-emerald-500/25 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
				>
					{#if downloading}
						<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>{$t('admin_page.downloading_export_results', { default: 'Sťahujem výsledky...' })}</span>
					{:else if download_success}
						<div class="p-1 rounded-lg bg-black/20 text-white">
							<svg class="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<span class="text-white font-black">{$t('admin_page.download_export_success', { default: 'Výsledky stiahnuté!' })}</span>
					{:else}
						<div class="p-1 rounded-lg bg-black/20 text-white group-hover:scale-110 transition-transform">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
						</div>
						<span>{$t('admin_page.download_export_results', { default: 'Stiahnuť výsledky' })}</span>
					{/if}
				</button>
			</div>
		{/if}
		<FinalResults
			bind:data={game_state.player_scores}
			final_results={game_state.final_results}
			players={game_state.players}
			{show_final_results}
		/>
	{:else}
		<SomeAdminScreen {game_token} {game_pin} {bg_color} bind:game_state />
	{/if}
</div>
<a
	href="#"
	target="_blank"
	bind:this={dataexport_download_a}
	download=""
	class="absolute size-px overflow-hidden whitespace-nowrap opacity-0 pointer-events-none">Download</a
>

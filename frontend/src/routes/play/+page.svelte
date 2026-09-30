<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<!--suppress ALL -->
<script lang="ts">
	import { socket } from '$lib/socket';
	import JoinGame from '$lib/play/join.svelte';
	import type { Answer, Question as QuestionType } from '$lib/quiz_types';
	import ShowTitle from '$lib/play/title.svelte';
	import Question from '$lib/play/question.svelte';
	import { navbarVisible } from '$lib/stores.svelte.ts';
	import ShowEndScreen from '$lib/play/admin/final_results.svelte';
	import KahootResults from '$lib/play/results_kahoot.svelte';
	import { getLocalization } from '$lib/i18n';
	import Cookies from 'js-cookie';
	import {
		savePlayerSession,
		getPlayerSession,
		updateSessionSid,
		clearPlayerSession,
		saveActiveQuestion,
		getActiveQuestion,
		saveQuestionResults,
		getQuestionResults,
		saveGameData,
		getGameData
	} from '$lib/play/session_storage';

	const { t } = getLocalization();

	interface Props {
		// Exports
		data: any;
	}

	let { data }: Props = $props();
	let { game_pin } = $state(data);

	// Types
	interface GameMeta {
		started: boolean;
	}

	let game_mode = $state();
	let final_results: Array<null> | Array<Array<PlayerAnswer>> = $state([null]);

	interface PlayerAnswer {
		username: string;
		answer: string;
		right: string;
	}

	// Variables init
	let question_index = $state('');
	let unique = $state({});
	navbarVisible.visible = false;
	let answer_results: Array<Answer> = $state();
	let gameData = $state();
	let solution: QuestionType = $state();
	let username = $state('');
	let scores = $state({});
	let gameMeta: GameMeta = $state({
		started: false
	});

	let question: QuestionType = $state();

	let preventReload = true;

	// Functions
	function restart() {
		unique = {};
	}

	const confirmUnload = (event: Event) => {
		if (preventReload) {
			event.preventDefault();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			event.returnValue = '';
		}
	};

	// Immediate session restoration for smooth reload on mobile
	if (typeof window !== 'undefined') {
		const session = getPlayerSession();
		if (session) {
			if (!game_pin && session.game_pin) {
				game_pin = session.game_pin;
			}
			if (!username && session.username) {
				username = session.username;
			}
			if (session.game_mode) {
				game_mode = session.game_mode;
			}
		}
		const cachedGameData = getGameData();
		if (cachedGameData) {
			gameData = cachedGameData;
			if (cachedGameData.started) {
				gameMeta.started = true;
			}
		}
		const cachedActiveQ = getActiveQuestion();
		if (cachedActiveQ) {
			question_index = cachedActiveQ.question_index;
			question = cachedActiveQ.question;
		}
		const cachedResults = getQuestionResults();
		if (cachedResults) {
			answer_results = cachedResults;
		}
	}

	socket.on('time_sync', (data) => {
		socket.emit('echo_time_sync', data);
	});

	socket.on('connect', async () => {
		console.log('Connected!');
		const session = getPlayerSession();
		if (!session || !session.game_pin || !session.username || !session.sid) {
			return;
		}
		if (!game_pin) game_pin = session.game_pin;
		if (!username) username = session.username;

		socket.emit('rejoin_game', {
			old_sid: session.sid,
			username: session.username,
			game_pin: session.game_pin
		});

		try {
			const res = await fetch(`/api/v1/quiz/play/check_captcha/${session.game_pin}`);
			if (res.ok) {
				const json = await res.json();
				game_mode = json.game_mode;
			}
		} catch (e) {
			console.warn('Could not fetch captcha on reconnect', e);
		}
	});

	// Socket-events
	socket.on('joined_game', (data) => {
		gameData = data;
		saveGameData(data);
		if (data?.started) {
			gameMeta.started = true;
		}
		try {
			// eslint-disable-next-line no-undef
			plausible('Joined Game', { props: { game_id: gameData.game_id } });
		} catch (e) {}
		savePlayerSession({
			sid: socket.id,
			username,
			game_pin,
			game_mode
		});
	});

	socket.on('rejoined_game', (data) => {
		console.log('Rejoined game successfully', data);
		gameData = data;
		saveGameData(data);
		if (data?.started) {
			gameMeta.started = true;
		}
		if (socket.id) {
			updateSessionSid(socket.id);
		}
		if (!question || question_index === '') {
			const activeQ = getActiveQuestion();
			if (activeQ && activeQ.question) {
				question = activeQ.question;
				question_index = activeQ.question_index;
			}
		}
		if (answer_results === undefined) {
			const cachedResults = getQuestionResults();
			if (cachedResults) {
				answer_results = cachedResults;
			}
		}
	});

	socket.on('game_not_found', () => {
		clearPlayerSession();
		gameData = undefined;
		gameMeta.started = false;
		question_index = '';
		window.alert('Hra sa nenašla alebo už skončila');
		window.location.href = '/play';
	});

	socket.on('set_question_number', (data) => {
		solution = undefined;
		restart();
		question = data.question;
		question_index = data.question_index;
		answer_results = undefined;
		saveActiveQuestion(data.question_index, data.question);
	});

	socket.on('start_game', () => {
		gameMeta.started = true;
		if (gameData) {
			gameData.started = true;
			saveGameData(gameData);
		}
	});

	socket.on('question_results', (data) => {
		restart();
		answer_results = data;
		saveQuestionResults(data);
	});

	socket.on('username_already_exists', () => {
		window.alert('Meno hráča už existuje! Ak ste sa odpojili, použite rovnaké zariadenie alebo zadajte iné meno.');
	});

	socket.on('kick', () => {
		clearPlayerSession();
		window.alert('Boli ste vylúčený z hry');
		preventReload = false;
		game_pin = '';
		username = '';
		Cookies.set('kicked', 'value', { expires: 1 });
		window.location.reload();
	});

	socket.on('final_results', (data) => {
		final_results = data;
		clearPlayerSession();
	});

	socket.on('solutions', (data) => {
		solution = data;
	});

	let bg_color = $derived(gameData ? gameData.background_color : undefined);

	// The rest
</script>

<svelte:window onbeforeunload={confirmUnload} />
<svelte:head>
	<title>ClassQuiz2 - Play</title>
</svelte:head>
<div
	class="min-h-screen min-w-full"
	style="background: {bg_color ? bg_color : 'transparent'}"
	class:text-black={bg_color}
>
	<div>
		{#if !gameMeta.started && gameData === undefined}
			<JoinGame bind:game_pin bind:game_mode bind:username />
		{:else if JSON.stringify(final_results) !== JSON.stringify([null])}
			<ShowEndScreen bind:data={scores} {final_results} show_final_results={true} {username} />
		{:else if gameData !== undefined && question_index === ''}
			<ShowTitle
				title={gameData.title}
				description={gameData.description}
				cover_image={gameData.cover_image}
				{username}
			/>
		{:else if gameMeta.started && gameData !== undefined && question_index !== '' && answer_results === undefined}
			{#key unique}
				<div class="text-black dark:text-black">
					<Question bind:game_mode bind:question {question_index} {solution} />
				</div>
			{/key}
		{:else if gameMeta.started && answer_results !== undefined}
			{#if answer_results === null}
				<div class="w-full flex justify-center">
					<h1 class="text-3xl">{$t('admin_page.no_answers')}</h1>
				</div>
			{:else}
				{#key unique}
					<KahootResults {username} question_results={answer_results} bind:scores />
				{/key}
			{/if}
		{/if}
	</div>
</div>

<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	// import AudioPlayer from '$lib/play/audio_player.svelte';
	import ControllerCodeDisplay from '$lib/components/controller/code.svelte';
	import { getLocalization } from '$lib/i18n';
	import GrayButton from '$lib/components/buttons/gray.svelte';
	import { fade } from 'svelte/transition';
	import { SocketGameControls } from '$lib/play/admin/socket_game_controls.ts';
	import type { GameState } from '$lib/play/admin/game_state';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	interface Props {
		game_pin: string;
		game_state: GameState;
		socket_game_controls: SocketGameControls;
		cqc_code: string;
	}

	let {
		game_pin,
		game_state = $bindable(),
		socket_game_controls,
		cqc_code = $bindable()
	}: Props = $props();

	let fullscreen_open = $state(false);
	const { t } = getLocalization();
	let play_music = $state(false);

	if (cqc_code === 'null') {
		cqc_code = null;
	}
</script>

<div class="relative min-h-[90vh] w-full flex flex-col items-center justify-center py-6 px-3 sm:px-6 overflow-hidden">
	<!-- Ambientné podsvietenie a plávajúce geometrické tvary na pozadí -->
	<div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

	<!-- Plávajúce tvary v rohoch -->
	<div class="absolute top-12 left-8 md:left-16 opacity-30 pointer-events-none animate-float-1">
		<AnswerShape shapeIndex={0} class="w-12 h-12 md:w-16 md:h-16 text-rose-500 drop-shadow-lg" />
	</div>
	<div class="absolute bottom-12 left-8 md:left-20 opacity-30 pointer-events-none animate-float-2">
		<AnswerShape shapeIndex={1} class="w-12 h-12 md:w-16 md:h-16 text-blue-500 drop-shadow-lg" />
	</div>
	<div class="absolute top-12 right-8 md:right-16 opacity-30 pointer-events-none animate-float-3">
		<AnswerShape shapeIndex={2} class="w-12 h-12 md:w-16 md:h-16 text-amber-500 drop-shadow-lg" />
	</div>
	<div class="absolute bottom-12 right-8 md:right-20 opacity-30 pointer-events-none animate-float-4">
		<AnswerShape shapeIndex={3} class="w-12 h-12 md:w-16 md:h-16 text-emerald-500 drop-shadow-lg" />
	</div>

	<!-- Hlavná lobby karta -->
	<div class="relative z-10 w-full max-w-3xl bg-slate-900/90 dark:bg-black/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-white/20 shadow-2xl flex flex-col items-center text-center">
		<!-- 1. Text Join NAD QR kódom s medzerou -->
		<div class="flex flex-col items-center gap-2 mb-7 w-full">
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs md:text-sm font-black tracking-widest uppercase shadow-inner">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				<span>Pripojenie k hre</span>
			</div>

			<div class="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center flex-wrap gap-2 leading-relaxed">
				<span>Prejdite na</span>
				<span class="bg-white/10 text-emerald-300 px-3.5 py-1 rounded-xl font-mono border border-emerald-400/40 shadow-md select-all">
					{joinUrl}
				</span>
				<span>alebo naskenujte QR kód</span>
			</div>
		</div>

		<!-- 2. QR kód s rámom a ambientným glow efektom -->
		<div
			class="relative group cursor-pointer"
			onclick={() => (fullscreen_open = true)}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (fullscreen_open = true)}
			tabindex="0"
			role="button"
			aria-label="Zväčšiť QR kód"
		>
			<div class="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-md opacity-45 group-hover:opacity-85 transition duration-500"></div>
			<div class="relative bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105 border-2 border-slate-800">
				<img
					alt="QR code to join the game"
					src="/api/v1/utils/qr/{game_pin}"
					class="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 object-contain rounded-lg block"
				/>
				<div class="text-center text-[11px] text-gray-500 mt-1.5 font-bold uppercase tracking-wider">
					🔍 Kliknutím zväčšíte
				</div>
			</div>
		</div>

		<!-- 3. PIN s výraznou medzerou od QR kódu -->
		<div class="mt-7 flex flex-col items-center">
			<span class="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1.5">
				{$t('words.pin')}
			</span>
			<div class="bg-slate-800/90 hover:bg-slate-800 border-2 border-amber-400/70 px-8 sm:px-10 py-2.5 sm:py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105">
				<span class="text-amber-400 font-mono font-black text-3xl sm:text-4xl md:text-5xl tracking-widest select-all drop-shadow">
					{game_pin}
				</span>
			</div>
		</div>

		<!-- 4. Tlačidlo "Start Quiz" vo vizuálnom štýle moderných tlačidiel -->
		<div class="mt-7 flex flex-col items-center">
			<button
				disabled={game_state.players.length < 1}
				onclick={() => {
					socket_game_controls.start_game();
				}}
				class="px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase transition-all duration-300 flex items-center gap-3 shadow-2xl {
					game_state.players.length < 1
						? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
						: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-emerald-400/30'
				}"
			>
				<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
				<span>Start Quiz</span>
			</button>
		</div>

		<!-- 5. "players are waiting" a zoznam hráčov POD tlačidlom Start Quiz -->
		<div class="mt-7 pt-6 border-t border-white/10 w-full flex flex-col items-center">
			<!-- Indikátor počtu čakajúcich hráčov -->
			<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 text-sm font-bold shadow-md mb-4">
				<span class="w-2.5 h-2.5 rounded-full {game_state.players.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
				<span class="font-bold">
					{#if game_state.players.length === 1}
						{$t('play_page.players_waiting', { count: game_state.players.length })}
					{:else}
						{$t('play_page.players_waiting_plural', { count: game_state.players.length ?? 0 })}
					{/if}
				</span>
			</div>

			<!-- Zoznam prihlásených hráčov s avatarmi -->
			{#if game_state.players.length > 0}
				<div class="flex flex-row w-full px-2 flex-wrap justify-center gap-2.5 max-h-48 overflow-y-auto">
					{#each game_state.players as player}
						{@const { avatarId, name } = parsePlayer(player.username)}
						<div
							class="flex items-center gap-2.5 px-4 py-2 bg-slate-800/95 hover:bg-red-950/80 rounded-xl shadow-md border border-white/10 hover:border-red-500 transition-all hover:scale-105 cursor-pointer group"
							onclick={() => {
								socket_game_controls.kick_player(player.username, game_state.players);
							}}
							title="Kliknutím vyhodíte hráča"
						>
							<AnimalAvatar {avatarId} size={34} class="shadow-sm" />
							<span
								class="text-base font-bold text-slate-100 group-hover:text-red-400 group-hover:line-through transition-colors"
							>{name}</span>
							<span class="opacity-0 group-hover:opacity-100 text-red-400 text-xs ml-1 font-bold">✕</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-slate-400 text-sm italic">
					Čaká sa na pripojenie hráčov...
				</p>
			{/if}
		</div>

		<!-- Ovládač kód (ak je aktívny) -->
		{#if cqc_code}
			<div class="mt-6 pt-4 border-t border-white/10 flex flex-col items-center">
				<p class="text-xs text-slate-400 font-bold mb-1">{$t('play_page.join_by_entering_code')}</p>
				<ControllerCodeDisplay code={cqc_code} />
			</div>
		{/if}
	</div>
</div>

<!-- Fullscreen QR modal -->
{#if fullscreen_open}
	<div
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
		transition:fade|global={{ duration: 120 }}
		onclick={() => (fullscreen_open = false)}
		tabindex="0"
		role="button"
		aria-label="Close modal"
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (fullscreen_open = false)}
	>
		<div class="relative bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col items-center" onclick={(e) => e.stopPropagation()}>
			<img
				alt="QR code to join the game"
				src="/api/v1/utils/qr/{game_pin}"
				class="w-full max-w-sm aspect-square object-contain rounded-xl block"
			/>
			<div class="mt-4 flex flex-col items-center">
				<span class="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-1">PIN</span>
				<span class="text-amber-500 font-mono font-black text-4xl tracking-widest">{game_pin}</span>
			</div>
			<button
				class="mt-6 px-6 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition cursor-pointer"
				onclick={() => (fullscreen_open = false)}
			>
				Zatvoriť
			</button>
		</div>
	</div>
{/if}

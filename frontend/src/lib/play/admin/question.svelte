<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { QuizQuestionType } from '$lib/quiz_types';
	import type { QuizData } from '$lib/quiz_types';
	import { get_foreground_color } from '$lib/helpers.js';
	import { kahoot_icons } from '$lib/play/kahoot_mode_assets/kahoot_icons.js';
	import CircularTimer from '$lib/play/circular_progress.svelte';
	import MediaComponent from '$lib/editor/MediaComponent.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import { getLocalization } from '$lib/i18n';
	import JoinInfoCard from '$lib/play/admin/JoinInfoCard.svelte';
	import { fade, scale } from 'svelte/transition';
	import { browser } from '$app/environment';

	interface Props {
		quiz_data: QuizData;
		selected_question: number;
		timer_res: string;
		answer_count: number;
		default_colors: string[];
		game_pin?: string;
	}

	let {
		quiz_data,
		selected_question,
		timer_res = $bindable(),
		answer_count,
		default_colors,
		game_pin = ''
	}: Props = $props();

	const { t } = getLocalization();

	let circular_progress = $derived.by(() => {
		try {
			return (
				1 -
				((100 / parseInt(quiz_data.questions[selected_question].time)) *
					parseInt(timer_res)) /
					100
			);
		} catch {
			return 0;
		}
	});

	let time_ratio = $derived.by(() => {
		try {
			const total = parseInt(quiz_data.questions[selected_question].time);
			const current = parseInt(timer_res);
			if (!total || isNaN(total) || total <= 0) return 1;
			return current / total;
		} catch {
			return 1;
		}
	});

	let timer_color = $derived.by(() => {
		if (time_ratio > 0.5) return '#10b981'; // Zelená (green > 50%)
		if (time_ratio > 0.25) return '#f59e0b'; // Oranžová v polke (orange 25-50%)
		return '#ef4444'; // Červená v štvrtine (red <= 25%)
	});

	let is_qr_modal_open = $state(false);

	let formattedPin = $derived.by(() => {
		if (!game_pin) return '';
		const clean = game_pin.replace(/\s+/g, '');
		if (clean.length === 6) {
			return `${clean.slice(0, 3)} ${clean.slice(3)}`;
		}
		if (clean.length === 8) {
			return `${clean.slice(0, 4)} ${clean.slice(4)}`;
		}
		return clean;
	});

	let joinUrl = $derived.by(() => {
		if (!browser) return 'cquiz.de';
		if (window.location.host === 'ClassQuiz2.de' || window.location.host === 'classquiz.de') {
			return 'cquiz.de';
		}
		return `${window.location.host}/play`;
	});
</script>

<div class="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 pt-2 md:pt-4 flex flex-col items-center">
	<!-- Karta s textom otázky s dostatočným priestorom, aby neprekrývala časovač -->
	<div class="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white px-6 md:px-12 py-4 md:py-6 rounded-3xl shadow-xl border border-black/5 text-center w-full mb-6">
		<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
			{@html quiz_data.questions[selected_question].question}
		</h1>
	</div>

	<!-- Riadok s časovačom a badge-mi: Otázka vľavo, Časovač v strede, Odpovede vpravo -->
	<div class="grid grid-cols-3 w-full max-w-5xl items-center mb-6 px-2">
		<!-- Vľavo: Badge čísla otázky -->
		<div class="flex justify-start">
			<div class="bg-slate-900/85 backdrop-blur-md rounded-2xl py-2 px-3.5 sm:px-4 border border-white/15 shadow-xl flex items-center gap-2.5">
				<span class="text-xs uppercase font-black tracking-widest text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-lg border border-amber-400/30 shrink-0">Otázka</span>
				<span class="font-decorative text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-1 shrink-0">
					<span class="text-amber-300 drop-shadow">{selected_question + 1}</span>
					<span class="text-slate-400 text-lg font-light">/</span>
					<span class="text-slate-200">{quiz_data.questions.length}</span>
				</span>
			</div>
		</div>

		<!-- V strede: Kruhový časovač s dynamickou farbou (zelená -> oranžová -> červená) -->
		<div class="flex justify-center">
			<CircularTimer text={timer_res} progress={circular_progress} color={timer_color} />
		</div>

		<!-- Vpravo: Badge počtu odoslaných odpovedí v rovnakom štýle ako otázka 1/20 -->
		<div class="flex justify-end">
			<div class="bg-slate-900/85 backdrop-blur-md rounded-2xl py-2 px-3.5 sm:px-4 border border-white/15 shadow-xl flex items-center gap-2.5">
				<span class="text-xs uppercase font-black tracking-widest text-emerald-400 bg-emerald-400/20 px-2.5 py-0.5 rounded-lg border border-emerald-400/30 shrink-0">
					Odpovede
				</span>
				<span class="font-decorative text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-1.5 shrink-0">
					<span class="text-emerald-300 drop-shadow">{answer_count}</span>
					<span class="text-slate-300 text-xs sm:text-sm font-semibold lowercase tracking-normal">
						{answer_count === 1 ? 'odpoveď' : answer_count >= 2 && answer_count <= 4 ? 'odpovede' : 'odpovedí'}
					</span>
				</span>
			</div>
		</div>
	</div>
</div>
{#if quiz_data.questions[selected_question].image !== null}
	<div class="flex w-full">
		<MediaComponent
			src={quiz_data.questions[selected_question].image}
			muted={false}
			css_classes="max-h-[20vh] object-cover mx-auto mb-8 w-auto"
		/>
	</div>
{/if}
{#if quiz_data.questions[selected_question].type === QuizQuestionType.ABCD || quiz_data.questions[selected_question].type === QuizQuestionType.VOTING || quiz_data.questions[selected_question].type === QuizQuestionType.CHECK}
	<div class="grid grid-cols-2 gap-4 w-full p-6">
		{#each quiz_data.questions[selected_question].answers as answer, i}
			<div
				class="rounded-xl h-fit min-h-[80px] flex items-center px-4 py-3 shadow-lg border border-black/10 transition-all"
				style="background-color: {answer.color ?? default_colors[i % default_colors.length]};"
				class:opacity-40={!answer.right &&
					timer_res === '0' &&
					quiz_data.questions[selected_question].type === QuizQuestionType.ABCD}
			>
				<div class="shrink-0 flex items-center justify-center pl-2">
					<AnswerShape shapeIndex={i} class="w-10 h-10 text-white drop-shadow-md" />
				</div>
				<span
					class="text-center font-bold text-2xl md:text-3xl px-4 py-2 w-full text-white break-words"
					>{answer.answer}</span
				>
				{#if answer.right && timer_res === '0'}
					<div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shrink-0 shadow-md">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
					</div>
				{:else}
					<span class="w-10 shrink-0"></span>
				{/if}
			</div>
		{/each}
	</div>
{:else if quiz_data.questions[selected_question].type === QuizQuestionType.TEXT}
	{#if timer_res === '0'}
		<div class="grid grid-cols-2 gap-2 w-full p-4">
			{#each quiz_data.questions[selected_question].answers as answer, i}
				<div class="rounded-lg h-fit flex bg-[#B07156]">
					<span class="text-center text-2xl px-2 py-4 w-full text-black"
						>{answer.answer}</span
					>
					<span class="pl-4 w-10"></span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex justify-center">
			<p class="text-2xl">{$t('admin_page.enter_answer_into_field')}</p>
		</div>
	{/if}
{/if}

{#if game_pin}
	<!-- Pre ultra-široké obrazovky (min. 1680px): plná karta vľavo zarovnaná s obsahom -->
	<div class="fixed left-4 xl:left-6 top-24 xl:top-28 z-30 hidden min-[1680px]:block">
		<JoinInfoCard {game_pin} compact={false} class="w-56 xl:w-64 shadow-2xl" />
	</div>

	<!-- Pre štandardné a menšie okná / obrazovky (< 1680px): kompaktný responzívny odznak PIN & QR vľavo hore -->
	<div class="fixed left-3 sm:left-4 top-3 sm:top-4 z-40 min-[1680px]:hidden flex items-center">
		<button
			type="button"
			onclick={() => (is_qr_modal_open = true)}
			class="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-slate-900/95 dark:bg-black/95 text-white border border-slate-700/80 shadow-xl backdrop-blur-xl hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer group ring-2 ring-white/10"
			title="Kliknite pre zobrazenie QR kódu"
		>
			<span class="relative flex h-2.5 w-2.5 shrink-0">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
			</span>
			<div class="flex items-center gap-1 font-mono font-black text-amber-400 text-xs sm:text-sm tracking-wider">
				<span class="text-[10px] uppercase font-bold text-amber-300/80 font-sans tracking-tight">PIN</span>
				<span>{formattedPin}</span>
			</div>
			<span class="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-lg border border-emerald-400/30 group-hover:bg-emerald-500/30 shrink-0">
				<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				QR
			</span>
		</button>
	</div>

	<!-- Modal pre zobrazenie veľkého QR kódu po kliknutí -->
	{#if is_qr_modal_open}
		<div
			class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 cursor-pointer select-none"
			transition:fade={{ duration: 150 }}
			onclick={() => (is_qr_modal_open = false)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (is_qr_modal_open = false)}
		>
			<div
				class="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full flex flex-col items-center text-center shadow-2xl relative ring-4 ring-emerald-500/20"
				transition:scale={{ duration: 200, start: 0.9 }}
				onclick={(e) => e.stopPropagation()}
				role="presentation"
			>
				<button
					type="button"
					class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
					onclick={() => (is_qr_modal_open = false)}
					aria-label="Zatvoriť"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div class="flex items-center gap-1.5 mb-2">
					<span class="relative flex h-2.5 w-2.5">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
					</span>
					<span class="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
						Pripojiť sa do kvízu
					</span>
				</div>

				<div class="bg-white p-3.5 rounded-2xl shadow-2xl my-2">
					<img
						src="/api/v1/utils/qr/{game_pin}"
						alt="QR kód pre pripojenie"
						class="w-56 h-56 sm:w-64 sm:h-64 object-contain block rounded-xl"
					/>
				</div>

				<div class="mt-2 flex flex-col items-center">
					<span class="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
						PIN KÓD HRY
					</span>
					<div class="text-4xl sm:text-5xl font-black font-mono tracking-widest text-amber-400 mt-1">
						{formattedPin}
					</div>
				</div>

				<div class="mt-3 text-xs sm:text-sm text-slate-300">
					<span>Otvorte <span class="font-bold text-white underline decoration-emerald-400">{joinUrl}</span> alebo načítajte QR kód</span>
				</div>
			</div>
		</div>
	{/if}
{/if}

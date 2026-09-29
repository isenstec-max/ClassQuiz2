<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { QuizData } from '$lib/quiz_types';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	export let quiz: QuizData | undefined = undefined;

	const on_parent_click = (e: Event) => {
		if (e.target !== e.currentTarget) {
			return;
		}
		quiz = undefined;
	};
	const close_start_game_if_esc_is_pressed = (key: KeyboardEvent) => {
		if (key.code === 'Escape') {
			quiz = undefined;
		}
	};
	onMount(() => {
		document.body.addEventListener('keydown', close_start_game_if_esc_is_pressed);
	});
</script>

{#if quiz}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto select-none"
		onclick={on_parent_click}
		transition:fade={{ duration: 150 }}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && (quiz = undefined)}
	>
		<div
			class="relative w-full max-w-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6 my-auto"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Tlačidlo Zavrieť (X) -->
			<button
				type="button"
				class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
				onclick={() => (quiz = undefined)}
				aria-label="Zatvoriť"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Hlavička modálu -->
			<div class="text-center pr-6">
				<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-400/30 text-xs font-black tracking-widest uppercase mb-2">
					<span>📊</span> {$t('words.analytics', { default: 'Štatistiky' })}
				</div>
				<h2 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
					{@html quiz.title}
				</h2>
			</div>

			<!-- Karty s metrikami v mriežke 2x2 -->
			<div class="grid grid-cols-2 gap-3 sm:gap-4">
				<!-- Spustenia hry (Plays) -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center text-center">
					<span class="text-3xl mb-1">🎮</span>
					<span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{quiz.plays ?? 0}</span>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
						{$t('words.play', { count: 2, default: 'Spustenia' })}
					</span>
				</div>

				<!-- Zobrazenia stránky (Views) -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center text-center">
					<span class="text-3xl mb-1">👁️</span>
					<span class="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">{quiz.views ?? 0}</span>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
						{$t('words.view', { count: 2, default: 'Zobrazenia' })}
					</span>
				</div>

				<!-- Páči sa (Likes) -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center text-center">
					<span class="text-3xl mb-1">👍</span>
					<span class="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">{quiz.likes ?? 0}</span>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
						{$t('words.like', { count: 2, default: 'Páči sa' })}
					</span>
				</div>

				<!-- Nepáči sa (Dislikes) -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center text-center">
					<span class="text-3xl mb-1">👎</span>
					<span class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{quiz.dislikes ?? 0}</span>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
						{$t('words.dislike', { count: 2, default: 'Nepáči sa' })}
					</span>
				</div>
			</div>

			<!-- Informačný blok -->
			<div class="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
				{$t('dashboard.info_analytics')}
			</div>

			<!-- Tlačidlo Zavrieť -->
			<button
				type="button"
				onclick={() => (quiz = undefined)}
				class="w-full py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-sm transition-colors cursor-pointer"
			>
				Zavrieť
			</button>
		</div>
	</div>
{/if}

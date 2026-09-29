<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();
	interface Props {
		quiz_id?: string | null;
	}

	let { quiz_id = $bindable(null) }: Props = $props();

	const handle_on_click = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			quiz_id = null;
		}
	};
	onMount(() => {
		window.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				quiz_id = null;
			}
		});
	});
</script>

{#if quiz_id}
	<div
		class="w-screen h-screen fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={handle_on_click}
		transition:fade={{ duration: 100 }}
	>
		<div class="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col gap-6">
			<!-- Header -->
			<div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shadow-xs">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
					</div>
					<h2 class="text-xl font-extrabold text-slate-800 dark:text-white">
						{$t('downloader.select_download_type')}
					</h2>
				</div>
				<button
					type="button"
					onclick={() => (quiz_id = null)}
					class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
				>
					✕
				</button>
			</div>

			<!-- Options: 2 cards -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Option 1: Vlastný formát (.cqa) -->
				<a
					href="/api/v1/eximport/{quiz_id}"
					download
					class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:border-emerald-500/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between group cursor-pointer"
				>
					<div class="flex items-center justify-between mb-3">
						<div class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-xs uppercase tracking-wider">
							.cqa
						</div>
						<span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center text-xs font-bold transition-all">
							↓
						</span>
					</div>
					<div>
						<h3 class="font-extrabold text-base text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
							{$t('downloader.own_format')}
						</h3>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
							Vrátane obrázkov a všetkých typov otázok
						</p>
					</div>
				</a>

				<!-- Option 2: Excel (.xlsx) -->
				<a
					href="/api/v1/eximport/excel/{quiz_id}"
					download
					class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:border-teal-500/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between group cursor-pointer"
				>
					<div class="flex items-center justify-between mb-3">
						<div class="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-extrabold text-xs uppercase tracking-wider">
							.xlsx
						</div>
						<span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center text-xs font-bold transition-all">
							↓
						</span>
					</div>
					<div>
						<h3 class="font-extrabold text-base text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
							{$t('downloader.excel_format')}
						</h3>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
							Podpora tabuliek, hlasovania a výberu z možností
						</p>
					</div>
				</a>
			</div>

			<!-- Explanatory note footer -->
			<div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
				{$t('downloader.help')}
			</div>
		</div>
	</div>
{/if}

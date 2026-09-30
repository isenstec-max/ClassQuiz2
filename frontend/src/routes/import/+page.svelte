<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { getLocalization } from '$lib/i18n';
	import { navbarVisible } from '$lib/stores.svelte.ts';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	navbarVisible.visible = true;

	const { t } = getLocalization();
	let url_input = $state('');
	let file_input: File[] = $state();
	let kahoot_regex = /^https:\/\/create\.kahoot\.it\/details\/.*\/?([a-zA-Z-\d]{36})\/?$/;

	let url_valid = $derived(kahoot_regex.test(url_input));
	let is_loading = $state(false);

	const submit = async (e: Event) => {
		e.preventDefault();
		if (!url_valid) {
			return;
		}
		is_loading = true;
		const regex_res = kahoot_regex.exec(url_input);
		const res = await fetch(`/api/v1/quiz/import/${regex_res[1]}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.status === 200) {
			window.location.href = '/dashboard';
		} else if (res.status === 400) {
			/*			alertModal.set({
				open: true,
				title: 'Import failed',
				body: "This quiz isn't (yet) supported!"
			});*/
			alert("This quiz isn't (yet) supported!");
		} else if (res.status === 403) {
			/*			alertModal.set({
				open: true,
				title: 'Import failed',
				body: 'Unknown error while importing the quiz!'
			});*/
			alert('Quiz is probably private!');
		} else {
			alert(`Kahoot replied with ${res.status}`);
		}
		is_loading = false;
	};

	const file_submit = async (e: Event) => {
		e.preventDefault();
		is_loading = true;
		const formdata = new FormData();
		formdata.append('file', file_input[0]);
		let res;
		if (file_input[0].name.includes('.xlsx')) {
			res = await fetch('/api/v1/quiz/excel-import', {
				method: 'POST',
				body: formdata
			});
		} else if (file_input[0].name.includes('.cqa')) {
			res = await fetch('/api/v1/eximport/', {
				method: 'POST',
				body: formdata
			});
		} else {
			alert('Wrong file type');
			is_loading = false;
			return;
		}

		if (res.status === 200) {
			window.location.href = '/dashboard';
		} else {
			/*			alertModal.set({
				open: true,
				title: 'Import failed',
				body: 'Something went wrong!'
			});*/
			alert('Something went wrong!');
		}
		is_loading = false;
	};

	onMount(() => {
		let url_from_path = page.url.searchParams.get('url');
		if (url_from_path === '') {
			url_from_path = null;
		}
		url_input = url_from_path ?? '';
	});
</script>

<svelte:head>
	<title>ClassQuiz2 - {$t('words.import', { default: 'Importovať' })}</title>
</svelte:head>

<div class="min-h-[calc(100vh-5rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-5xl flex flex-col gap-8">
		<!-- Hlavička stránky -->
		<div class="text-center space-y-2">
			<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider shadow-2xs">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
				</svg>
				<span>{$t('words.import', { default: 'Import kvízov' })}</span>
			</div>
			<h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
				{$t('words.import', { default: 'Importovať kvíz' })}
			</h1>
			<p class="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
				Jednoducho preveďte svoje kvízy z Kahoot! alebo nahrajte exportované súbory z ClassQuiz2 a Excel tabuliek.
			</p>
		</div>

		<!-- Dva hlavné stĺpce / karty -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
			
			<!-- KARTA 1: Import z Kahoot! -->
			<div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full relative overflow-hidden group">
				<!-- Hlavička karty -->
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 border border-purple-400/40">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
					</div>
					<div>
						<h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
							{$t('import_page.a_kahoot_quiz', { default: 'Kvíz z Kahoot!' })}
						</h2>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							{$t('import_page.side_import_kahoot', { default: 'Na tejto stránke môžete importovať verejné kvízy vytvorené v Kahoot!.' })}
						</p>
					</div>
				</div>

				<!-- Formulár rozťahujúci sa na celú výšku -->
				<form onsubmit={submit} class="flex flex-col flex-1 justify-between">
					<!-- Horná časť s poľami -->
					<div class="space-y-4">
						<div class="space-y-2">
							<label for="url" class="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
								{$t('words.url', { default: 'URL adresa kvízu' })}
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
									</svg>
								</div>
								<input
									id="url"
									bind:value={url_input}
									type="url"
									placeholder="https://create.kahoot.it/details/..."
									class="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-all {url_input.length === 0 ? 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20' : url_valid ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'}"
								/>
							</div>

							<!-- Nápoveda a stav -->
							{#if url_input.length > 0}
								{#if url_valid}
									<p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fade">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
										<span>Platná URL adresa Kahoot kvízu</span>
									</p>
								{:else}
									<p class="text-xs font-bold text-rose-500 flex items-center gap-1.5 animate-fade">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
										<span>Zadajte celú URL adresu detailu kvízu z Kahoot!</span>
									</p>
								{/if}
							{/if}

							<div class="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 space-y-1.5">
								<div class="font-bold flex items-center gap-1.5">
									<span>💡</span>
									<span>Správny formát odkazu:</span>
								</div>
								<p class="font-mono break-all text-[11px] text-purple-700 dark:text-purple-300/80 bg-white/60 dark:bg-black/20 p-2 rounded-xl border border-purple-200/50 dark:border-purple-800/40">
									https://create.kahoot.it/details/&lt;uuid-kvízu&gt;
								</p>
							</div>

							<!-- Zoznam podporovaných prvkov -->
							<div class="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
								<div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
									<span class="text-emerald-500 font-bold">✓</span>
									<span>Otázky a odpovede</span>
								</div>
								<div class="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
									<span class="text-emerald-500 font-bold">✓</span>
									<span>Obrázky z kvízu</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Tlačidlo odoslať ukotvené dole -->
					<div class="pt-6 mt-auto">
						<button
							type="submit"
							disabled={!url_valid || is_loading}
							class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 text-white font-extrabold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-600/30 border border-purple-400/40 ring-4 ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
						>
							{#if is_loading}
								<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span>Importujem kvíz...</span>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								<span>{$t('words.submit', { default: 'Importovať z Kahoot!' })}</span>
							{/if}
						</button>
					</div>
				</form>
			</div>

			<!-- KARTA 2: Súborový import (ClassQuiz2 / Excel) -->
			<div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full relative overflow-hidden group">
				<!-- Hlavička karty -->
				<div class="flex items-start gap-4 mb-6">
					<div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30 border border-emerald-400/40">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
							{$t('import_page.ClassQuiz2_quiz', { default: 'ClassQuiz2 súbor / Excel' })}
						</h2>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							{$t('import_page.this_side_ClassQuiz2', { default: 'Importujte exportované kvízy (.cqa) alebo tabuľky Excel (.xlsx).' })}
						</p>
					</div>
				</div>

				<!-- Formulár rozťahujúci sa na celú výšku -->
				<form onsubmit={file_submit} class="flex flex-col flex-1 justify-between">
					<!-- Horná časť s dropzone a šablónou -->
					<div class="space-y-4">
						<div class="space-y-2">
							<label for="file" class="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
								{$t('words.select', { default: 'Vyberte súbor' })}
							</label>

							<label
								for="file"
								class="relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 {file_input && file_input.length > 0 ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'}"
							>
								<input
									id="file"
									bind:files={file_input}
									type="file"
									accept=".cqa,.xlsx"
									class="sr-only"
								/>

								{#if file_input && file_input.length > 0}
									<div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
										<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<p class="text-sm font-black text-slate-900 dark:text-white truncate max-w-[280px]">
										{file_input[0].name}
									</p>
									<p class="text-xs text-slate-400 font-mono mt-0.5">
										{(file_input[0].size / 1024).toFixed(1)} KB • Kliknite pre zmenu súboru
									</p>
								{:else}
									<div class="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
										<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
										</svg>
									</div>
									<p class="text-sm font-bold text-slate-700 dark:text-slate-200">
										Kliknite sem pre výber súboru
									</p>
									<p class="text-xs text-slate-400 mt-1">
										{$t('import_page.upload_file_ending', { default: 'Podporované formáty: .cqa alebo .xlsx' })}
									</p>
								{/if}
							</label>

							<!-- Informácia o Excel šablóne -->
							<div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
								<div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
									<span class="text-emerald-500 text-base">📊</span>
									<span class="font-medium">Potrebujete Excel formát?</span>
								</div>
								<a
									href="https://blog.web.garage.realux.mawoka.eu/ClassQuiz2/ClassQuiz2ImportTemplate.xlsx"
									download
									class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold transition-all border border-emerald-500/30 shrink-0"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
									</svg>
									<span>{$t('import_page.download_template_here', { default: 'Stiahnuť šablónu' })}</span>
								</a>
							</div>
						</div>
					</div>

					<!-- Tlačidlo odoslať ukotvené dole -->
					<div class="pt-6 mt-auto">
						<button
							type="submit"
							disabled={!file_input || file_input.length === 0 || is_loading}
							class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-extrabold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-600/30 border border-emerald-400/40 ring-4 ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
						>
							{#if is_loading}
								<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span>Nahrávam a spracúvam súbor...</span>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								<span>{$t('words.submit', { default: 'Importovať súbor' })}</span>
							{/if}
						</button>
					</div>
				</form>
			</div>

		</div>

		<!-- Spodná nápovedná lišta -->
		<div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
			<div class="flex items-center gap-2.5">
				<span class="text-xl">📚</span>
				<span>{$t('import_page.need_help', { default: 'Neviete ako exportovať kvíz z Kahoot alebo pripraviť Excel súbor?' })}</span>
			</div>
			<a
				href="/docs/import-from-kahoot"
				class="inline-flex items-center gap-1.5 font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors shrink-0"
			>
				<span>{$t('import_page.visit_docs', { default: 'Otvoriť návod v dokumentácii' })}</span>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</a>
		</div>

	</div>
</div>
<!--{/if}-->

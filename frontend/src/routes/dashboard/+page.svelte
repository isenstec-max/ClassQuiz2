<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import DownloadQuiz from '$lib/components/DownloadQuiz.svelte';
	import type { QuizData } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import Footer from '$lib/footer.svelte';
	import { signedIn } from '$lib/stores';
	import { navbarVisible } from '$lib/stores.svelte';
	import CommandpaletteNotice from '$lib/components/popover/commandpalettenotice.svelte';
	import Fuse from 'fuse.js';
	import type { PageData } from './$types';
	import StartGamePopup from '$lib/dashboard/start_game.svelte';
	import Analytics from './Analytics.svelte';
	import MediaComponent from '$lib/editor/MediaComponent.svelte';
	import { createTippy } from 'svelte-tippy';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let search_term = $state('');
	let start_game = $state(null);
	let download_id: string | null = $state(null);
	signedIn.set(true);
	navbarVisible.visible = true;
	const { t } = getLocalization();

	let items_to_show = $state([]);
	let all_items: Array<any> = $state();
	let fuse: Fuse<any>;
	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'top'
	});

	let id_to_position_map = {};

	const getData = async (): Promise<{ items: Array<QuizData>; fuse: Fuse<any> }> => {
		const items: any[] = [];

		for (const q of data.quizzes) items.push({ ...q, type: 'quiz' });
		for (const q of data.quiztivities) items.push({ ...q, type: 'quiztivity' });

		const f = new Fuse(items, {
			keys: ['title', 'description', 'questions.title'],
			findAllMatches: true
		});

		return { items, fuse: f };
	};

	const search = () => {
		if (search_term === '') {
			items_to_show = all_items;
			return;
		}

		const res = fuse.search(search_term);
		items_to_show = res.map((r) => r.item);
	};

	onMount(async () => {
		const { items, fuse: f } = await getData();
		all_items = items;
		items_to_show = items;
		fuse = f;

		id_to_position_map = {};
		for (let i = 0; i < items.length; i++) {
			id_to_position_map[items[i].id] = i;
		}
		search();
	});

	const deleteQuiz = async (to_delete: string, type: 'quiz' | 'quiztivity') => {
		if (!confirm($t('dashboard.confirm_delete', { default: 'Naozaj chcete vymazať tento kvíz?' }))) {
			return;
		}
		if (type === 'quiz') {
			await fetch(`/api/v1/quiz/delete/${to_delete}`, {
				method: 'DELETE'
			});
		} else {
			await fetch(`/api/v1/quiztivity/${to_delete}`, {
				method: 'DELETE'
			});
		}
		window.location.reload();
	};

	let analytics_quiz_selected: undefined | QuizData = $state(undefined);
</script>

<svelte:head>
	<title>ClassQuiz2 - {$t('words.dashboard', { default: 'Nástenka' })}</title>
</svelte:head>
<Analytics bind:quiz={analytics_quiz_selected} />
<CommandpaletteNotice />
<div class="min-h-screen flex flex-col pb-12">
	{#if !all_items}
		<div class="flex flex-col justify-center items-center my-32 gap-3">
			<div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
			<p class="text-slate-600 dark:text-slate-300 font-bold">Načítavam kvízy...</p>
		</div>
	{:else}
		<div class="flex flex-col w-full max-w-6xl mx-auto px-4 pt-4">
			<!-- Horný ovládací panel / Akčné tlačidlá s modernou farebnou grafikou -->
			<div class="flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl mb-6">
				<!-- Hlavné tlačidlo: Vytvoriť nový kvíz -->
				<a
					href="/create"
					class="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 border-2 border-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-500/20"
				>
					<div class="p-1 rounded-xl bg-white/20 text-white group-hover:rotate-90 transition-transform">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
						</svg>
					</div>
					<span>{$t('dashboard.create_quiz', { default: 'Vytvoriť nový kvíz' })}</span>
				</a>

				<!-- Sekundárne akčné tlačidlá s farebnými ikonami -->
				<div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
					<!-- Importovať -->
					<a
						href="/import"
						class="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400/60 shadow-xs hover:shadow-md text-slate-800 dark:text-slate-100 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<div class="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
						</div>
						<span>{$t('words.import', { default: 'Importovať' })}</span>
					</a>

					<!-- Výsledky -->
					<a
						href="/results"
						class="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400/60 shadow-xs hover:shadow-md text-slate-800 dark:text-slate-100 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<div class="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<span>{$t('words.results', { default: 'Výsledky' })}</span>
					</a>

					<!-- Knižnica súborov -->
					<a
						href="/edit/files"
						class="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-sky-400/60 shadow-xs hover:shadow-md text-slate-800 dark:text-slate-100 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<div class="p-1.5 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
							</svg>
						</div>
						<span>{$t('words.files_library', { default: 'Knižnica súborov' })}</span>
					</a>

					<!-- Nastavenia -->
					<a
						href="/account/settings"
						class="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/80 hover:border-slate-400/60 shadow-xs hover:shadow-md text-slate-800 dark:text-slate-100 font-extrabold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<div class="p-1.5 rounded-xl bg-slate-500/15 text-slate-600 dark:text-slate-400 group-hover:rotate-45 transition-transform">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<span>{$t('words.settings', { default: 'Nastavenia' })}</span>
					</a>
				</div>
			</div>

			<!-- Vyhľadávacie pole -->
			{#if all_items.length !== 0}
				<div class="relative w-full max-w-xl mx-auto mb-6">
					<div class="relative flex items-center">
						<div class="absolute left-4 pointer-events-none text-slate-400 dark:text-slate-500">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							bind:value={search_term}
							oninput={search}
							class="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium text-sm sm:text-base text-center"
							placeholder={$t('dashboard.search_for_own_quizzes', { default: 'Hľadať vo vlastných kvízoch...' })}
						/>
						{#if search_term}
							<button
								onclick={() => {
									search_term = '';
									items_to_show = all_items;
								}}
								class="absolute right-3.5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
								title="Vymazať"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
				</div>

				<!-- Zoznam kariet kvízov -->
				{#if items_to_show.length > 0}
					<div class="flex flex-col gap-4">
						{#each items_to_show as quiz}
							<div
								class="bg-white/95 dark:bg-slate-900/95 rounded-3xl p-4 sm:p-5 border-2 border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden group"
							>
								<!-- Vizuál kvízu: Cover obrázok alebo štýlová ikona -->
								<div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
									{#if quiz.cover_image}
										<MediaComponent
											src={quiz.cover_image}
											css_classes="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									{:else}
										<div class="w-full h-full bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-indigo-500/20 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
											<span class="text-3xl sm:text-4xl">🎯</span>
										</div>
									{/if}
								</div>

								<!-- Informácie o kvíze (Názov, odznaky, popis) -->
								<div class="flex-1 min-w-0 flex flex-col justify-center text-center md:text-left w-full">
									<div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
										{#if quiz.type === 'quiz'}
											<span class="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
												{$t('words.quiz', { default: 'Kvíz' })}
											</span>
										{:else}
											<span class="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
												{$t('words.quiztivity', { default: 'Aktivita' })}
											</span>
										{/if}

										{#if quiz.questions?.length !== undefined}
											{@const qCount = quiz.questions.length}
											<span class="px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
												{qCount} {qCount === 1 ? 'otázka' : (qCount >= 2 && qCount <= 4 ? 'otázky' : 'otázok')}
											</span>
										{/if}

										{#if quiz.public}
											<span class="px-2 py-0.5 rounded-lg text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20">
												{$t('explore_page.public', { default: 'Verejný' })}
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
												{$t('explore_page.private', { default: 'Súkromný' })}
											</span>
										{/if}
									</div>

									<h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
										{@html quiz.title}
									</h3>

									{#if quiz.description}
										<p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
											{@html quiz.description}
										</p>
									{/if}
								</div>

								<!-- 6 Farebných moderných akčných tlačidiel -->
								<div class="grid grid-cols-3 gap-2 sm:gap-2.5 shrink-0 self-center">
									<!-- 1. SPUSTIŤ / PLAY (Zelená farebná ikona) -->
									{#if quiz.type === 'quiz'}
										<button
											onclick={() => (start_game = quiz.id)}
											use:tippy={{ content: $t('dashboard.play_quiz', { default: 'Spustiť kvíz' }) }}
											aria-label="Spustiť kvíz"
											class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-xs hover:shadow-lg hover:shadow-emerald-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn"
										>
											<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
												<circle cx="12" cy="12" r="10" fill="#10B981" />
												<path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#FFFFFF" />
												<path d="M10 8.5L16 12L13 12L10 10.3V8.5Z" fill="#D1FAE5" />
											</svg>
										</button>
									{:else}
										<a
											href="/quiztivity/play?id={quiz.id}"
											use:tippy={{ content: $t('dashboard.play_quiz', { default: 'Spustiť aktivitu' }) }}
											aria-label="Spustiť aktivitu"
											class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-xs hover:shadow-lg hover:shadow-emerald-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn"
										>
											<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
												<circle cx="12" cy="12" r="10" fill="#10B981" />
												<path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#FFFFFF" />
												<path d="M10 8.5L16 12L13 12L10 10.3V8.5Z" fill="#D1FAE5" />
											</svg>
										</a>
									{/if}

									<!-- 2. ŠTATISTIKY / ANALYTICS (Farebný stĺpcový graf) -->
									<button
										onclick={() => (analytics_quiz_selected = quiz)}
										use:tippy={{ content: $t('dashboard.analytics_quiz', { default: 'Štatistiky a výsledky' }) }}
										aria-label="Štatistiky"
										class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-xs hover:shadow-lg hover:shadow-indigo-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn"
									>
										<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
											<rect x="3" y="12" width="4.5" height="9" rx="1.5" fill="#3B82F6" />
											<rect x="9.75" y="7" width="4.5" height="14" rx="1.5" fill="#8B5CF6" />
											<rect x="16.5" y="3.5" width="4.5" height="17.5" rx="1.5" fill="#F59E0B" />
										</svg>
									</button>

									<!-- 3. UPRAVIŤ / EDIT (Farebná ceruzka s gumou a hrotom) -->
									<a
										href={quiz.type === 'quiz' ? `/edit?quiz_id=${quiz.id}` : `/quiztivity/edit?id=${quiz.id}`}
										use:tippy={{ content: $t('dashboard.edit_quiz', { default: 'Upraviť kvíz' }) }}
										aria-label="Upraviť"
										class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 hover:border-amber-400 shadow-xs hover:shadow-lg hover:shadow-amber-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn"
									>
										<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
											<path d="M4 20L8 19L18.5 8.5L14.5 4.5L4 15L4 20Z" fill="#F59E0B" />
											<path d="M14.5 4.5L18.5 8.5L20 7C20.8 6.2 20.8 4.8 20 4C19.2 3.2 17.8 3.2 17 4L14.5 4.5Z" fill="#FB7185" />
											<path d="M4 20L7 20L4 17L4 20Z" fill="#1E293B" />
											<path d="M13 6L17 10" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" />
										</svg>
									</a>

									<!-- 4. NÁHĽAD / VIEW (Farebné oko s modrou dúhovkou) -->
									<a
										href="/view/{quiz.id}"
										use:tippy={{ content: quiz.public ? $t('dashboard.view_quiz', { default: 'Náhľad kvízu' }) : 'Náhľad (iba pre verejné kvízy)' }}
										aria-label="Náhľad"
										class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-sky-50/60 dark:hover:bg-sky-950/30 border border-slate-200 dark:border-slate-700 hover:border-sky-400 shadow-xs hover:shadow-lg hover:shadow-sky-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn {quiz.public ? '' : 'opacity-40 pointer-events-none'}"
									>
										<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
											<path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8" />
											<circle cx="12" cy="12" r="4.5" fill="#0EA5E9" />
											<circle cx="12" cy="12" r="2.2" fill="#0F172A" />
											<circle cx="13.2" cy="10.8" r="1.1" fill="#FFFFFF" />
										</svg>
									</a>

									<!-- 5. VYMAZAŤ / DELETE (Červený odpadkový kôš so sivým vekom) -->
									<button
										onclick={() => deleteQuiz(quiz.id, quiz.type)}
										use:tippy={{ content: $t('dashboard.delete_quiz', { default: 'Vymazať kvíz' }) }}
										aria-label="Vymazať"
										class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-400 shadow-xs hover:shadow-lg hover:shadow-rose-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn"
									>
										<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
											<path d="M6 7L7.5 19.5C7.6 20.4 8.4 21 9.3 21H14.7C15.6 21 16.4 20.4 16.5 19.5L18 7H6Z" fill="#EF4444" />
											<path d="M4 6C4 5.4 4.4 5 5 5H19C19.6 5 20 5.4 20 6C20 6.6 19.6 7 19 7H5C4.4 7 4 6.6 4 6Z" fill="#DC2626" />
											<path d="M9 5V4C9 3.4 9.4 3 10 3H14C14.6 3 15 3.4 15 4V5H9Z" fill="#B91C1C" />
											<line x1="9.5" y1="10" x2="9.5" y2="17" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
											<line x1="14.5" y1="10" x2="14.5" y2="17" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
										</svg>
									</button>

									<!-- 6. STIAHNUŤ / EXPORT (Fialový podnos a zelená šípka) -->
									<button
										onclick={() => (download_id = quiz.id)}
										disabled={quiz.type !== 'quiz'}
										use:tippy={{ content: $t('dashboard.export_quiz', { default: 'Stiahnuť / Exportovať kvíz' }) }}
										aria-label="Stiahnuť"
										class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-slate-700 hover:border-purple-400 shadow-xs hover:shadow-lg hover:shadow-purple-500/15 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group/btn disabled:opacity-40 disabled:cursor-not-allowed"
									>
										<svg class="w-6 h-6 group-hover/btn:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
											<path d="M4 17V18C4 19.7 5.3 21 7 21H17C18.7 21 20 19.7 20 18V17" stroke="#8B5CF6" stroke-width="2.2" stroke-linecap="round" />
											<path d="M12 3V15M12 15L7.5 10.5M12 15L16.5 10.5" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- Prázdny stav vyhľadávania -->
					<div class="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl text-center flex flex-col items-center gap-3">
						<div class="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-3xl">
							🔍
						</div>
						<h3 class="text-xl font-extrabold text-slate-800 dark:text-white">
							{$t('search_page.nothing_here', { default: 'Nič sa nenašlo...' })}
						</h3>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							Skúste zmeniť hľadaný výraz alebo vymažte vyhľadávanie.
						</p>
						<button
							onclick={() => {
								search_term = '';
								items_to_show = all_items;
							}}
							class="mt-2 px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer"
						>
							Zobraziť všetky kvízy
						</button>
					</div>
				{/if}
			{:else}
				<!-- Prázdny stav – žiadne kvízy -->
				<div class="w-full max-w-md mx-auto my-16 p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl text-center flex flex-col items-center gap-4">
					<div class="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-4xl">
						📚
					</div>
					<h3 class="text-2xl font-black text-slate-800 dark:text-white">
						{$t('overview_page.no_quizzes', { default: 'Zatiaľ nemáte žiadne kvízy.' })}
					</h3>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						Začnite vytvorením svojho prvého kvízu alebo ho importujte z Kahoot!
					</p>
					<a
						href="/create"
						class="mt-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
					>
						{$t('dashboard.create_quiz', { default: 'Vytvoriť prvý kvíz' })}
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
<Footer />
{#if start_game !== null}
	<StartGamePopup bind:quiz_id={start_game} />
{/if}
<DownloadQuiz bind:quiz_id={download_id} />

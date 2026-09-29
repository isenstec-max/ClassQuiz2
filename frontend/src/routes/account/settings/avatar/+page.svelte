<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { bounceOut } from 'svelte/easing';
	import Spinner from '$lib/Spinner.svelte';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	const item_count = {
		skin_color: 7,
		top_type: 35,
		hair_color: 10,
		facial_hair_type: 6,
		facial_hair_color: 10,
		mouth_type: 12,
		eyebrow_type: 13,
		accessories_type: 7,
		hat_color: 15,
		clothe_type: 9,
		clothe_color: 15,
		clothe_graphic_type: 11
	};

	const translation_map = {
		skin_color: $t('avatar_settings.skin_color', { default: 'Farba pleti' }),
		top_type: $t('avatar_settings.top_type', { default: 'Účes / Pokrývka hlavy' }),
		hair_color: $t('avatar_settings.hair_color', { default: 'Farba vlasov' }),
		facial_hair_type: $t('avatar_settings.facial_hair_type', { default: 'Bradka / Fúzy' }),
		facial_hair_color: $t('avatar_settings.facial_hair_color', { default: 'Farba fúzov' }),
		mouth_type: $t('avatar_settings.mouth_type', { default: 'Ústa / Úsmev' }),
		eyebrow_type: $t('avatar_settings.eyebrow_type', { default: 'Obočie' }),
		accessories_type: $t('avatar_settings.accessories_type', { default: 'Doplnky / Okuliare' }),
		hat_color: $t('avatar_settings.hat_color', { default: 'Farba pokrývky hlavy' }),
		clothe_type: $t('avatar_settings.clothe_type', { default: 'Typ oblečenia' }),
		clothe_color: $t('avatar_settings.clothe_color', { default: 'Farba oblečenia' }),
		clothe_graphic_type: $t('avatar_settings.clothe_graphic_type', { default: 'Potlač na tričku' })
	};

	let data = $state({
		skin_color: 0,
		top_type: 0,
		hair_color: 0,
		facial_hair_type: 0,
		facial_hair_color: 0,
		mouth_type: 0,
		eyebrow_type: 0,
		accessories_type: 0,
		hat_color: 0,
		clothe_type: 0,
		clothe_color: 0,
		clothe_graphic_type: 0
	});

	const data_keys = Object.keys(data);
	let index = $state(0);
	let save_finished: undefined | boolean = $state(undefined);
	let finished = $state(false);

	const get_image_url = (input_data) => {
		return `/api/v1/avatar/custom?${new URLSearchParams(input_data).toString()}`;
	};

	let image_url = $derived(get_image_url(data));

	const save_avatar = async () => {
		save_finished = false;
		const res = await fetch(`/api/v1/avatar/save?${new URLSearchParams(data).toString()}`, {
			method: 'POST'
		});
		if (res.ok) {
			save_finished = true;
		}
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - {$t('avatar_settings.skin_color', { default: 'Editor avatara' })}</title>
</svelte:head>

<div class="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-80px)]">
	<!-- Ľavý stĺpec: Živý náhľad avatara -->
	<div class="w-full lg:w-80 shrink-0 flex flex-col items-center">
		<div class="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center sticky top-20">
			<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-black uppercase tracking-wider mb-4">
				<span>✨</span> Aktuálny náhľad
			</div>

			<!-- Kruhový rám náhľadu s jemným žiarením -->
			<div class="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-indigo-500/20 p-2 border-4 border-emerald-400/40 shadow-2xl flex items-center justify-center overflow-hidden">
				<img
					src={image_url}
					alt="Náhľad avatara"
					class="w-full h-full object-contain drop-shadow-lg"
				/>
			</div>

			<!-- Tlačidlá rýchlej navigácie kategórií -->
			<div class="w-full mt-6 flex flex-col gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
				{#each data_keys as key, i}
					<button
						onclick={() => (index = i)}
						class="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left {index === i ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
					>
						<span>{translation_map[key]}</span>
						<span class="opacity-70 font-mono">#{i + 1}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Pravý stĺpec: Možnosti výberu častí avatara (zmenšené na polovicu s čistým scrollovaním bez sivých líšt) -->
	<div class="flex-1 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl min-w-0">
		<!-- Hlavička kategórie s navigáciou a ukazovateľom pokroku -->
		<div class="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
			<!-- Tlačidlo Späť -->
			<button
				onclick={() => { index = index - 1; }}
				disabled={index < 1}
				class="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md text-slate-800 dark:text-white font-bold text-sm hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
			>
				<svg class="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				<span>{$t('words.back', { default: 'Späť' })}</span>
			</button>

			<!-- Názov kroku a ukazovateľ -->
			<div class="flex flex-col items-center gap-1.5 flex-1 mx-2 text-center">
				<h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
					{translation_map[data_keys[index]]}
					<span class="text-xs text-slate-500 dark:text-slate-400 font-normal">({index + 1}/{data_keys.length})</span>
				</h2>
				<div class="w-full max-w-xs bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
					<div
						class="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
						style="width: {((index + 1) / data_keys.length) * 100}%"
					></div>
				</div>
			</div>

			<!-- Tlačidlo Dokončiť / Ďalej -->
			{#if index < 11}
				<button
					onclick={() => { index = index + 1; }}
					class="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md text-slate-800 dark:text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
				>
					<span>{$t('words.next', { default: 'Ďalej' })}</span>
					<svg class="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			{:else}
				<button
					onclick={() => {
						save_finished = undefined;
						finished = true;
					}}
					class="group flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-500/20"
				>
					<span>{$t('words.finish', { default: 'Dokončiť' })}</span>
					<span class="text-base group-hover:scale-110 transition-transform">🏁</span>
				</button>
			{/if}
		</div>

		<!-- Mriežka možností – o polovicu menšie (4 až 8 stĺpcov namiesto obrovských 4) -->
		<div class="flex-1 overflow-y-auto overflow-x-hidden pt-5 pr-1 max-h-[68vh] no-scrollbar">
			<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-3.5">
				{#each Array.from(Array(item_count[data_keys[index]]).keys()) as key}
					{@const isSelected = data[data_keys[index]] === key}
					<button
						class="p-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center relative aspect-square group {isSelected
							? 'bg-emerald-500/15 border-emerald-500 ring-4 ring-emerald-500/25 shadow-lg shadow-emerald-500/15 scale-105'
							: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-400 hover:shadow-md hover:scale-105 active:scale-95'}"
						onclick={() => {
							data[data_keys[index]] = key;
							if (index < 11) {
								index++;
							} else {
								save_finished = undefined;
								finished = true;
							}
						}}
						title="Možnosť {key + 1}"
					>
						<img
							src={get_image_url({ ...data, [data_keys[index]]: key })}
							class="w-full h-full object-contain rounded-xl"
							alt="Možnosť {key + 1}"
							loading="lazy"
						/>
						{#if isSelected}
							<div class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md">
								✓
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Záverečné okno po dokončení tvorby avatara -->
{#if finished}
	<div
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none"
		out:fade|global={{ duration: 200 }}
		in:fade|global={{ duration: 300 }}
	>
		<div
			class="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 my-auto"
			transition:scale={{ duration: 250, start: 0.95 }}
		>
			<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-black tracking-widest uppercase">
				<span>🎉</span> HOTOVO!
			</div>

			<h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
				{$t('avatar_settings.thats_you', { default: 'To si ty!' })}
			</h2>

			<!-- Kruhový náhľad finálneho avatara -->
			<div class="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 p-2 border-4 border-emerald-400 shadow-2xl flex items-center justify-center overflow-hidden">
				<img
					class="w-full h-full object-contain drop-shadow-xl"
					src={get_image_url(data)}
					alt="Tvoj hotový avatar"
				/>
			</div>

			<!-- Akčné tlačidlá -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
				<!-- Uložiť avatara -->
				<button
					onclick={save_avatar}
					disabled={save_finished === true}
					class="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-500/20 disabled:opacity-75 disabled:pointer-events-none"
				>
					{#if save_finished === undefined}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
						</svg>
						<span>{$t('words.save', { default: 'Uložiť avatara' })}</span>
					{:else if save_finished === true}
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
							<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<span>Uložené!</span>
					{:else if save_finished === false}
						<Spinner my_20={false} />
						<span>Ukladám...</span>
					{/if}
				</button>

				<!-- Začať odznova -->
				<button
					onclick={() => {
						index = 0;
						finished = false;
					}}
					class="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
				>
					<span>🔄</span>
					<span>{$t('avatar_settings.start_over', { default: 'Začať odznova' })}</span>
				</button>

				<!-- Späť do nastavení -->
				<a
					href="/account/settings"
					class="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm transition-all cursor-pointer border border-slate-200 dark:border-slate-700 sm:col-span-2"
				>
					<span>{$t('avatar_settings.go_back', { default: 'Späť do nastavení' })}</span>
				</a>
			</div>
		</div>
	</div>
{/if}

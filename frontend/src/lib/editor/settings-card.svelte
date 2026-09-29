<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { EditorData } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import Spinner from '$lib/Spinner.svelte';
	import { createTippy } from 'svelte-tippy';

	const { t } = getLocalization();

	let uppyOpen = $state(false);
	let bg_uppy_open = $state(false);

	interface Props {
		edit_id: string;
		data: EditorData;
	}

	let { edit_id = $bindable(), data = $bindable() }: Props = $props();

	let custom_bg_color = $state(Boolean(data.background_color));
	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle'
	});

	$effect(() => {
		data.background_color = custom_bg_color ? data.background_color : undefined;
	});
</script>

<div class="w-full pb-10">
	<div class="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
		<!-- macOS Chrome Header -->
		<div class="px-6 py-3.5 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="w-3.5 h-3.5 rounded-full bg-rose-400/90 shadow-xs"></span>
				<span class="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-xs"></span>
				<span class="w-3.5 h-3.5 rounded-full bg-emerald-400/90 shadow-xs"></span>
			</div>
			<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/80 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
				<svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<span>{$t('words.settings')} • {$t('editor.main_settings')}</span>
			</div>
			<div class="w-14"></div>
		</div>

		<!-- Card Body -->
		<div
			class="p-6 md:p-10 space-y-8"
			style="background-repeat: no-repeat;background-size: cover;background-position: center;background-image: {data.background_image
				? `url("/api/v1/storage/download/${data.background_image}")`
				: `unset`}"
		>
			<!-- Title Section -->
			<div class="flex flex-col items-center gap-2">
				<label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{$t('words.title')}
				</label>
				<div class="w-full flex justify-center">
					{#await import('$lib/inline-editor.svelte')}
						<Spinner my_20={false} />
					{:then c}
						<c.default bind:text={data.title} />
					{/await}
				</div>
			</div>

			<!-- Description Section -->
			<div class="flex flex-col items-center gap-2">
				<label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{$t('words.description')}
				</label>
				<textarea
					placeholder={$t('editor.description_placeholder') || 'Zadajte popis kvízu...'}
					bind:value={data.description}
					class="w-full max-w-xl p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-center text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-inner resize-none h-20"
				></textarea>
			</div>

			<!-- Cover Image Section -->
			<div class="flex flex-col items-center gap-2">
				<label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{$t('editor.cover_image')}
				</label>
				{#if data.cover_image != undefined && data.cover_image !== ''}
					<div class="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg max-h-72">
						<img
							src="/api/v1/storage/download/{data.cover_image}"
							alt="Cover"
							class="max-h-72 w-auto object-contain rounded-2xl"
						/>
						<div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
							<button
								type="button"
								onclick={() => (data.cover_image = null)}
								class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								<span>{$t('words.delete')}</span>
							</button>
						</div>
					</div>
				{:else}
					<div class="w-full flex justify-center">
						{#await import('$lib/editor/uploader.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default bind:modalOpen={uppyOpen} {data} video_upload={false} />
						{/await}
					</div>
				{/if}
			</div>

			<!-- Options Grid: Visibility & Background -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto pt-4 border-t border-slate-200/80 dark:border-slate-800">
				<!-- Visibility Card -->
				<div class="p-4 rounded-2xl border transition-all flex flex-col justify-between {data.public ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}">
					<div class="flex items-center justify-between mb-3">
						<span class="text-xs font-bold uppercase tracking-wider {data.public ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}">
							{$t('editor.visibility')}
						</span>
						<span class="text-xs font-semibold px-2 py-0.5 rounded-full {data.public ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}">
							{data.public ? $t('words.public') : $t('words.private')}
						</span>
					</div>
					<button
						type="button"
						onclick={() => (data.public = !data.public)}
						class="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer {data.public ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'}"
					>
						{#if data.public}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							<span>{$t('words.public')}</span>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
							<span>{$t('words.private')}</span>
						{/if}
					</button>
				</div>

				<!-- Background Color & Image Card -->
				<div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 flex flex-col justify-between">
					<div class="flex items-center justify-between mb-3">
						<span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							{$t('editor.bg_color')}
						</span>
						<label for="large-toggle" class="inline-flex relative items-center cursor-pointer">
							<input
								type="checkbox"
								bind:checked={custom_bg_color}
								id="large-toggle"
								class="sr-only peer"
							/>
							<span
								class="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"
							></span>
						</label>
					</div>

					<div class="flex items-center justify-between gap-2">
						<span class="text-xs text-slate-600 dark:text-slate-300 font-medium">
							{custom_bg_color ? 'Vlastná farba' : 'Štandardné pozadie'}
						</span>
						{#if custom_bg_color}
							<input
								type="color"
								class="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5 bg-transparent"
								bind:value={data.background_color}
							/>
						{:else}
							<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 border border-emerald-300 dark:border-emerald-800"></div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Background Image Section -->
			<div class="flex flex-col items-center gap-2 max-w-xl mx-auto pt-2">
				<label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{$t('editor.bg_image')}
				</label>
				<div class="w-full flex justify-center">
					{#if data.background_image}
						<button
							type="button"
							onclick={() => {
								data.background_image = undefined;
							}}
							class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
							<span>{$t('editor.remove_bg_image') || 'Odstrániť obrázok pozadia'}</span>
						</button>
					{:else}
						{#await import('$lib/editor/uploader.svelte')}
							<Spinner my_20={false} />
						{:then c}
							<c.default
								bind:modalOpen={bg_uppy_open}
								{data}
								selected_question={-1}
								video_upload={false}
							/>
						{/await}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->
<script lang="ts">
	import { Dashboard as SvelteDashboard } from '@uppy/svelte';
	import Uppy from '@uppy/core';
	import DropTarget from '@uppy/drop-target';
	import XHRUpload from '@uppy/xhr-upload';
	import ImageEditor from '@uppy/image-editor';
	import Dashboard from '@uppy/dashboard';
	import Compressor from '@uppy/compressor';
	import { fade } from 'svelte/transition';

	// CSS imports
	import '@uppy/core/dist/style.css';
	import '@uppy/dashboard/dist/style.css';
	import '@uppy/drop-target/dist/style.css';
	import '@uppy/image-editor/dist/style.css';
	import type { EditorData } from '../quiz_types';
	import { getLocalization } from '$lib/i18n';
	import { onMount } from 'svelte';
	import Library from '$lib/editor/uploader/Library.svelte';
	import Pixabay from '$lib/editor/uploader/Pixabay.svelte';

	const { t } = getLocalization();
	let {
		modalOpen = $bindable(),
		data,
		selected_question,
		video_upload = false,
		library_enabled = true
	}: {
		modalOpen: boolean;
		data: EditorData;
		selected_question?: number;
		video_upload: boolean;
		library_enabled?: boolean;
	} = $props();

	// eslint-disable-next-line no-undef
	let video_popup: undefined | WindowProxy = $state(undefined);

	let selected_type: AvailableUploadTypes | null = $state(null);

	// eslint-disable-next-line no-unused-vars
	enum AvailableUploadTypes {
		// eslint-disable-next-line no-unused-vars
		Image,
		// eslint-disable-next-line no-unused-vars
		Video,
		// eslint-disable-next-line no-unused-vars
		Library,
		// eslint-disable-next-line no-unused-vars
		Pixabay
	}

	const uppy = new Uppy()
		.use(DropTarget, {
			target: document.body
		})
		.use(Dashboard)
		.use(ImageEditor, {
			target: Dashboard,
			quality: 0.8
		})
		.use(Compressor, {
			quality: 0.6
		})
		.use(XHRUpload, {
			endpoint: `/api/v1/storage/`
		});
	const properties = {
		inline: true,
		restrictions: {
			maxFileSize: 10_490_000,
			maxNumberOfFiles: 1,
			allowedFileTypes: ['image/*']
			// allowedFileTypes: ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp']
		}
	};
	let image_id: string;
	uppy.on('upload-success', (file, response) => {
		image_id = response.body.id;
	});
	uppy.on('complete', (_) => {
		if (selected_question === undefined) {
			data.cover_image = image_id;
		} else if (selected_question === -1) {
			data.background_image = image_id;
		} else {
			data.questions[selected_question].image = image_id;
		}

		modalOpen = false;
		selected_type = null;
	});

	onMount(() => {
		window.addEventListener('storage', (e) => {
			if (e.key !== 'video_upload_id') {
				return;
			}
			localStorage.removeItem('video_upload_id');
			data.questions[selected_question].image = e.newValue;
			selected_type = null;
		});
	});

	const upload_video = async () => {
		video_popup = window.open(
			'/edit/videos',
			'_blank',
			'popup=true,toolbar=false,menubar=false,location=false,'
		);
		video_popup.addEventListener('beforeunload', () => {
			video_popup = undefined;
		});
	};

	const handle_on_click = (e: Event) => {
		if (e.target === e.currentTarget) {
			modalOpen = false;
			selected_type = null;
		}
	};
	onMount(() => {
		window.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				modalOpen = false;
				selected_type = null;
			}
		});
	});
</script>

{#if modalOpen}
	<div
		class="w-screen h-screen fixed top-0 left-0 bg-black/50 z-20 flex justify-center"
		onclick={handle_on_click}
		tabindex="0"
		role="button"
		aria-label="Close modal"
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ' ? handle_on_click(e) : null)}
		transition:fade={{ duration: 100 }}
	>
		{#if selected_type === null}
			<div class="m-auto w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
				<div class="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
					<h2 class="text-xl font-extrabold text-slate-800 dark:text-white">{$t('uploader.select_upload_type')}</h2>
					<button
						type="button"
						onclick={() => (modalOpen = false)}
						class="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
					>
						✕
					</button>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<button
						type="button"
						class="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white dark:text-emerald-300 dark:hover:text-white border border-emerald-500/20 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-2 shadow-xs"
						onclick={() => {
							selected_type = AvailableUploadTypes.Image;
						}}
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
						<span>{$t('words.image')}</span>
					</button>

					<button
						type="button"
						disabled={!video_upload}
						class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex flex-col items-center justify-center gap-2 shadow-xs"
						onclick={() => {
							selected_type = AvailableUploadTypes.Video;
						}}
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
						<span>{$t('words.video')}</span>
					</button>

					{#if library_enabled}
						<button
							type="button"
							class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-2 shadow-xs"
							onclick={() => {
								selected_type = AvailableUploadTypes.Library;
							}}
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
							<span>{$t('words.library')}</span>
						</button>
					{/if}

					<button
						type="button"
						class="p-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500 text-teal-700 hover:text-white dark:text-teal-300 dark:hover:text-white border border-teal-500/20 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-2 shadow-xs"
						onclick={() => {
							selected_type = AvailableUploadTypes.Pixabay;
						}}
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
						<span>Pixabay</span>
					</button>
				</div>
			</div>
		{:else if selected_type === AvailableUploadTypes.Image}
			<div class="m-auto w-full max-w-2xl h-5/6" transition:fade={{ duration: 100 }}>
				<div>
					<SvelteDashboard {uppy} width="100%" {properties} />
				</div>
			</div>
		{:else if selected_type === AvailableUploadTypes.Video}
			<div
				class="m-auto w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4"
				transition:fade={{ duration: 100 }}
			>
				<h2 class="text-xl font-extrabold text-center text-slate-800 dark:text-white">{$t('uploader.upload_a_video')}</h2>
				{#if video_popup}
					<p class="text-center text-sm text-slate-600 dark:text-slate-300">
						{$t('uploader.upload_video_popup_notice')}
					</p>
				{:else}
					<button
						type="button"
						onclick={upload_video}
						class="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition cursor-pointer"
					>
						{$t('uploader.upload_video')}
					</button>
				{/if}
			</div>
		{:else if selected_type === AvailableUploadTypes.Library}
			<div>
				<Library bind:data {selected_question} bind:modalOpen />
			</div>
		{:else if selected_type === AvailableUploadTypes.Pixabay}
			<div>
				<Pixabay bind:data {selected_question} bind:modalOpen />
			</div>
		{/if}
	</div>
{/if}
<div class="flex justify-center w-full pt-4" transition:fade>
	<button
		class="w-full max-w-md py-4 px-6 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs"
		type="button"
		onclick={() => {
			modalOpen = true;
		}}
	>
		<svg
			class="w-5 h-5 text-emerald-500"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
		<span>{$t('uploader.add_image')}</span>
	</button>
</div>

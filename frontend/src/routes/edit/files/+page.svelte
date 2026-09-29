<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import type { PageData } from './$types';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Uploader from './uploader.svelte';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let edit_popup: any = $state(null);
	const images = data.images;

	let usedMiB = $derived((data.storage_usage.used / (1024 * 1024)).toFixed(2));
	let totalMiB = $derived((data.storage_usage.limit / (1024 * 1024)).toFixed(0));
	let percent = $derived(
		Math.min(100, Math.round((data.storage_usage.used / data.storage_usage.limit) * 100))
	);

	const close_popup_handler = (e: Event) => {
		if (e.target !== e.currentTarget) return;
		edit_popup = null;
	};
	onMount(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				edit_popup = null;
			}
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	const save_image_metadata = async (e: Event) => {
		e.preventDefault();
		await fetch(`/api/v1/storage/meta/${edit_popup.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ filename: edit_popup.filename, alt_text: edit_popup.alt_text })
		});
		edit_popup = null;
		window.location.reload();
	};

	const delete_image = async (id: string) => {
		if (confirm('Naozaj chcete vymazať tento súbor?')) {
			await fetch(`/api/v1/storage/meta/${id}`, { method: 'DELETE' });
			window.location.reload();
		}
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - Správa médií</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-6xl mx-auto flex flex-col gap-8">

		<!-- Top Storage Dashboard Card -->
		<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<div class="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
						<svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
							Správa médií a úložisko
						</h1>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
							Všetky nahraté obrázky a súbory použité vo vašich kvízoch
						</p>
					</div>
				</div>

				<!-- Stats pills -->
				<div class="flex items-center gap-2 self-start sm:self-center">
					<div class="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
						<span>🖼️</span>
						<span>{images.length} {images.length === 1 ? 'súbor' : images.length >= 2 && images.length <= 4 ? 'súbory' : 'súborov'}</span>
					</div>
					<div class="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
						<span>📊</span>
						<span>{usedMiB} / {totalMiB} MiB ({percent}%)</span>
					</div>
				</div>
			</div>

			<!-- Storage Progress Bar -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
					<span>Využitie úložiska</span>
					<span>{percent}%</span>
				</div>
				<div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80">
					<div
						class="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-500 shadow-sm"
						style="width: {percent}%"
					></div>
				</div>
				<div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
					<span>0 MiB</span>
					<span>{totalMiB} MiB limit</span>
				</div>
			</div>

			<!-- Upload Trigger component -->
			<div class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
				<Uploader />
			</div>
		</div>

		<!-- Media Grid -->
		{#if images.length === 0}
			<div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
				<span class="text-4xl">📂</span>
				<h2 class="text-lg font-bold text-slate-800 dark:text-white">Zatiaľ nemáte nahraté žiadne médiá</h2>
				<p class="text-xs text-slate-400">Použite tlačidlo vyššie na nahratie obrázkov alebo videí pre vaše kvízy.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each images as image}
					{@const isUnused = image.quiztivities.length === 0 && image.quizzes.length === 0}
					<div
						class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group {isUnused ? 'opacity-85' : ''}"
					>
						<!-- Image preview container -->
						<div class="w-full h-48 bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center p-3 relative overflow-hidden border-b border-slate-100 dark:border-slate-800">
							<img
								src="/api/v1/storage/download/{image.id}"
								class="max-h-full max-w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
								alt={image.alt_text || $t('file_dashboard.not_available')}
							/>
							{#if isUnused}
								<span class="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
									Nepoužíva sa
								</span>
							{:else}
								<span class="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
									V kvízoch ({image.quizzes.length + image.quiztivities.length})
								</span>
							{/if}
						</div>

						<!-- Image metadata & Actions -->
						<div class="p-5 flex flex-col gap-4 flex-1 justify-between">
							<div class="flex flex-col gap-1.5">
								<h3 class="font-extrabold text-sm text-slate-800 dark:text-white truncate" title={image.filename}>
									{image.filename || $t('file_dashboard.missing')}
								</h3>
								{#if image.alt_text}
									<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
										„{image.alt_text}“
									</p>
								{/if}

								<div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
									<span>{((image.size || 0) / (1024 * 1024)).toFixed(2)} MiB</span>
									<span>•</span>
									<span>{new Date(image.uploaded_at).toLocaleDateString('sk-SK')}</span>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
								<button
									type="button"
									onclick={() => (edit_popup = image)}
									class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
								>
									<span>✏️</span>
									<span>{$t('file_dashboard.edit_details')}</span>
								</button>

								{#if isUnused}
									<button
										type="button"
										onclick={() => delete_image(image.id)}
										class="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-500/20 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
									>
										<span>🗑️</span>
										<span>{$t('file_dashboard.delete_image')}</span>
									</button>
								{:else}
									<div class="flex items-center justify-center text-[10px] text-slate-400 italic">
										Aktívne v kvíze
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

	</div>
</div>

<!-- Edit Metadata Modal -->
{#if edit_popup}
	<div
		transition:fade={{ duration: 100 }}
		class="fixed inset-0 h-screen w-screen z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
		onclick={close_popup_handler}
	>
		<div class="w-full max-w-md rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
			<div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
				<h2 class="text-xl font-extrabold text-slate-800 dark:text-white">{$t('file_dashboard.edit_the_image')}</h2>
				<button
					type="button"
					onclick={() => (edit_popup = null)}
					class="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
				>
					✕
				</button>
			</div>

			<form class="flex flex-col gap-4" onsubmit={save_image_metadata}>
				<div class="flex flex-col gap-1.5">
					<label for="name" class="text-xs font-bold text-slate-600 dark:text-slate-300">
						{$t('file_dashboard.filename_word')}
					</label>
					<input
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500/50"
						id="name"
						type="text"
						bind:value={edit_popup.filename}
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="alt_text" class="text-xs font-bold text-slate-600 dark:text-slate-300">
						{$t('file_dashboard.alt_text')}
					</label>
					<input
						class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm outline-hidden focus:ring-2 focus:ring-emerald-500/50"
						class:border-rose-500={!edit_popup.alt_text}
						id="alt_text"
						type="text"
						placeholder="Popis obrázka..."
						bind:value={edit_popup.alt_text}
					/>
				</div>

				<div class="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
					<button
						type="button"
						onclick={() => (edit_popup = null)}
						class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
					>
						{$t('words.cancel')}
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition cursor-pointer"
					>
						{$t('words.save')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

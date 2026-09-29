<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { dataSchema } from '$lib/yupSchemas';
	import type { EditorData, Question } from './quiz_types';
	import Sidebar from '$lib/editor/sidebar.svelte';
	import SettingsCard from '$lib/editor/settings-card.svelte';
	import QuizCard from '$lib/editor/card.svelte';
	import Spinner from './Spinner.svelte';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	let schemaInvalid = $state(false);
	let yupErrorMessage = $state('');

	interface Props {
		data: EditorData;
		quiz_id: string | null;
	}

	let { data = $bindable(), quiz_id }: Props = $props();
	let selected_question = $state(-1);

	const validateInput = async (data: EditorData) => {
		try {
			await dataSchema.validate(data, { abortEarly: false });
			schemaInvalid = false;
			yupErrorMessage = '';
		} catch (err) {
			schemaInvalid = true;
			yupErrorMessage = err.errors ? err.errors[0] : '';
		}
	};
	$effect(() => {
		validateInput(data);
	});
	let edit_id: string = $state();
	let confirm_to_leave = true;

	const getEditID = async () => {
		let res: Response;
		if (quiz_id === null) {
			res = await fetch(`/api/v1/editor/start?edit=false`, {
				method: 'POST'
			});
		} else {
			res = await fetch(`/api/v1/editor/start?edit=true&quiz_id=${quiz_id}`, {
				method: 'POST'
			});
		}
		if (res.status === 200) {
			const json = await res.json();
			edit_id = json.token;
		} else {
			alert('Error!');
		}
	};

	const confirmUnload = (event: BeforeUnloadEvent) => {
		if (!confirm_to_leave) {
			return;
		}
		event.preventDefault();
		event.returnValue = 'Are you sure you want to leave?';
		localStorage.setItem('edit_game', JSON.stringify(data));
		return 'unload';
	};
	const saveQuiz = async (e: Event) => {
		e.preventDefault();
		if (schemaInvalid) {
			return;
		}
		const res = await fetch(`/api/v1/editor/finish?edit_id=${edit_id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (res.ok) {
			confirm_to_leave = false;
			console.log(confirm_to_leave);
			window.location.href = '/dashboard';
		} else {
			alert('Error');
		}
	};
</script>

<svelte:window onbeforeunload={confirmUnload} />
{#await getEditID()}
	<div class="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
		<Spinner />
	</div>
{:then _}
	<form onsubmit={saveQuiz} class="h-screen w-screen flex flex-col overflow-hidden bg-slate-100/70 dark:bg-slate-950/80">
		<!-- Top Modern Header -->
		<header class="h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 z-30 shadow-xs">
			<div class="flex items-center gap-3 min-w-0">
				<a
					href="/dashboard"
					class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm font-semibold shrink-0"
					title="Späť na nástenku"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span class="hidden sm:inline">{$t('words.dashboard')}</span>
				</a>
				<div class="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>
				<div class="flex items-center gap-2 min-w-0">
					<span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
						Editor
					</span>
					<h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] md:max-w-xs lg:max-w-md">
						{#if data.title}
							{@html data.title}
						{:else}
							<span class="italic text-slate-400 font-normal">{$t('editor.no_title')}</span>
						{/if}
					</h1>
				</div>
			</div>

			<!-- Center validation status -->
			<div class="hidden md:flex items-center justify-center px-4 min-w-0">
				{#if schemaInvalid}
					<div class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse truncate max-w-md">
						<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<span class="truncate">{yupErrorMessage}</span>
					</div>
				{:else}
					<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
						</svg>
						<span>Pripravené na uloženie</span>
					</div>
				{/if}
			</div>

			<!-- Right: Save button -->
			<div class="flex items-center gap-2 shrink-0">
				<button
					type="submit"
					class="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
					disabled={schemaInvalid}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
					<span>{$t('words.save')}</span>
				</button>
			</div>
		</header>

		<!-- Main Workspace Area -->
		<div class="flex-1 flex overflow-hidden">
			<!-- Left Sidebar -->
			<aside class="w-64 sm:w-72 lg:w-80 shrink-0 h-full border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col overflow-hidden">
				<Sidebar bind:data bind:selected_question />
			</aside>

			<!-- Canvas Center -->
			<main class="flex-1 h-full overflow-y-auto p-4 md:p-8 flex justify-center items-start">
				<div class="w-full max-w-4xl py-2">
					{#if selected_question === -1}
						<SettingsCard bind:data bind:edit_id />
					{:else}
						<QuizCard bind:data bind:selected_question bind:edit_id />
					{/if}
				</div>
			</main>
		</div>
	</form>
{/await}

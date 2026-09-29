<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { captcha_enabled } from '$lib/config';
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { createTippy } from 'svelte-tippy';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();
	let { quiz_id = $bindable() } = $props();
	let captcha_selected = $state(false);
	let selected_game_mode = $state('kahoot');
	let loading = $state(false);
	let custom_field = $state('');
	let cqcs_enabled = $state(false);
	let randomized_answers = $state(false);

	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'top',
		allowHTML: true
	});

	onMount(() => {
		const ls_data = localStorage.getItem('custom_field');
		custom_field = ls_data ? ls_data : '';
	});

	const start_game = async (id: string) => {
		let res;
		loading = true;
		localStorage.setItem('custom_field', custom_field);
		const cqcs_enabled_parsed = cqcs_enabled ? 'True' : 'False';
		const randomized_answers_parsed = randomized_answers ? 'True' : 'False';
		if (captcha_enabled && captcha_selected) {
			res = await fetch(
				`/api/v1/quiz/start/${id}?captcha_enabled=True&game_mode=${selected_game_mode}&custom_field=${custom_field}&cqcs_enabled=${cqcs_enabled_parsed}`,
				{
					method: 'POST'
				}
			);
		} else {
			res = await fetch(
				`/api/v1/quiz/start/${id}?captcha_enabled=False&game_mode=${selected_game_mode}&custom_field=${custom_field}&cqcs_enabled=${cqcs_enabled_parsed}&randomize_answers=${randomized_answers_parsed}`,
				{
					method: 'POST'
				}
			);
		}
		if (res.status !== 200) {
			alert('Starting game failed');
			window.location.assign('/account/login?returnTo=/dashboard');
		} else {
			const data = await res.json();
			if (typeof (window as any).plausible !== 'undefined') {
				(window as any).plausible('Started Game', { props: { quiz_id: id, game_id: data.game_id } });
			}
			window.location.assign(
				`/admin?token=${data.game_id}&pin=${data.game_pin}&connect=1&cqc_code=${data.cqc_code}`
			);
		}
	};

	const on_parent_click = (e: Event) => {
		if (e.target !== e.currentTarget) {
			return;
		}
		quiz_id = null;
	};
	const close_start_game_if_esc_is_pressed = (key: KeyboardEvent) => {
		if (key.code === 'Escape') {
			quiz_id = null;
		}
	};
	onMount(() => {
		document.body.addEventListener('keydown', close_start_game_if_esc_is_pressed);
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto select-none"
	transition:fade={{ duration: 150 }}
	onclick={on_parent_click}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Escape' && (quiz_id = null)}
>
	<div
		class="relative w-full max-w-2xl bg-slate-900/95 text-white border-2 border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-5 my-auto"
		transition:scale={{ duration: 200, start: 0.95 }}
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Tlačidlo Zavrieť (X) -->
		<button
			type="button"
			class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
			onclick={() => (quiz_id = null)}
			aria-label="Zatvoriť"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Hlavička modálu -->
		<div class="text-center pr-6">
			<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black tracking-widest uppercase mb-1.5">
				<span>🎮</span> SPUSTENIE KVÍZU
			</div>
			<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
				Nastavenie herného režimu
			</h2>
		</div>

		<!-- Režimy hry (2 karty) -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
			<!-- Karta 1: Normálne (Kahoot) -->
			<div
				class="rounded-2xl p-4 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between {selected_game_mode === 'kahoot'
					? 'bg-slate-800/90 border-emerald-400 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/20'
					: 'bg-slate-800/40 border-slate-700/70 opacity-60 hover:opacity-100 hover:border-slate-600'}"
				onclick={() => {
					selected_game_mode = 'kahoot';
				}}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && (selected_game_mode = 'kahoot')}
			>
				<div>
					<div class="flex items-center justify-between mb-2">
						<span class="text-2xl">📱</span>
						{#if selected_game_mode === 'kahoot'}
							<span class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
						{/if}
					</div>
					<h3 class="font-black text-lg text-white mb-1.5">{$t('words.normal', { default: 'Normálne' })}</h3>
					<p class="text-xs text-slate-300 leading-relaxed">
						{$t('start_game.normal_mode_description')}
					</p>
				</div>
				<div class="mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-bold text-emerald-400">
					Odporúčaný režim
				</div>
			</div>

			<!-- Karta 2: Klasický režim (Old-School) -->
			<div
				class="rounded-2xl p-4 cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between {selected_game_mode === 'normal'
					? 'bg-slate-800/90 border-emerald-400 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/20'
					: 'bg-slate-800/40 border-slate-700/70 opacity-60 hover:opacity-100 hover:border-slate-600'}"
				onclick={() => {
					selected_game_mode = 'normal';
				}}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && (selected_game_mode = 'normal')}
			>
				<div>
					<div class="flex items-center justify-between mb-2">
						<span class="text-2xl">🖥️</span>
						{#if selected_game_mode === 'normal'}
							<span class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
						{/if}
					</div>
					<h3 class="font-black text-lg text-white mb-1.5">{$t('start_game.old_school_mode', { default: 'Klasický režim' })}</h3>
					<p class="text-xs text-slate-300 leading-relaxed">
						{$t('start_game.old_school_mode_description')}
					</p>
				</div>
				<div class="mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-bold text-slate-400">
					Všetko aj na mobiloch
				</div>
			</div>
		</div>

		<!-- Nastavenia a prepínače -->
		<div class="flex flex-col gap-3 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60">
			<!-- Prepínač: Náhodné poradie odpovedí -->
			<label class="flex items-center justify-between cursor-pointer group">
				<div class="flex flex-col">
					<span class="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
						Náhodné poradie odpovedí
					</span>
					<span class="text-xs text-slate-400">Premieša možnosti odpovedí pri každej otázke</span>
				</div>
				<div class="relative inline-flex items-center">
					<input type="checkbox" bind:checked={randomized_answers} class="sr-only peer" />
					<div class="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
				</div>
			</label>

			<hr class="border-slate-700/50 my-0.5" />

			<!-- Prepínač: ClassQuiz ovládače -->
			<label class="flex items-center justify-between cursor-pointer group">
				<div class="flex flex-col">
					<div class="flex items-center gap-1.5">
						<span class="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
							Podpora ClassQuiz2Controllers
						</span>
						<a
							href="/controller"
							target="_blank"
							onclick={(e) => e.stopPropagation()}
							use:tippy={{ content: 'Hardvérové ovládače pre hranie bez mobilov. Kliknutím zistíte viac.' }}
							class="text-xs text-emerald-400 underline decoration-dotted"
						>(info)</a>
					</div>
					<span class="text-xs text-slate-400">Povolí pripájanie fyzických USB/WiFi ovládačov</span>
				</div>
				<div class="relative inline-flex items-center">
					<input type="checkbox" bind:checked={cqcs_enabled} class="sr-only peer" />
					<div class="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
				</div>
			</label>

			{#if captcha_enabled}
				<hr class="border-slate-700/50 my-0.5" />
				<!-- Prepínač: reCAPTCHA -->
				<label class="flex items-center justify-between cursor-pointer group">
					<div class="flex flex-col">
						<span class="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
							Google reCAPTCHA ochrana
						</span>
						<span class="text-xs text-slate-400">Ochrana pred spamom a botmi pri pripájaní</span>
					</div>
					<div class="relative inline-flex items-center">
						<input type="checkbox" bind:checked={captcha_selected} class="sr-only peer" />
						<div class="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
					</div>
				</label>
			{/if}

			<hr class="border-slate-700/50 my-0.5" />

			<!-- Vlastné vstupné pole -->
			<div class="flex flex-col gap-1.5">
				<label for="custom_field_input" class="font-bold text-xs uppercase tracking-wider text-slate-300">
					{$t('result_page.custom_field', { default: 'Vlastné pole pre hráčov' })} (nepovinné)
				</label>
				<input
					id="custom_field_input"
					bind:value={custom_field}
					class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
					placeholder="Napr. Telefónne číslo, E-mail alebo Trieda"
				/>
			</div>
		</div>

		<!-- Tlačidlo Spustiť kvíz (Moderné, žiadny písaný font!) -->
		<button
			type="button"
			class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-lg sm:text-xl tracking-wide shadow-2xl shadow-emerald-500/30 border-2 border-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={loading}
			onclick={() => {
				start_game(quiz_id);
			}}
		>
			{#if loading}
				<div class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
				<span>Pripravujem hru...</span>
			{:else}
				<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
				<span class="drop-shadow-sm">{$t('start_game.start_game', { default: 'Spustiť kvíz' })}</span>
			{/if}
		</button>
	</div>
</div>

<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { socket } from '$lib/socket';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as Sentry from '@sentry/browser';
	import { getLocalization } from '$lib/i18n';
	import Cookies from 'js-cookie';
	import { hcaptcha_site_key, recaptcha_key, sentry_dsn } from '$lib/config';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { ANIMAL_AVATARS, formatPlayer } from '$lib/avatars';
	import { APP_VERSION } from '$lib/version';

	const { t } = getLocalization();

	interface Props {
		game_pin: string;
		game_mode: any;
		username: any;
	}

	let {
		game_pin = $bindable(),
		game_mode = $bindable(),
		username = $bindable()
	}: Props = $props();

	let rawUsername = $state('');
	let selectedAvatar = $state('fox');
	let currentAvatarDef = $derived(
		ANIMAL_AVATARS.find((a) => a.id === selectedAvatar) || ANIMAL_AVATARS[0]
	);

	let custom_field = $state();
	let custom_field_value = $state();
	let captcha_enabled = $state();

	let hcaptchaSitekey = hcaptcha_site_key;

	let hcaptcha = {
		execute: async (_a, _b) => ({ response: '' }), // eslint-disable-line @typescript-eslint/no-unused-vars
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		render: (_a, _b) => {} // eslint-disable-line @typescript-eslint/no-unused-vars
	};
	let hcaptchaWidgetID;

	let darkMode = $state(false);
	if (browser) {
		darkMode =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) &&
				window.matchMedia('(prefers-color-scheme: dark)').matches);
	}

	const switchDarkMode = () => {
		!darkMode ? localStorage.setItem('theme', 'dark') : localStorage.setItem('theme', 'light');
		window.location.reload();
	};

	let currentLang = $state('sk');
	if (browser) {
		currentLang = localStorage.getItem('language') ?? 'sk';
	}
	const setLang = (code: string) => {
		if (browser) {
			localStorage.setItem('language', code);
			window.location.reload();
		}
	};

	onMount(() => {
		if (browser) {
			const savedAvatar = localStorage.getItem('player_avatar');
			if (savedAvatar) {
				selectedAvatar = savedAvatar;
			}
			prefetch_username();
			hcaptcha = window.hcaptcha;
			if (hcaptcha.render) {
				hcaptchaWidgetID = hcaptcha.render('hcaptcha', {
					sitekey: hcaptchaSitekey,
					size: 'invisible',
					theme: 'dark'
				});
			}
		}
	});

	onDestroy(() => {
		if (browser) {
			hcaptcha = {
				execute: async () => ({ response: '' }),
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				render: () => {}
			};
		}
	});

	const prefetch_username = async () => {
		const res = await fetch('/api/v1/users/me');
		if (res.status !== 200) {
			return;
		}
		const json = await res.json();
		if (json.username) {
			rawUsername = json.username;
		}
	};

	const set_game_pin = async () => {
		let process_var;
		try {
			process_var = process;
		} catch {
			process_var = { env: { API_URL: undefined } };
		}

		const res = await fetch(
			`${process_var.env.API_URL ?? ''}/api/v1/quiz/play/check_captcha/${game_pin}`
		);
		const json = await res.json();
		game_mode = json.game_mode;
		if (res.status === 200) {
			captcha_enabled = json.enabled;
			custom_field = json.custom_field;
		}
		if (res.status === 404) {
			if (browser) {
				alert('Hra sa nenašla');
			}
			game_pin = '';
			return;
		}
		if (res.status !== 200) {
			alert('Neznáma chyba');
			return;
		}
	};

	$effect(() => {
		if (game_pin.length > 5) {
			set_game_pin();
		}
	});

	const setUsername = async (e: Event) => {
		e.preventDefault();
		const trimmed = rawUsername.trim();
		if (trimmed.length < 2) {
			return;
		}
		if (browser) {
			localStorage.setItem('player_avatar', selectedAvatar);
		}
		const fullUsername = formatPlayer(trimmed, selectedAvatar);
		username = fullUsername;

		let captcha_resp: string;
		if (Cookies.get('kicked')) {
			console.log("%cYou're Banned!", 'font-size:6rem');
			return;
		}

		if (captcha_enabled) {
			if (hcaptchaSitekey) {
				try {
					const { response } = await hcaptcha.execute(hcaptchaWidgetID, {
						async: true
					});
					captcha_resp = response;
					socket.emit('join_game', {
						username: fullUsername,
						game_pin: game_pin,
						captcha: captcha_resp,
						custom_field: custom_field ? custom_field_value : undefined
					});
				} catch (err) {
					if (sentry_dsn !== null) {
						Sentry.captureException(err);
					}
					alert('Captcha zlyhala!');
					window.location.reload();
				}
			} else if (recaptcha_key) {
				// eslint-disable-next-line no-undef
				grecaptcha.ready(() => {
					// eslint-disable-next-line no-undef
					grecaptcha.execute(recaptcha_key, { action: 'submit' }).then(function (token) {
						socket.emit('join_game', {
							username: fullUsername,
							game_pin: game_pin,
							captcha: token,
							custom_field: custom_field ? custom_field_value : undefined
						});
					});
				});
			}
		} else {
			socket.emit('join_game', {
				username: fullUsername,
				game_pin: game_pin,
				captcha: undefined,
				custom_field: custom_field ? custom_field_value : undefined
			});
		}
	};

	socket.on('game_not_found', () => {
		game_pin = '';
		if (browser) {
			alert('Hra sa nenašla');
		}
	});

	$effect(() => {
		const cleaned = game_pin.replace(/\D/g, '');
		if (game_pin.replace(/\D/g, '') === game_pin) {
			return;
		}
		game_pin = cleaned;
	});
</script>

<svelte:head>
	{#if captcha_enabled && hcaptchaSitekey}
		<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
	{/if}
	{#if recaptcha_key && captcha_enabled}
		<script src="https://www.google.com/recaptcha/api.js?render={recaptcha_key}"></script>
	{/if}
</svelte:head>

{#if game_pin === '' || game_pin.length < 6}
	<div class="min-h-screen w-screen flex flex-col justify-between items-center bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-6 transition-colors selection:bg-emerald-500 selection:text-white">
		
		<!-- Top Bar with Branding and Language/Theme Switcher -->
		<header class="w-full max-w-4xl flex items-center justify-between px-2">
			<a href="/" class="flex items-center gap-2 group cursor-pointer">
				<span class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">ClassQuiz2</span>
				<span class="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{APP_VERSION}</span>
			</a>

			<div class="flex items-center gap-2">
				<!-- Dark mode switch -->
				<button
					type="button"
					onclick={switchDarkMode}
					class="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all text-amber-500 cursor-pointer"
					title={darkMode ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim'}
					aria-label="Prepnúť režim"
				>
					{#if darkMode}
						<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					{:else}
						<svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{/if}
				</button>

				<!-- Language toggle SK / GB -->
				<div class="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
					<button
						type="button"
						class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {currentLang === 'sk' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}"
						onclick={() => setLang('sk')}
						title="Slovenčina"
					>
						<svg class="w-4 h-3 rounded-xs shadow-2xs shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
							<rect width="900" height="600" fill="#ee1c25"/>
							<rect width="900" height="400" fill="#0b4ea2"/>
							<rect width="900" height="200" fill="#ffffff"/>
							<g transform="translate(240, 300) scale(1.15)">
								<path d="M-80,-140 h160 v140 a80,80 0 0 1 -160,0 z" fill="#ee1c25" stroke="#ffffff" stroke-width="12"/>
								<path d="M-72,25 a40,40 0 0 1 48,-20 a40,40 0 0 1 48,0 a40,40 0 0 1 48,20 z" fill="#0b4ea2"/>
								<path d="M-24,5 a40,40 0 0 1 48,0 v20 h-48 z" fill="#0b4ea2"/>
								<path d="M-6,-90 h12 v110 h-12 z M-36,-65 h72 v12 h-72 z M-26,-35 h52 v12 h-52 z" fill="#ffffff"/>
							</g>
						</svg>
						<span>SK</span>
					</button>
					<button
						type="button"
						class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer {currentLang === 'en' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'}"
						onclick={() => setLang('en')}
						title="English"
					>
						<svg class="w-4 h-3 rounded-xs shadow-2xs shrink-0 overflow-hidden" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
							<rect width="60" height="30" fill="#012169"/>
							<path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" stroke-width="6"/>
							<path d="M0 0 L30 15 M60 30 L30 15 M60 0 L30 15 M0 30 L30 15" stroke="#c8102e" stroke-width="2"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#ffffff" stroke-width="10"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#c8102e" stroke-width="6"/>
						</svg>
						<span>GB</span>
					</button>
				</div>
			</div>
		</header>

		<!-- Main PIN card -->
		<main class="my-auto w-full max-w-md">
			<form
				onsubmit={(e) => { e.preventDefault(); if (game_pin.length === 6) set_game_pin(); }}
				class="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border-2 border-slate-200/90 dark:border-slate-800 transition-all text-center flex flex-col items-center"
			>
				<!-- Subtle top decorative gradient line -->
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"></div>

				<!-- Game controller badge with glowing emerald halo -->
				<div class="relative mb-4">
					<div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/20 flex items-center justify-center text-4xl text-white transform hover:scale-105 transition-transform duration-300">
						<span>🎮</span>
					</div>
				</div>

				<h1 class="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
					{$t('words.game_pin', { default: 'Herný PIN' })}
				</h1>
				<p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
					{$t('play_page.enter_pin_description', { defaultValue: 'Zadaj 6-miestny kód z obrazovky alebo projektora' })}
				</p>

				<!-- Tactile PIN Input -->
				<div class="w-full relative mb-5">
					<input
						class="w-full border-2 border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 text-center text-slate-900 dark:text-white font-mono text-3xl sm:text-4xl font-black py-4 px-4 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-inner tracking-[0.35em] placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
						bind:value={game_pin}
						maxlength="6"
						inputmode="numeric"
						autocomplete="off"
						placeholder={$t('words.game_pin', { default: 'PIN hry' })}
						autofocus
					/>
				</div>

				<!-- 6-digit indicator dots -->
				<div class="flex items-center justify-center gap-2 mb-6">
					{#each [0, 1, 2, 3, 4, 5] as i}
						<div
							class="w-3 h-3 rounded-full transition-all duration-200 {i < game_pin.length ? 'bg-emerald-500 scale-110 shadow-xs shadow-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}"
						></div>
					{/each}
				</div>

				<!-- Modern Gaming Submit Button -->
				<button
					type="submit"
					disabled={game_pin.length < 6}
					class="w-full py-4 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/25 border-2 border-emerald-400/60 ring-4 ring-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-3 group"
				>
					<span>{$t('words.submit', { default: 'Potvrdiť PIN' })}</span>
					<svg class="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</button>
			</form>
		</main>

		<!-- Footer info -->
		<footer class="w-full max-w-md text-center py-2 text-xs text-slate-400 dark:text-slate-500">
			<span>ClassQuiz2 &bull; {$t('index_page.multilingual', { default: 'Viacjazyčné' })}</span>
		</footer>
	</div>
{:else}
	<div class="min-h-screen w-screen flex flex-col justify-between items-center bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-6 transition-colors selection:bg-emerald-500 selection:text-white">
		
		<!-- Header with PIN badge and change button -->
		<header class="w-full max-w-md flex items-center justify-between px-2 mb-2">
			<a href="/" class="flex items-center gap-2 group cursor-pointer">
				<span class="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">ClassQuiz2</span>
				<span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{APP_VERSION}</span>
			</a>

			<div class="flex items-center gap-2">
				<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
					<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">PIN:</span>
					<span class="font-mono font-black text-emerald-600 dark:text-emerald-400">{game_pin}</span>
					<button
						type="button"
						onclick={() => { game_pin = ''; }}
						class="text-xs text-slate-400 hover:text-red-500 underline ml-1 cursor-pointer"
						title={$t('words.change', { default: 'Zmeniť PIN' })}
					>
						{$t('words.change', { default: 'Zmeniť' })}
					</button>
				</div>
			</div>
		</header>

		<!-- Card with Avatar Selection & Nickname -->
		<main class="my-auto w-full max-w-md">
			<div class="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-slate-200/90 dark:border-slate-800 transition-all">
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"></div>

				<!-- Selected Avatar Preview -->
				<div class="flex flex-col items-center mb-5">
					<div class="p-1 rounded-full ring-4 ring-emerald-500/80 shadow-2xl bg-white dark:bg-slate-800 transition-all transform hover:scale-105">
						<AnimalAvatar avatarId={selectedAvatar} size={88} class="shadow-md" />
					</div>
					<h2 class="text-xl font-black mt-3 text-slate-800 dark:text-slate-100 flex items-center gap-2">
						<span>{currentAvatarDef.name}</span>
					</h2>
					<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentAvatarDef.description}</p>
				</div>

				<!-- 12 Animal Avatars Picker -->
				<div class="mb-5">
					<label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
						Vyber si zvieratko ({ANIMAL_AVATARS.length} druhov v oblečení)
					</label>
					<div class="grid grid-cols-6 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
						{#each ANIMAL_AVATARS as avatar}
							<button
								type="button"
								class="p-1 rounded-xl transition-all flex items-center justify-center relative hover:scale-115 active:scale-95 cursor-pointer {selectedAvatar === avatar.id ? 'ring-3 ring-emerald-500 scale-105 bg-emerald-100 dark:bg-emerald-950/60 shadow-xs' : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60'}"
								onclick={() => {
									selectedAvatar = avatar.id;
								}}
								title="{avatar.name} – {avatar.description}"
							>
								<AnimalAvatar avatarId={avatar.id} size={42} class="shadow-2xs" />
							</button>
						{/each}
					</div>
				</div>

				<form onsubmit={setUsername} class="flex flex-col gap-4">
					<div>
						<label for="nickname-input" class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-center">
							Tvoje meno / prezývka
						</label>
						<div class="relative flex items-center">
							<div class="absolute left-3.5 pointer-events-none flex items-center justify-center">
								<AnimalAvatar avatarId={selectedAvatar} size={28} />
							</div>
							<input
								id="nickname-input"
								class="w-full pl-13 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center font-black text-slate-800 dark:text-white text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition shadow-inner"
								bind:value={rawUsername}
								placeholder="Zadaj meno..."
								maxlength="17"
								required
								autocomplete="off"
							/>
						</div>
					</div>

					{#if custom_field}
						<div>
							<label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 text-center">
								{custom_field}
							</label>
							<input
								class="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition"
								bind:value={custom_field_value}
							/>
						</div>
					{/if}

					<div class="mt-2">
						<button
							type="submit"
							disabled={rawUsername.trim().length < 2}
							class="w-full py-4 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/25 border-2 border-emerald-400/60 ring-4 ring-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-3"
						>
							<span>{$t('play_page.enter_game', { defaultValue: 'Prihlásiť sa do quízu' })}</span>
							<AnimalAvatar avatarId={selectedAvatar} size={26} />
						</button>
					</div>
				</form>
			</div>
		</main>

		<footer class="w-full max-w-md text-center py-2 text-xs text-slate-400 dark:text-slate-500">
			<span>ClassQuiz2 &bull; {$t('index_page.multilingual', { default: 'Viacjazyčné' })}</span>
		</footer>
	</div>
{/if}
<div
	id="hcaptcha"
	class="h-captcha"
	data-sitekey={hcaptchaSitekey}
	data-size="invisible"
	data-theme="dark"
></div>

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
	import BrownButton from '$lib/components/buttons/brown.svelte';
	import { hcaptcha_site_key, recaptcha_key, sentry_dsn } from '$lib/config';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { ANIMAL_AVATARS, formatPlayer } from '$lib/avatars';

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
				alert('Game not found');
			}
			game_pin = '';
			return;
		}
		if (res.status !== 200) {
			alert('Unknown error');
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
					alert('Captcha failed!');
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
			alert('Game not found');
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
	<div class="flex flex-col justify-center items-center w-screen h-screen px-4">
		<form class="flex-col flex justify-center items-center mx-auto w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
			<h1 class="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">{$t('words.game_pin')}</h1>
			<input
				class="border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 self-center text-center text-gray-900 dark:text-white font-mono text-2xl font-bold p-3 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden w-full transition-all shadow-inner tracking-widest"
				bind:value={game_pin}
				maxlength="6"
				inputmode="numeric"
				placeholder="PIN hry"
			/>
			<div class="mt-6 w-full">
				<BrownButton disabled={game_pin.length < 6}>{$t('words.submit')}</BrownButton>
			</div>
		</form>
	</div>
{:else}
	<div class="flex flex-col justify-center items-center w-screen min-h-screen py-8 px-4">
		<div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
			<!-- Vybraný avatar preview -->
			{@const currentAvatarDef = ANIMAL_AVATARS.find((a) => a.id === selectedAvatar) || ANIMAL_AVATARS[0]}
			<div class="flex flex-col items-center mb-5">
				<div class="p-1 rounded-full ring-4 ring-emerald-500 shadow-xl bg-white dark:bg-gray-700 transition-all transform hover:scale-105">
					<AnimalAvatar avatarId={selectedAvatar} size={88} class="shadow-md" />
				</div>
				<h2 class="text-xl font-bold mt-2 text-gray-800 dark:text-gray-100 flex items-center gap-2">
					<span>{currentAvatarDef.name}</span>
				</h2>
				<p class="text-xs text-gray-600 dark:text-gray-300 font-medium">{currentAvatarDef.description}</p>
			</div>

			<!-- Výber z 12 kreslených zvieratiek v oblečení -->
			<div class="mb-5">
				<label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 text-center">
					Vyber si zvieratko ({ANIMAL_AVATARS.length} druhov v oblečení)
				</label>
				<div class="grid grid-cols-6 gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
					{#each ANIMAL_AVATARS as avatar}
						<button
							type="button"
							class="p-1 rounded-full transition-all flex items-center justify-center relative hover:scale-115 active:scale-95 cursor-pointer"
							class:ring-3={selectedAvatar === avatar.id}
							class:ring-emerald-500={selectedAvatar === avatar.id}
							class:scale-105={selectedAvatar === avatar.id}
							class:bg-emerald-500/20={selectedAvatar === avatar.id}
							onclick={() => {
								selectedAvatar = avatar.id;
							}}
							title="{avatar.name} – {avatar.description}"
						>
							<AnimalAvatar avatarId={avatar.id} size={42} class="shadow-sm" />
						</button>
					{/each}
				</div>
			</div>

			<form onsubmit={setUsername} class="flex flex-col gap-4">
				<div>
					<label for="nickname-input" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 text-center">
						Tvoje meno / prezývka
					</label>
					<div class="relative flex items-center">
						<div class="absolute left-3 pointer-events-none">
							<AnimalAvatar avatarId={selectedAvatar} size={28} />
						</div>
						<input
							id="nickname-input"
							class="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-center font-bold text-gray-800 dark:text-white text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-sm"
							bind:value={rawUsername}
							placeholder="Zadaj meno..."
							maxlength="17"
							required
						/>
					</div>
				</div>

				{#if custom_field}
					<div>
						<label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 text-center">
							{custom_field}
						</label>
						<input
							class="w-full py-2 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-center text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
							bind:value={custom_field_value}
						/>
					</div>
				{/if}

				<div class="mt-2">
					<button
						type="submit"
						disabled={rawUsername.trim().length < 2}
						class="w-full py-3 px-4 rounded-xl font-bold text-lg text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
					>
						<span>Vstúpiť do hry</span>
						<AnimalAvatar avatarId={selectedAvatar} size={24} />
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
<div
	id="hcaptcha"
	class="h-captcha"
	data-sitekey={hcaptchaSitekey}
	data-size="invisible"
	data-theme="dark"
></div>

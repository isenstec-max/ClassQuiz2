<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { getLocalization } from '$lib/i18n';
	import { DateTime } from 'luxon';
	import { UAParser } from 'ua-parser-js';
	import Spinner from '$lib/Spinner.svelte';
	import { onMount } from 'svelte';

	const { t } = getLocalization();

	interface UserAccount {
		id: string;
		email: string;
		username: string;
		verified: boolean;
		created_at: string;
	}

	interface ChangePasswordData {
		oldPassword: string;
		newPassword: string;
		newPasswordConfirm: string;
	}

	let changePasswordData: ChangePasswordData = $state({
		oldPassword: '',
		newPassword: '',
		newPasswordConfirm: ''
	});

	let this_session = $state();
	let isChangingPassword = $state(false);
	let copiedKey = $state<string | null>(null);
	let showOldPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let passwordChangeDataValid = $derived(
		changePasswordData.newPassword === changePasswordData.newPasswordConfirm &&
			changePasswordData.newPassword.length >= 8 &&
			changePasswordData.oldPassword !== changePasswordData.newPassword &&
			changePasswordData.oldPassword !== ''
	);

	const changePassword = async (e: Event) => {
		e.preventDefault();
		if (!passwordChangeDataValid || isChangingPassword) {
			return;
		}
		isChangingPassword = true;
		try {
			const res = await fetch('/api/v1/users/password/update', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					old_password: changePasswordData.oldPassword,
					new_password: changePasswordData.newPassword
				})
			});
			if (res.status === 200) {
				alert('Heslo bolo úspešne zmenené. Budete presmerovaný na prihlásenie.');
				window.location.assign('/account/login');
			} else {
				alert('Zmena hesla zlyhala. Skontrolujte prosím zadané staré heslo.');
			}
		} catch (err) {
			alert('Nastala chyba pri zmene hesla.');
		} finally {
			isChangingPassword = false;
		}
	};

	const getUser = async (): Promise<UserAccount> => {
		const response = await fetch('/api/v1/users/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (response.status === 200) {
			return await response.json();
		} else {
			window.location.assign('/account/login');
			throw new Error('Not logged in');
		}
	};

	let api_keys = $state<Promise<Array<{ key: string }>> | undefined>();

	const get_api_keys = async (): Promise<Array<{ key: string }>> => {
		const res = await fetch('/api/v1/users/api_keys');
		if (res.status === 200) {
			const data = await res.json();
			return Array.isArray(data) ? data : [];
		}
		return [];
	};

	onMount(() => {
		api_keys = get_api_keys();
	});

	const add_api_key = async () => {
		await fetch('/api/v1/users/api_keys', { method: 'POST' });
		api_keys = get_api_keys();
	};

	const delete_api_key = async (key: string) => {
		if (confirm('Naozaj chcete vymazať tento API kľúč?')) {
			await fetch(`/api/v1/users/api_keys?api_key=${key}`, { method: 'DELETE' });
			api_keys = get_api_keys();
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copiedKey = text;
			setTimeout(() => {
				if (copiedKey === text) copiedKey = null;
			}, 2500);
		} catch (e) {
			console.error('Failed to copy', e);
		}
	};

	const formatDate = (date: string): string => {
		if (!date) return '-';
		const dt = DateTime.fromISO(date);
		return dt.toLocaleString(DateTime.DATETIME_MED);
	};

	const getSessions = async () => {
		const res = await fetch('/api/v1/users/sessions/list');
		if (res.status === 200) {
			const res2 = await fetch('/api/v1/users/session');
			if (res2.status === 200) {
				this_session = await res2.json();
			}
			return await res.json();
		} else {
			window.location.assign('/account/login?returnTo=/account/settings');
		}
		return [];
	};

	const parseUserAgent = (userAgent: string) => {
		try {
			const parser = new UAParser(userAgent);
			const result = parser.getResult();
			const browser = `${result.browser.name || 'Neznámy prehliadač'} ${result.browser.version || ''}`.trim();
			const os = `${result.os.name || 'Neznámy OS'} ${result.os.version || ''}`.trim();
			return { browser, os };
		} catch {
			return { browser: userAgent || 'Neznámy prehliadač', os: 'Neznámy OS' };
		}
	};

	const deleteSession = async (session_id: string) => {
		if (confirm('Naozaj chcete ukončiť túto reláciu?')) {
			const res = await fetch(`/api/v1/users/sessions/${session_id}`, {
				method: 'DELETE'
			});
			if (res.status === 200) {
				window.location.reload();
			}
		}
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - Nastavenia účtu</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-6xl mx-auto space-y-8">
		<!-- Page Header -->
		<div>
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
				{$t('navbar.settings')}
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
				Správa profilu a účtu
			</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
				Prispôsobte si svoj profil, spravujte prihlasovacie údaje, API prístupy a aktívne relácie.
			</p>
		</div>

		{#await getUser()}
			<div class="flex justify-center py-20">
				<Spinner />
			</div>
		{:then user}
			<!-- Profile Hero Card -->
			<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col lg:flex-row items-center justify-between gap-6 transition-all">
				<div class="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto text-center sm:text-left">
					<!-- Avatar Container -->
					<div class="relative group shrink-0">
						<div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-4 ring-emerald-500/10">
							<img
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								src="/api/v1/users/avatar"
								alt="Profile image of {user.username}"
							/>
						</div>
						<a
							href="/account/settings/avatar"
							class="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md transition-transform hover:scale-110"
							title={$t('settings_page.change_avatar')}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</a>
					</div>

					<!-- User Details -->
					<div>
						<div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
							<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
								{user.username}
							</h2>
							{#if user.verified}
								<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
									<svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
									Overený účet
								</span>
							{/if}
						</div>
						<p class="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center justify-center sm:justify-start gap-2">
							<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							{user.email}
						</p>
						{#if user.created_at}
							<p class="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
								<svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Členom od {formatDate(user.created_at)}
							</p>
						{/if}
					</div>
				</div>

				<!-- Quick Actions Navigation -->
				<div class="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
					<a
						href="/account/settings/avatar"
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/60 dark:border-slate-700 shadow-sm"
					>
						<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						{$t('settings_page.change_avatar')}
					</a>
					<a
						href="/account/settings/security"
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/60 dark:border-slate-700 shadow-sm"
					>
						<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
						{$t('settings_page.security_settings')}
					</a>
					<a
						href="/account/controllers"
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/60 dark:border-slate-700 shadow-sm"
					>
						<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
						</svg>
						Ovládače
					</a>
					<a
						href="/user/{user.id}"
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-all border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm"
					>
						<svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
						Verejný profil
					</a>
				</div>
			</div>

			<!-- Grid: Password Change & API Keys -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Card 1: Change Password -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
					<div>
						<!-- Card Header -->
						<div class="flex items-center gap-3.5 mb-6">
							<div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
								</svg>
							</div>
							<div>
								<h3 class="text-xl font-bold text-slate-900 dark:text-white">
									{$t('settings_page.change_password_submit')}
								</h3>
								<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
									Aktualizujte si prihlasovacie heslo pre vyššiu bezpečnosť.
								</p>
							</div>
						</div>

						<!-- Form -->
						<form onsubmit={changePassword} class="space-y-4">
							<!-- Staré heslo -->
							<div>
								<label for="old-pwd" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
									<span>{$t('settings_page.old_password')}</span>
								</label>
								<div class="relative flex items-center">
									<div class="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
									<input
										id="old-pwd"
										type={showOldPassword ? 'text' : 'password'}
										required
										placeholder="Zadajte aktuálne heslo"
										class="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium hover:border-emerald-400 dark:hover:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-all"
										bind:value={changePasswordData.oldPassword}
									/>
									<button
										type="button"
										onclick={() => (showOldPassword = !showOldPassword)}
										class="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
										title={showOldPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
									>
										{#if showOldPassword}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
										{:else}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
										{/if}
									</button>
								</div>
							</div>

							<!-- Nové heslo -->
							<div>
								<label for="new-pwd" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
									<span>{$t('settings_page.new_password')}</span>
								</label>
								<div class="relative flex items-center">
									<div class="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
										</svg>
									</div>
									<input
										id="new-pwd"
										type={showNewPassword ? 'text' : 'password'}
										required
										minlength="8"
										placeholder="Minimálne 8 znakov"
										class="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium hover:border-emerald-400 dark:hover:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-all"
										bind:value={changePasswordData.newPassword}
									/>
									<button
										type="button"
										onclick={() => (showNewPassword = !showNewPassword)}
										class="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
										title={showNewPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
									>
										{#if showNewPassword}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
										{:else}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
										{/if}
									</button>
								</div>
							</div>

							<!-- Zopakujte heslo -->
							<div>
								<label for="repeat-pwd" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
									<span>{$t('settings_page.repeat_password')}</span>
								</label>
								<div class="relative flex items-center">
									<div class="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
										</svg>
									</div>
									<input
										id="repeat-pwd"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										placeholder="Znova zadajte nové heslo"
										class="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium hover:border-emerald-400 dark:hover:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-all {changePasswordData.newPasswordConfirm && changePasswordData.newPassword === changePasswordData.newPasswordConfirm ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/10' : ''}"
										bind:value={changePasswordData.newPasswordConfirm}
									/>
									<button
										type="button"
										onclick={() => (showConfirmPassword = !showConfirmPassword)}
										class="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
										title={showConfirmPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
									>
										{#if showConfirmPassword}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
										{:else}
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
										{/if}
									</button>
								</div>
							</div>

							<!-- Validation Hint -->
							{#if changePasswordData.newPassword.length > 0}
								<div class="text-xs space-y-1 pt-1">
									<div class="flex items-center gap-1.5 {changePasswordData.newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">
										<span>{changePasswordData.newPassword.length >= 8 ? '✓' : '○'}</span>
										Dĺžka aspoň 8 znakov
									</div>
									<div class="flex items-center gap-1.5 {changePasswordData.newPassword === changePasswordData.newPasswordConfirm && changePasswordData.newPasswordConfirm !== '' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">
										<span>{changePasswordData.newPassword === changePasswordData.newPasswordConfirm && changePasswordData.newPasswordConfirm !== '' ? '✓' : '○'}</span>
										Heslá sa zhodujú
									</div>
									{#if changePasswordData.oldPassword === changePasswordData.newPassword && changePasswordData.newPassword !== ''}
										<div class="text-rose-500 flex items-center gap-1.5">
											<span>✕</span> Nové heslo sa musí líšiť od starého
										</div>
									{/if}
								</div>
							{/if}

							<div class="pt-3">
								<button
									disabled={!passwordChangeDataValid || isChangingPassword}
									type="submit"
									class="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
								>
									{#if isChangingPassword}
										<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Ukladám...
									{:else}
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										{$t('settings_page.change_password_submit')}
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>

				<!-- Card 2: API Keys -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
					<div>
						<!-- Card Header with Add Button -->
						<div class="flex items-center justify-between gap-4 mb-6">
							<div class="flex items-center gap-3.5">
								<div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
									</svg>
								</div>
								<div>
									<h3 class="text-xl font-bold text-slate-900 dark:text-white">
										API Kľúče
									</h3>
									<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
										Tokeny pre automatizáciu a integrácie.
									</p>
								</div>
							</div>
							<button
								onclick={add_api_key}
								class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								<span>{$t('settings_page.add_api_key')}</span>
							</button>
						</div>

						<!-- Keys List -->
						<div class="space-y-3">
							{#await api_keys}
								<div class="flex justify-center py-8">
									<Spinner />
								</div>
							{:then keys}
								{#if !keys || keys.length === 0}
									<div class="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
										<div class="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
											<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
											</svg>
										</div>
										<p class="text-sm font-medium text-slate-600 dark:text-slate-300">
											Zatiaľ nemáte vytvorené žiadne API kľúče
										</p>
										<p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
											Kliknite na tlačidlo vyššie pre vytvorenie nového kľúča.
										</p>
									</div>
								{:else}
									{#each keys as key}
										<div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 group hover:border-emerald-500/30 transition-all">
											<div class="flex items-center gap-2.5 overflow-hidden flex-1">
												<div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
												<span class="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate select-all">
													{key.key}
												</span>
											</div>
											<div class="flex items-center gap-1 shrink-0">
												<button
													onclick={() => copyToClipboard(key.key)}
													class="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 transition-colors"
													title="Kopírovať kľúč"
												>
													{#if copiedKey === key.key}
														<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
														</svg>
													{:else}
														<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
														</svg>
													{/if}
												</button>
												<button
													onclick={() => delete_api_key(key.key)}
													class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
													title="Zmazať kľúč"
												>
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</div>
									{/each}
								{/if}
							{/await}
						</div>
					</div>
					<div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
						API kľúče poskytujú plný programový prístup k vášmu účtu. Nikdy ich nezdieľajte verejne.
					</div>
				</div>
			</div>
		{/await}

		<!-- Active Sessions Card -->
		<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
			<!-- Header -->
			<div class="flex items-center gap-3.5">
				<div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white">
						Aktívne prihlásené relácie
					</h3>
					<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
						Zoznam zariadení a prehliadačov, ktoré majú momentálne prístup k vášmu účtu.
					</p>
				</div>
			</div>

			<!-- Sessions Table / Cards -->
			{#await getSessions()}
				<div class="flex justify-center py-12">
					<Spinner />
				</div>
			{:then sessions}
				{#if !sessions || sessions.length === 0}
					<div class="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
						Žiadne aktívne relácie sa nenašli.
					</div>
				{:else}
					<div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-slate-100/75 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
									<th class="py-3.5 px-4 sm:px-6">Zariadenie a prehliadač</th>
									<th class="py-3.5 px-4 sm:px-6">{$t('overview_page.created_at')}</th>
									<th class="py-3.5 px-4 sm:px-6">{$t('settings_page.last_seen')}</th>
									<th class="py-3.5 px-4 sm:px-6">Stav relácie</th>
									<th class="py-3.5 px-4 sm:px-6 text-right">Akcia</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white/40 dark:bg-slate-900/40 text-sm">
								{#each sessions as session}
									{@const ua = parseUserAgent(session.user_agent)}
									{@const isCurrent = session.id === this_session?.id}
									<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
										<!-- Device & Browser -->
										<td class="py-4 px-4 sm:px-6">
											<div class="flex items-center gap-3">
												<div class="w-9 h-9 rounded-xl {isCurrent ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'} flex items-center justify-center shrink-0">
													<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
													</svg>
												</div>
												<div class="min-w-0">
													<div class="font-semibold text-slate-900 dark:text-white truncate">
														{ua.browser}
													</div>
													<div class="text-xs text-slate-500 dark:text-slate-400">
														{ua.os}
													</div>
												</div>
											</div>
										</td>

										<!-- Created At -->
										<td class="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-300 text-xs sm:text-sm whitespace-nowrap">
											{formatDate(session.created_at)}
										</td>

										<!-- Last Seen -->
										<td class="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-300 text-xs sm:text-sm whitespace-nowrap">
											{formatDate(session.last_seen)}
										</td>

										<!-- Status Badge -->
										<td class="py-4 px-4 sm:px-6 whitespace-nowrap">
											{#if isCurrent}
												<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
													<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
													Aktuálna relácia
												</span>
											{:else}
												<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
													<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
													Iné zariadenie
												</span>
											{/if}
										</td>

										<!-- Action -->
										<td class="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
											{#if isCurrent}
												<span class="text-xs text-slate-400 dark:text-slate-500 italic">
													Táto relácia
												</span>
											{:else}
												<button
													onclick={() => deleteSession(session.id)}
													class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-all border border-rose-200 dark:border-rose-900 shadow-sm"
												>
													<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
													Ukončiť
												</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/await}
		</div>
	</div>
</div>

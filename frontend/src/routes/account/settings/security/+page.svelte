<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import Spinner from '$lib/Spinner.svelte';
	import { browser } from '$app/environment';
	import { startRegistration } from '@simplewebauthn/browser';
	import TotpSetup from './totp_setup.svelte';
	import BackupCodes from './backup_codes.svelte';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface UserData {
		require_password?: boolean;
		[key: string]: any;
	}

	let user_data = $state<UserData>({});
	let security_keys = $state<Array<{ id: number }>>([]);
	let totp_activated = $state<boolean | undefined>(undefined);
	let totp_data = $state();
	let backup_code = $state();
	let isActionLoading = $state(false);

	// Custom sleek password prompt modal state
	let passwordModalOpen = $state(false);
	let passwordModalInput = $state('');
	let passwordModalResolver = $state<((value: string | null) => void) | null>(null);

	const require_password = (): Promise<string | null> => {
		passwordModalInput = '';
		passwordModalOpen = true;
		return new Promise((resolve) => {
			passwordModalResolver = resolve;
		});
	};

	const submitPasswordModal = (e?: Event) => {
		if (e) e.preventDefault();
		passwordModalOpen = false;
		if (passwordModalResolver) {
			passwordModalResolver(passwordModalInput);
			passwordModalResolver = null;
		}
	};

	const cancelPasswordModal = () => {
		passwordModalOpen = false;
		if (passwordModalResolver) {
			passwordModalResolver(null);
			passwordModalResolver = null;
		}
	};

	const get_data = async () => {
		try {
			const res1 = await fetch('/api/v1/users/me');
			user_data = await res1.json();
			const res2 = await fetch('/api/v1/users/webauthn/list');
			security_keys = await res2.json();
			const res3 = await fetch('/api/v1/users/2fa/totp');
			totp_activated = (await res3.json()).activated;
		} catch (e) {
			console.error('Failed to load security data', e);
		}
	};

	let data = $state(get_data());

	const save_password_required = async () => {
		if (!browser || user_data?.require_password === undefined) {
			return;
		}
		const pw = await require_password();
		if (!pw) {
			// revert toggle if cancelled
			user_data.require_password = !user_data.require_password;
			return;
		}
		const res = await fetch('/api/v1/users/2fa/require_password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ require_password: user_data?.require_password, password: pw })
		});
		if (res.ok) {
			user_data.require_password = (await res.json()).require_password;
		} else {
			alert('Nesprávne heslo alebo zlyhanie uloženia.');
			user_data.require_password = !user_data.require_password;
		}
	};

	const add_security_key = async () => {
		const pw = await require_password();
		if (!pw) return;
		isActionLoading = true;
		try {
			const res1 = await fetch('/api/v1/users/webauthn/add_key_init', {
				method: 'POST',
				body: JSON.stringify({ password: pw }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res1.status === 401) {
				alert('Zadané heslo nie je správne.');
				return;
			}
			if (!res1.ok) {
				throw Error('Inicializácia kľúča zlyhala.');
			}
			const resp_data = await res1.json();
			resp_data.authenticatorSelection.authenticatorAttachment = 'cross-platform';
			if (resp_data.excludeCredentials) {
				for (let i = 0; i < resp_data.excludeCredentials.length; i++) {
					resp_data.excludeCredentials[i].transports = undefined;
				}
			}
			const attResp = await startRegistration({ optionsJSON: resp_data });
			await fetch('/api/v1/users/webauthn/add_key', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(attResp)
			});
			await get_data();
		} catch (e) {
			console.error(e);
			alert('Registrácia bezpečnostného kľúča bola prerušená alebo zlyhala.');
		} finally {
			isActionLoading = false;
		}
	};

	const remove_security_key = async (key_id: number) => {
		if (!confirm('Naozaj chcete odstrániť tento bezpečnostný kľúč?')) return;
		const pw = await require_password();
		if (!pw) return;
		isActionLoading = true;
		try {
			const res = await fetch(`/api/v1/users/webauthn/key/${key_id}`, {
				method: 'DELETE',
				body: JSON.stringify({ password: pw }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.status === 401) {
				alert('Zadané heslo nie je správne.');
				return;
			}
			await get_data();
		} finally {
			isActionLoading = false;
		}
	};

	const disable_totp = async () => {
		if (!confirm('Naozaj chcete deaktivovať dvojfaktorové overenie (TOTP)?')) return;
		const pw = await require_password();
		if (!pw) return;
		isActionLoading = true;
		try {
			const res = await fetch(`/api/v1/users/2fa/totp`, {
				method: 'DELETE',
				body: JSON.stringify({ password: pw }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.status === 401) {
				alert('Zadané heslo nie je správne.');
				return;
			}
			await get_data();
		} finally {
			isActionLoading = false;
		}
	};

	const enable_totp = async () => {
		const pw = await require_password();
		if (!pw) return;
		isActionLoading = true;
		try {
			const res = await fetch('/api/v1/users/2fa/totp', {
				method: 'POST',
				body: JSON.stringify({ password: pw }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.status === 401) {
				alert('Zadané heslo nie je správne.');
				return;
			}
			totp_data = await res.json();
			await get_data();
		} finally {
			isActionLoading = false;
		}
	};

	const get_backup_code = async () => {
		if (!confirm('Ak budete pokračovať, váš starý záložný kód bude zneplatnený a nahradený novým.')) {
			return;
		}
		const pw = await require_password();
		if (!pw) return;
		isActionLoading = true;
		try {
			const res = await fetch('/api/v1/users/2fa/backup_code', {
				method: 'POST',
				body: JSON.stringify({ password: pw }),
				headers: { 'Content-Type': 'application/json' }
			});
			if (res.status === 401) {
				alert('Zadané heslo nie je správne.');
				return;
			}
			backup_code = (await res.json()).code;
		} finally {
			isActionLoading = false;
		}
	};
</script>

<svelte:head>
	<title>ClassQuiz2 - Bezpečnostné nastavenia</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors">
	<div class="max-w-5xl mx-auto space-y-8">
		<!-- Navigation & Header -->
		<div>
			<a
				href="/account/settings"
				class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-3"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Späť do nastavení účtu
			</a>
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
				{$t('settings_page.security_settings')}
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
				Zabezpečenie & Dvojfaktorové overenie (2FA)
			</h1>
			<p class="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
				Chráňte svoj účet pred neoprávneným prístupom pomocou moderných bezpečnostných kľúčov, TOTP aplikácií a záložných kódov.
			</p>
		</div>

		{#await data}
			<div class="flex justify-center py-20">
				<Spinner />
			</div>
		{:then _}
			<!-- Security Overview Banner -->
			<div class="p-6 rounded-3xl border transition-all {totp_activated ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'} flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-4 text-center sm:text-left">
					<div class="w-12 h-12 rounded-2xl {totp_activated ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'} flex items-center justify-center shrink-0">
						{#if totp_activated}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						{:else}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						{/if}
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900 dark:text-white">
							{totp_activated ? 'Dvojfaktorové overovanie je aktívne' : 'Dvojfaktorové overovanie nie je zapnuté'}
						</h2>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
							{totp_activated
								? 'Váš účet je chránený dvojstupňovým overovaním pri každom prihlásení.'
								: 'Pre maximálnu bezpečnosť odporúčame aktivovať overovaciu aplikáciu (TOTP).'}
						</p>
					</div>
				</div>
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 {totp_activated ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'}">
					<span class="w-2 h-2 rounded-full {totp_activated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
					{totp_activated ? 'Zabezpečené' : 'Odporúča sa aktivácia'}
				</span>
			</div>

			<!-- Main Cards Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Card 1: TOTP Authenticator -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between space-y-6">
					<div>
						<div class="flex items-center justify-between gap-3 mb-4">
							<div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
								</svg>
							</div>
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold {totp_activated ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}">
								<span class="w-2 h-2 rounded-full {totp_activated ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
								{totp_activated ? 'Aktívne' : 'Neaktívne'}
							</span>
						</div>
						<h3 class="text-xl font-bold text-slate-900 dark:text-white">
							{$t('security_settings.totp')} (Aplikácia Authenticator)
						</h3>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							Generujte jednorazové 6-ciferné kódy vo svojej autentifikačnej aplikácii (Google Authenticator, Microsoft Authenticator, Authy, Bitwarden a ďalšie).
						</p>
					</div>

					<div class="pt-2">
						{#if totp_activated}
							<button
								onclick={disable_totp}
								disabled={isActionLoading}
								class="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200 dark:border-rose-900 shadow-sm transition-all"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
								</svg>
								{$t('security_settings.disable_totp')}
							</button>
						{:else}
							<button
								onclick={enable_totp}
								disabled={isActionLoading}
								class="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								{$t('security_settings.enable_totp')}
							</button>
						{/if}
					</div>
				</div>

				<!-- Card 2: WebAuthn / Passkeys -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between space-y-6">
					<div>
						<div class="flex items-center justify-between gap-3 mb-4">
							<div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
								</svg>
							</div>
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold {security_keys.length > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}">
								{security_keys.length} {security_keys.length === 1 ? 'kľúč' : security_keys.length >= 2 && security_keys.length <= 4 ? 'kľúče' : 'kľúčov'}
							</span>
						</div>
						<h3 class="text-xl font-bold text-slate-900 dark:text-white">
							{$t('security_settings.webauthn')}
						</h3>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							Prihlasujte sa pomocou hardvérových FIDO2 kľúčov (YubiKey), biometrie Windows Hello, Touch ID alebo Face ID.
						</p>

						<!-- List of keys -->
						<div class="mt-4 space-y-2">
							{#if security_keys.length === 0}
								<div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
									Zatiaľ nemáte pridaný žiadny hardvérový kľúč.
								</div>
							{:else}
								{#each security_keys as key, i}
									<div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
										<div class="flex items-center gap-2">
											<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
											</svg>
											<span class="font-semibold text-slate-800 dark:text-slate-200">Bezpečnostný kľúč #{i + 1}</span>
										</div>
										<button
											onclick={() => remove_security_key(key.id)}
											disabled={isActionLoading}
											class="p-1 text-slate-400 hover:text-rose-600 transition-colors"
											title="Odstrániť kľúč"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								{/each}
							{/if}
						</div>
					</div>

					<div class="pt-2">
						<button
							onclick={add_security_key}
							disabled={isActionLoading}
							class="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all shadow-sm"
						>
							<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							{$t('security_settings.add_security_key')}
						</button>
					</div>
				</div>

				<!-- Card 3: Backup Code -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between space-y-6">
					<div>
						<div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 class="text-xl font-bold text-slate-900 dark:text-white">
							{$t('security_settings.backup_code')}
						</h3>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							Vytvorte si jednorazový núdzový kód pre prípad straty telefónu, autentifikačnej aplikácie alebo hardvérového kľúča.
						</p>
					</div>

					<div class="pt-2">
						<button
							onclick={get_backup_code}
							disabled={isActionLoading}
							class="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all shadow-sm"
						>
							<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
							{$t('security_settings.get_backup_code')}
						</button>
					</div>
				</div>

				<!-- Card 4: Require Password Toggle -->
				<div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between space-y-6">
					<div>
						<div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<h3 class="text-xl font-bold text-slate-900 dark:text-white">
							Požadovať heslo pri 2FA
						</h3>
						<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
							Pri prihlasovaní bude systém okrem 2FA kódu alebo bezpečnostného kľúča vždy vyžadovať aj vaše používateľské heslo.
						</p>
					</div>

					<div class="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
						<span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{user_data.require_password ? 'Heslo je vyžadované' : 'Heslo nie je vyžadované'}
						</span>
						<button
							disabled={!totp_activated || isActionLoading}
							onclick={() => {
								user_data.require_password = !user_data.require_password;
								save_password_required();
							}}
							type="button"
							role="switch"
							aria-checked={user_data.require_password}
							class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed {user_data.require_password ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}"
						>
							<span
								aria-hidden="true"
								class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out {user_data.require_password ? 'translate-x-5' : 'translate-x-0'}"
							></span>
						</button>
					</div>
				</div>
			</div>
		{/await}
	</div>
</div>

<!-- Modal 1: TOTP Setup Dialog -->
{#if totp_data}
	<TotpSetup bind:totp_data />
{/if}

<!-- Modal 2: Backup Codes Dialog -->
{#if backup_code}
	<BackupCodes bind:backup_code />
{/if}

<!-- Modal 3: Password Confirmation Prompt -->
{#if passwordModalOpen}
	<div class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
		<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
			<div class="flex items-center gap-3.5">
				<div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">
						Potvrdenie hesla
					</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400">
						Pre pokračovanie zadajte svoje aktuálne heslo.
					</p>
				</div>
			</div>

			<form onsubmit={submitPasswordModal} class="space-y-4">
				<div>
					<input
						type="password"
						required
						autofocus
						placeholder="Vaše heslo k účtu"
						bind:value={passwordModalInput}
						class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
					/>
				</div>
				<div class="flex items-center justify-end gap-2.5 pt-1">
					<button
						type="button"
						onclick={cancelPasswordModal}
						class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						Zrušiť
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all"
					>
						Potvrdiť
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

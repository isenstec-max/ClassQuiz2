<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import QRCode from 'qrcode';
	import Spinner from '$lib/Spinner.svelte';
	import { getLocalization } from '$lib/i18n';

	const { t } = getLocalization();

	interface Props {
		totp_data: { url: string; secret: string } | undefined;
	}

	let { totp_data = $bindable() }: Props = $props();

	let copied = $state(false);

	const get_image_url = async () => {
		if (!totp_data?.url) return '';
		return await QRCode.toDataURL(totp_data.url, { width: 240, margin: 2 });
	};

	const copySecret = async () => {
		if (!totp_data?.secret) return;
		try {
			await navigator.clipboard.writeText(totp_data.secret);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		} catch (e) {
			console.error('Failed to copy', e);
		}
	};
</script>

<div class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
	<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
		<!-- Close Button -->
		<button
			onclick={() => {
				totp_data = undefined;
			}}
			class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
			aria-label={$t('words.close')}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Header -->
		<div class="flex items-center gap-3.5 pr-8">
			<div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
				</svg>
			</div>
			<div>
				<h3 class="text-xl font-bold text-slate-900 dark:text-white">
					{$t('security_settings.totp_setup.totp_setup')}
				</h3>
				<p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
					{$t('security_settings.totp_setup.scan_to_set_up')}
				</p>
			</div>
		</div>

		<!-- QR Code Container -->
		<div class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
			{#if totp_data}
				{#await get_image_url()}
					<div class="h-56 flex items-center justify-center">
						<Spinner my_20={false} />
					</div>
				{:then data}
					<div class="p-3 bg-white rounded-2xl shadow-md border border-slate-100 inline-block">
						<img
							src={data}
							alt="QR-Code for Totp-setup"
							class="w-48 h-48 sm:w-56 sm:h-56 object-contain"
						/>
					</div>
				{/await}
			{/if}

			<div class="mt-4 w-full text-center space-y-1">
				<p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
					{$t('security_settings.totp_setup.enter_as_secret_if_no_see_code')}
				</p>
				<div class="flex items-center justify-center gap-2 max-w-sm mx-auto">
					<code class="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 select-all tracking-wider break-all">
						{totp_data?.secret}
					</code>
					<button
						onclick={copySecret}
						class="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
						title="Kopírovať kód"
					>
						{#if copied}
							<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Warning Reminder -->
		<div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-2.5">
			<svg class="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<span>{$t('security_settings.totp_setup.do_not_forget_backup_code')}</span>
		</div>

		<!-- Done Button -->
		<button
			onclick={() => {
				totp_data = undefined;
			}}
			class="w-full py-3 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all"
		>
			{$t('words.finish')}
		</button>
	</div>
</div>

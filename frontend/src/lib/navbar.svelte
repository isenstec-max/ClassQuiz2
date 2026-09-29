<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import '@fontsource/marck-script/index.css';
	import { getLocalization } from '$lib/i18n';
	import { signedIn, pathname } from '$lib/stores';
	import { createTippy } from 'svelte-tippy';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { draw, slide } from 'svelte/transition';
	import { registration_disabled } from './config';
	import { APP_VERSION } from '$lib/version';
	import BrandLogo from '$lib/components/BrandLogo.svelte';

	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'bottom'
	});

	const { t } = getLocalization();

	let menuIsClosed = $state(true);
	const toggleMenu = () => {
		menuIsClosed = !menuIsClosed;
	};

	beforeNavigate(() => {
		menuIsClosed = true; // Closes menu to let the user see the page beneath
	});

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
			const target = $signedIn ? '/dashboard' : '/search?q=';
			window.location.href = target;
		}
	};
</script>

<nav class="w-screen px-4 lg:px-10 py-2 fixed backdrop-blur-2xl bg-white/80 dark:bg-gray-900/90 shadow-md z-30 top-0 border-b border-transparent dark:border-gray-800 transition-colors">
	<!-- Desktop navbar -->
	<div class="hidden lg:flex lg:items-center lg:flex-row lg:justify-between">
		<div class="lg:flex lg:items-center lg:flex-row gap-1">
			<a
				href="/search?q="
				class="group px-3 lg:px-4 flex items-center hover:opacity-90 transition-opacity"
			>
				<BrandLogo size="md" showBadge={true} />
			</a>
			<a class="btn-nav border-2 rounded-sm" href="/play">{$t('words.play')}</a>
			<a class="btn-nav" href="/explore">{$t('words.explore')}</a>
			<a class="btn-nav" href="/search?q=">{$t('words.search')}</a>
			{#if $signedIn}
				<a class="btn-nav" href="/dashboard">{$t('words.dashboard')}</a>
			{:else}
				<a class="btn-nav" href="/docs">{$t('words.docs')}</a>
				<a
					target="_blank"
					class="btn-nav flex items-center gap-1"
					href="https://github.com/isenstec-max/ClassQuiz2"
					>GitHub
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-external-link"
						><path
							d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
						/><polyline points="15 3 21 3 21 9" /><line
							x1="10"
							x2="21"
							y1="14"
							y2="3"
						/></svg
					>
				</a>
			{/if}
		</div>
		<div class="lg:flex lg:items-center lg:flex-row gap-1">
			{#if $signedIn}
				<a class="btn-nav" href="/api/v1/users/logout">{$t('words.logout')}</a>
			{:else}
				{#if registration_disabled}
					<a class="btn-nav" href="/account/register">{$t('words.register')}</a>
				{/if}

				<a class="btn-nav" href="/account/login?returnTo={$pathname}">{$t('words.login')}</a
				>
			{/if}

			<div class="fit-content flex items-center justify-center">
				<a
					href="https://mawoka.eu/donate"
					target="_blank"
					rel="noreferrer"
					aria-label={$t('navbar.donate', { default: 'Podporiť' })}
					title={$t('navbar.donate', { default: 'Podporiť' })}
					class="p-2 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-base leading-none cursor-pointer"
				>
					<span class="leading-none">❤️</span>
				</a>

				<div class="lg:flex items-center justify-center mx-4">
					{#if darkMode}
						<button
							onclick={() => {
								switchDarkMode();
							}}
							use:tippy={{ content: 'Switch light mode on' }}
							aria-label="Activate light mode"
							class="p-1 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors flex items-center justify-center text-amber-400"
						>
							<!-- Heroicons: sun -->
							<svg
								class="w-6 h-6 text-amber-400"
								fill="none"
								aria-label="Sun-Icon"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									stroke="currentColor"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						</button>
					{:else}
						<button
							class="p-1 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors flex items-center justify-center text-gray-700 hover:text-gray-900"
							onclick={() => {
								switchDarkMode();
							}}
							aria-label="Activate darkmode"
							use:tippy={{ content: 'Switch dark mode on' }}
						>
							<!-- Heroicons: moon -->
							<svg
								aria-label="Moon-Icon"
								class="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								/>
							</svg>
						</button>
					{/if}
				</div>

				<!-- Language toggle SK / GB with SVG flags -->
				<div class="flex items-center gap-2.5 px-3 py-1 rounded-full bg-gray-200/70 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 shadow-xs">
					<button
						type="button"
						class="lang-btn lang-btn-sk {currentLang === 'sk' ? 'active' : 'inactive'}"
						onclick={() => setLang('sk')}
						title="Slovenčina"
						aria-label="Prepnúť na slovenčinu"
					>
						<svg class="w-5 h-3.5 rounded-xs shadow-xs shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
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
						<span class="font-mono text-xs">SK</span>
					</button>
					<span class="lang-divider"></span>
					<button
						type="button"
						class="lang-btn lang-btn-en {currentLang === 'en' ? 'active' : 'inactive'}"
						onclick={() => setLang('en')}
						title="English"
						aria-label="Switch to English"
					>
						<svg class="w-5 h-3.5 rounded-xs shadow-xs shrink-0 overflow-hidden" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
							<rect width="60" height="30" fill="#012169"/>
							<path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" stroke-width="6"/>
							<path d="M0 0 L30 15 M60 30 L30 15 M60 0 L30 15 M0 30 L30 15" stroke="#c8102e" stroke-width="2"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#ffffff" stroke-width="10"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#c8102e" stroke-width="6"/>
						</svg>
						<span class="font-mono text-xs">GB</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile navbar -->
	<div class="lg:hidden">
		<!-- Navbar header -->
		<div class="flex items-center justify-between">
			<a
				href="/"
				class="group px-2 flex items-center hover:opacity-90 transition-opacity"
			>
				<BrandLogo size="sm" showBadge={true} />
			</a>
			<a class="btn-nav flex" href="/play">{$t('words.play')}</a>

			<!-- Dark/Light mode toggle + Open/Close menu -->
			<div class="flex items-center">
				<!-- Language toggle SK / GB with SVG flags -->
				<div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 shadow-xs mr-3">
					<button
						type="button"
						class="lang-btn lang-btn-sk {currentLang === 'sk' ? 'active' : 'inactive'}"
						onclick={() => setLang('sk')}
						title="Slovenčina"
						aria-label="Prepnúť na slovenčinu"
					>
						<svg class="w-4 h-3 rounded-xs shadow-xs shrink-0" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
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
						<span class="font-mono text-[10px]">SK</span>
					</button>
					<span class="lang-divider"></span>
					<button
						type="button"
						class="lang-btn lang-btn-en {currentLang === 'en' ? 'active' : 'inactive'}"
						onclick={() => setLang('en')}
						title="English"
						aria-label="Switch to English"
					>
						<svg class="w-4 h-3 rounded-xs shadow-xs shrink-0 overflow-hidden" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
							<rect width="60" height="30" fill="#012169"/>
							<path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" stroke-width="6"/>
							<path d="M0 0 L30 15 M60 30 L30 15 M60 0 L30 15 M0 30 L30 15" stroke="#c8102e" stroke-width="2"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#ffffff" stroke-width="10"/>
							<path d="M30 0 v30 M0 15 h60" stroke="#c8102e" stroke-width="6"/>
						</svg>
						<span class="font-mono text-[10px]">GB</span>
					</button>
				</div>

				{#if darkMode}
					<!-- Sun icon -->
					<button
						class="px-2"
						onclick={() => {
							switchDarkMode();
						}}
						use:tippy={{ content: 'Switch light mode on' }}
						aria-label="Activate light mode"
					>
						<!-- Heroicons: sun -->
						<svg
							class="w-6 h-6 text-amber-400"
							fill="none"
							aria-label="Sun-Icon"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								stroke="currentColor"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</button>
				{:else}
					<!-- Moon icon -->
					<button
						class="px-2 text-gray-700 hover:text-gray-900"
						onclick={() => {
							switchDarkMode();
						}}
						aria-label="Activate darkmode"
						use:tippy={{ content: 'Switch dark mode on' }}
					>
						<!-- Heroicons: moon -->
						<svg
							aria-label="Moon-Icon"
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					</button>
				{/if}

				{#if menuIsClosed}
					<button
						class="px-2"
						id="open-menu"
						onclick={toggleMenu}
						aria-label="Open navbar"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-gray-900 dark:text-white"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M3 6h18M3 12h18M3 18h18" />
						</svg>
					</button>
				{:else}
					<button
						class="px-2"
						id="close-menu"
						onclick={toggleMenu}
						aria-label="Close navbar"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							class="text-gray-900 dark:text-white"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path in:draw|global={{ duration: 300 }} d="M18 6 6 18" /><path
								in:draw|global={{ duration: 300 }}
								d="m6 6 12 12"
							/></svg
						>
					</button>
				{/if}
			</div>
		</div>

		<!-- Navbar content -->
		{#if !menuIsClosed}
			<div class="flex flex-col" transition:slide|global={{ duration: 400 }}>
				<a class="btn-nav" href="/explore">{$t('words.explore')}</a>
				<a class="btn-nav" href="/search?q=">{$t('words.search')}</a>
				{#if $signedIn}
					<a class="btn-nav" href="/dashboard">{$t('words.dashboard')}</a>
				{:else}
					<a class="btn-nav" href="/docs">{$t('words.docs')}</a>
					<a
						target="_blank"
						class="btn-nav flex items-center gap-1"
						href="https://github.com/isenstec-max/ClassQuiz2"
						>GitHub
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="17"
							height="17"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-external-link"
							><path
								d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
							/><polyline points="15 3 21 3 21 9" /><line
								x1="10"
								x2="21"
								y1="14"
								y2="3"
							/></svg
						>
					</a>
				{/if}

				<hr class="my-1 border" />
				{#if $signedIn}
					<a class="btn-nav" href="/api/v1/users/logout">{$t('words.logout')}</a>
				{:else}
					{#if registration_disabled}
						<a class="btn-nav" href="/account/register">{$t('words.register')}</a>
					{/if}

					<a class="btn-nav" href="/account/login?returnTo={$pathname}"
						>{$t('words.login')}</a
					>
				{/if}

				<div class="fit-content flex items-center justify-center my-2">
					<a
						href="https://mawoka.eu/donate"
						target="_blank"
						rel="noreferrer"
						aria-label={$t('navbar.donate', { default: 'Podporiť' })}
						title={$t('navbar.donate', { default: 'Podporiť' })}
						class="p-2.5 rounded-xl bg-white border border-gray-200/90 shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-base leading-none cursor-pointer"
					>
						<span class="leading-none">❤️</span>
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>

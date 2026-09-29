<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { APP_VERSION } from '$lib/version';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'hero';
		showBadge?: boolean;
		class?: string;
	}

	let {
		size = 'md',
		showBadge = true,
		class: className = ''
	}: Props = $props();

	let iconSize = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'w-7 h-7';
			case 'lg':
				return 'w-11 h-11';
			case 'hero':
				return 'w-16 h-16 sm:w-24 sm:h-24';
			case 'md':
			default:
				return 'w-9 h-9 sm:w-10 sm:h-10';
		}
	});

	let textSize = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'text-lg sm:text-xl';
			case 'lg':
				return 'text-2xl sm:text-3xl';
			case 'hero':
				return 'text-5xl sm:text-7xl';
			case 'md':
			default:
				return 'text-2xl sm:text-[1.65rem]';
		}
	});

	let badgeSize = $derived.by(() => {
		switch (size) {
			case 'hero':
				return 'text-sm px-2.5 py-1 ml-4';
			case 'sm':
				return 'text-[9px] px-1.5 py-0.5 ml-2';
			default:
				return 'ml-2.5';
		}
	});
</script>

<div class="inline-flex items-center gap-2 select-none {className}">
	<!-- Exact Logo Icon matching media_1790705375115.png: Two cards, two sparkles, and gradient Q with white outline -->
	<svg
		class="{iconSize} shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
		viewBox="0 0 100 100"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<defs>
			<!-- Left Card: Golden Yellow to Amber -->
			<linearGradient id="cq2-card-gold" x1="20" y1="25" x2="45" y2="75" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#FDE047" />
				<stop offset="100%" stop-color="#F59E0B" />
			</linearGradient>

			<!-- Right Card: Warm Coral/Orange to Rose -->
			<linearGradient id="cq2-card-coral" x1="55" y1="20" x2="85" y2="75" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#FB923C" />
				<stop offset="100%" stop-color="#E11D48" />
			</linearGradient>

			<!-- Q Gradient: Emerald -> Cyan -> Purple/Violet -->
			<linearGradient id="cq2-q-fill" x1="32" y1="28" x2="78" y2="78" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#10B981" />
				<stop offset="35%" stop-color="#06B6D4" />
				<stop offset="70%" stop-color="#6366F1" />
				<stop offset="100%" stop-color="#8B5CF6" />
			</linearGradient>
		</defs>

		<!-- Stars on top-left -->
		<!-- Main large sparkle -->
		<path d="M 33 13 C 33 21 28 25 21 25 C 28 25 33 29 33 37 C 33 29 38 25 45 25 C 38 25 33 21 33 13 Z" fill="#FBBF24" />
		<!-- Small sparkle -->
		<path d="M 48 10 C 48 14.5 45 16.5 41 16.5 C 45 16.5 48 18.5 48 23 C 48 18.5 51 16.5 55 16.5 C 51 16.5 48 14.5 48 10 Z" fill="#FDE047" />

		<!-- Left Card: Yellow tilted left (-20deg) -->
		<rect x="18" y="32" width="34" height="44" rx="8" transform="rotate(-20 35 54)" fill="url(#cq2-card-gold)" />

		<!-- Right Card: Coral/Orange tilted right (+24deg) -->
		<rect x="52" y="24" width="34" height="44" rx="8" transform="rotate(24 69 46)" fill="url(#cq2-card-coral)" />

		<!-- Outer White Halo / Border around Q -->
		<circle cx="58" cy="56" r="23" stroke="white" stroke-width="18" fill="none" />
		<path d="M 62 60 L 80 78" stroke="white" stroke-width="18" stroke-linecap="round" />

		<!-- Gradient Q Ring -->
		<circle cx="58" cy="56" r="23" stroke="url(#cq2-q-fill)" stroke-width="12" fill="none" />

		<!-- Gradient Q Tail -->
		<path d="M 62 60 L 80 78" stroke="url(#cq2-q-fill)" stroke-width="12" stroke-linecap="round" />
	</svg>

	<!-- Brand Typography: ClassQuiz + superscript 2 -->
	<span class="font-extrabold tracking-tight font-sans {textSize} text-slate-900 dark:text-white flex items-center leading-none">
		<span>ClassQuiz</span><span class="text-emerald-500 dark:text-emerald-400 font-black text-[0.65em] -translate-y-1.5 ml-0.5 inline-block">2</span>
	</span>

	<!-- Version pill badge with clean spacing -->
	{#if showBadge}
		<span class="cq2-version-badge {badgeSize}">{APP_VERSION}</span>
	{/if}
</div>

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
				return 'w-6 h-6';
			case 'lg':
				return 'w-9 h-9';
			case 'hero':
				return 'w-16 h-16 sm:w-24 sm:h-24';
			case 'md':
			default:
				return 'w-7 h-7 sm:w-8 sm:h-8';
		}
	});

	let textSize = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'text-lg';
			case 'lg':
				return 'text-2xl';
			case 'hero':
				return 'text-5xl sm:text-7xl';
			case 'md':
			default:
				return 'text-xl sm:text-2xl';
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
	<!-- Modern Option 1 Icon: Colorful Q emblem with sparkles -->
	<svg
		class="{iconSize} shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
		viewBox="0 0 40 40"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<defs>
			<linearGradient id="cq2-g-amber" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
				<stop stop-color="#F59E0B" />
				<stop offset="1" stop-color="#D97706" />
			</linearGradient>
			<linearGradient id="cq2-g-violet" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
				<stop stop-color="#6366F1" />
				<stop offset="0.6" stop-color="#4F46E5" />
				<stop offset="1" stop-color="#4338CA" />
			</linearGradient>
			<linearGradient id="cq2-g-emerald" x1="18" y1="20" x2="35" y2="35" gradientUnits="userSpaceOnUse">
				<stop stop-color="#10B981" />
				<stop offset="1" stop-color="#059669" />
			</linearGradient>
			<linearGradient id="cq2-g-cyan" x1="5" y1="5" x2="25" y2="25" gradientUnits="userSpaceOnUse">
				<stop stop-color="#06B6D4" />
				<stop offset="1" stop-color="#0891B2" />
			</linearGradient>
		</defs>

		<!-- Back card 1: Cyan tilted card -->
		<rect x="3" y="10" width="22" height="22" rx="6" transform="rotate(-15 14 21)" fill="url(#cq2-g-cyan)" opacity="0.85" />

		<!-- Back card 2: Amber tilted card -->
		<rect x="6" y="7" width="23" height="23" rx="7" transform="rotate(-6 17.5 18.5)" fill="url(#cq2-g-amber)" opacity="0.95" />

		<!-- Main front card: Deep Indigo/Violet quiz card -->
		<rect x="7" y="6" width="24" height="24" rx="7.5" fill="url(#cq2-g-violet)" />

		<!-- Q loop inner aperture / subtle glow -->
		<circle cx="19" cy="18" r="5.5" fill="white" fill-opacity="0.18" />

		<!-- Q tail: Emerald curved tab -->
		<path
			d="M21.5 20.5 L31.5 30.5 C32.5 31.5 32.2 33.2 30.8 33.8 C29.8 34.3 28.5 34 27.5 33 L19 24.5 Z"
			fill="url(#cq2-g-emerald)"
		/>

		<!-- Central bright yellow 4-point sparkle (✦) -->
		<path
			d="M19 12.5 C19 15.2 20.2 16.5 22.8 17.5 C20.2 18.5 19 19.8 19 22.5 C19 19.8 17.8 18.5 15.2 17.5 C17.8 16.5 19 15.2 19 12.5 Z"
			fill="#FEF08A"
		/>

		<!-- Mini spark top-left -->
		<path
			d="M6.5 5 C6.5 6.4 7.1 7.1 8.5 7.6 C7.1 8.1 6.5 8.8 6.5 10.2 C6.5 8.8 5.9 8.1 4.5 7.6 C5.9 7.1 6.5 6.4 6.5 5 Z"
			fill="#FBBF24"
		/>
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

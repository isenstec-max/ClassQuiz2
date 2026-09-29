<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->
<script lang="ts">
	interface Props {
		shapeIndex: number;
		class?: string;
	}

	let { shapeIndex = 0, class: className = 'w-7 h-7 text-white' }: Props = $props();
</script>

{#if shapeIndex % 4 === 0}
	<!-- Trojuholník (Triangle ▲) pre Červenú -->
	<svg class={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Trojuholník">
		<path d="M12 3.5L21.5 20H2.5L12 3.5Z" />
	</svg>
{:else if shapeIndex % 4 === 1}
	<!-- Kosoštvorec / Diamant / Šesťuholník (Diamond ◆) pre Modrú -->
	<svg class={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Kosoštvorec">
		<path d="M12 2.5L21.5 12L12 21.5L2.5 12L12 2.5Z" />
	</svg>
{:else if shapeIndex % 4 === 2}
	<!-- Krúžok (Circle ●) pre Žltú -->
	<svg class={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Krúžok">
		<circle cx="12" cy="12" r="9.2" />
	</svg>
{:else if shapeIndex % 4 === 3}
	<!-- Štvorec (Square ■) pre Zelenú -->
	<svg class={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Štvorec">
		<rect x="3.5" y="3.5" width="17" height="17" rx="2" />
	</svg>
{:else}
	<!-- Šesťuholník (Hexagon ⬢) pre 5.+ odpoveď -->
	<svg class={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Šesťuholník">
		<polygon points="12 2.5, 20.5 7.5, 20.5 16.5, 12 21.5, 3.5 16.5, 3.5 7.5" />
	</svg>
{/if}

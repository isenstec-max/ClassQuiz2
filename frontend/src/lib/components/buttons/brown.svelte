<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	interface Props {
		disabled?: boolean;
		flex?: boolean;
		href?: undefined | string;
		target?: undefined | string;
		type?: 'button' | 'submit' | 'reset';
		children?: import('svelte').Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		disabled = false,
		flex = false,
		href = undefined,
		target = '_self',
		type = 'button',
		children,
		onclick
	}: Props = $props();
</script>

{#if href}
	<a
		{href}
		{target}
		{disabled}
		class:opacity-50={disabled}
		class:cursor-not-allowed={disabled}
		class:pointer-events-none={disabled}
		class="text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 font-bold w-full px-4 py-2.5 leading-5 transition-all duration-200 transform rounded-xl text-center shadow-md shadow-emerald-600/20 border border-emerald-400/30 hover:scale-[1.02] active:scale-[0.98] outline-hidden hover:cursor-pointer"
		{onclick}
		class:flex
		class:justify-center={flex}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{disabled}
		{type}
		class="text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 font-bold w-full px-4 py-2.5 leading-5 transition-all duration-200 transform rounded-xl text-center shadow-md shadow-emerald-600/20 border border-emerald-400/30 hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 outline-hidden hover:cursor-pointer"
		{onclick}
		class:flex
		class:justify-center={flex}
	>
		{@render children?.()}
	</button>
{/if}

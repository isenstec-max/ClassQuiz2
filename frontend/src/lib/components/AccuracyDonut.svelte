<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	interface Props {
		correct?: number;
		incorrect?: number;
		total?: number;
		size?: number;
		strokeWidth?: number;
		showPercent?: boolean;
		class?: string;
	}

	let {
		correct = 0,
		incorrect = 0,
		total = 0,
		size = 44,
		strokeWidth = 4.2,
		showPercent = true,
		class: className = ''
	}: Props = $props();

	let calculatedTotal = $derived(total > 0 ? total : correct + incorrect);
	let pct = $derived(calculatedTotal > 0 ? Math.round((correct / calculatedTotal) * 100) : 0);

	// Polomer r = 15.915494309189533 zabezpečuje obvod 2 * PI * r = presne 100
	const r = 15.9155;
</script>

<div
	class="relative inline-flex items-center justify-center shrink-0 select-none {className}"
	style="width: {size}px; height: {size}px;"
	title="{correct} správnych, {Math.max(0, calculatedTotal - correct)} nesprávnych ({pct}%)"
>
	<svg
		viewBox="0 0 40 40"
		class="w-full h-full -rotate-90 transform"
		style="overflow: visible;"
	>
		<!-- Červený podklad (Nesprávne odpovede / celok) -->
		<circle
			cx="20"
			cy="20"
			{r}
			fill="transparent"
			class="{calculatedTotal === 0 ? 'stroke-slate-300 dark:stroke-slate-700' : 'stroke-rose-500'}"
			stroke-width={strokeWidth}
		/>

		<!-- Zelený oblúk (Správne odpovede) -->
		{#if pct > 0}
			<circle
				cx="20"
				cy="20"
				{r}
				fill="transparent"
				class="stroke-emerald-500 transition-all duration-700 ease-out"
				stroke-width={strokeWidth}
				stroke-dasharray="{pct} {100 - pct}"
				stroke-dashoffset="0"
				stroke-linecap={pct >= 99 ? 'butt' : 'round'}
			/>
		{/if}
	</svg>

	<!-- Percento v strede krúžku -->
	{#if showPercent}
		<span
			class="absolute inset-0 flex items-center justify-center font-mono font-black select-none pointer-events-none text-slate-900 dark:text-white leading-none"
			style="font-size: {Math.max(9, Math.round(size * 0.25))}px;"
		>
			{#if calculatedTotal === 0}
				—
			{:else}
				{pct}<span class="text-[0.68em] font-bold opacity-80">%</span>
			{/if}
		</span>
	{/if}
</div>

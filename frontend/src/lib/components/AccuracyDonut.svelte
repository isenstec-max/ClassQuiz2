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
		<!-- Vnútorný polopriehľadný tmavý disk pre 100% čitateľnosť čísla na akomkoľvek pozadí -->
		<circle cx="20" cy="20" r="13.5" fill="rgba(15, 23, 42, 0.75)" />

		<!-- Červený podklad (Nesprávne odpovede / celok) -->
		<circle
			cx="20"
			cy="20"
			{r}
			fill="transparent"
			class="{calculatedTotal === 0 ? 'stroke-slate-600' : 'stroke-rose-500'}"
			stroke-width={strokeWidth}
		/>

		<!-- Zelený oblúk (Správne odpovede) -->
		{#if pct > 0}
			<circle
				cx="20"
				cy="20"
				{r}
				fill="transparent"
				class="stroke-emerald-400 transition-all duration-700 ease-out"
				stroke-width={strokeWidth}
				stroke-dasharray="{pct} {100 - pct}"
				stroke-dashoffset="0"
				stroke-linecap={pct >= 99 ? 'butt' : 'round'}
			/>
		{/if}
	</svg>

	<!-- Percentuálna úspešnosť v strede krúžku (číslo od 0 do 100 s vysokým kontrastom) -->
	{#if showPercent}
		<span
			class="absolute inset-0 flex items-center justify-center font-mono font-black select-none pointer-events-none text-white leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
			style="font-size: {Math.max(10, Math.round(size * 0.28))}px;"
		>
			{#if calculatedTotal === 0}
				0<span class="text-[0.62em] font-bold opacity-80">%</span>
			{:else}
				{pct}<span class="text-[0.62em] font-bold opacity-85">%</span>
			{/if}
		</span>
	{/if}
</div>

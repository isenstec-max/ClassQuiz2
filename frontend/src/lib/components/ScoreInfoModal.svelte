<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	interface Props {
		open: boolean;
		lang?: string;
	}

	let { open = $bindable(false), lang = 'sk' }: Props = $props();

	const isSk = $derived(lang !== 'en');

	const close = () => {
		open = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
		}
	};
</script>

<svelte:window onkeydown={onKeyDown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-blue-500/30 overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-scale-up"
		>
			<!-- Blue Header Bar -->
			<div class="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between shadow-md">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-blue-500 border-2 border-white shadow-md flex items-center justify-center font-black text-xl text-white shrink-0">
						?
					</div>
					<div>
						<h2 class="text-xl font-black tracking-tight leading-tight">
							{isSk ? 'Ako sa počítajú body?' : 'How are points calculated?'}
						</h2>
						<p class="text-xs text-blue-100 font-medium">
							{isSk ? 'Pravidlá hodnotenia a bonus za rýchlosť' : 'Scoring rules and speed bonus'}
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={close}
					class="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Scrollable Content -->
			<div class="p-6 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100 text-sm">
				
				<!-- 1. Správna / Nesprávna odpoveď -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<span class="text-3xl">🎯</span>
						<div>
							<div class="font-bold text-base text-slate-900 dark:text-white">
								{isSk ? 'Správna odpoveď' : 'Correct answer'}
							</div>
							<div class="text-xs text-slate-500 dark:text-slate-400">
								{isSk ? 'Podľa rýchlosti odpovede' : 'Depending on reaction time'}
							</div>
						</div>
					</div>
					<div class="text-right">
						<span class="inline-block px-3 py-1 bg-emerald-500 text-white font-black text-lg rounded-xl shadow-xs">
							0 – 1 000 {isSk ? 'b' : 'pts'}
						</span>
					</div>
				</div>

				<div class="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<span class="text-3xl">❌</span>
						<div>
							<div class="font-bold text-base text-slate-900 dark:text-white">
								{isSk ? 'Nesprávna odpoveď' : 'Wrong answer'}
							</div>
							<div class="text-xs text-slate-500 dark:text-slate-400">
								{isSk ? 'Bez ohľadu na rýchlosť' : 'Regardless of time'}
							</div>
						</div>
					</div>
					<div class="text-right">
						<span class="inline-block px-3 py-1 bg-red-500 text-white font-black text-lg rounded-xl shadow-xs">
							0 {isSk ? 'b' : 'pts'}
						</span>
					</div>
				</div>

				<!-- 2. Ako funguje rýchlosť -->
				<div class="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
					<div class="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-base">
						<span class="text-xl">⚡</span>
						<span>{isSk ? 'Bonus za rýchlosť' : 'Speed Bonus'}</span>
					</div>
					<p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
						{isSk
							? 'Body sa neudeľujú podľa poradia (kto bol 1., 2...), ale lineárne podľa zostávajúceho času z limitu otázky. Čím skôr klikneš na správnu odpoveď, tým viac bodov získaš!'
							: 'Points are not based on ranking (1st, 2nd...), but proportionally on how much time is left. The faster you click, the more points you receive!'}
					</p>

					<!-- Vzorec -->
					<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-center font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 shadow-inner">
						{isSk
							? 'Body = ((Celkový čas - Čas odpovede) / Celkový čas) × 1 000'
							: 'Points = ((Total Time - Your Time) / Total Time) × 1,000'}
					</div>
				</div>

				<!-- 3. Príklad s časmi -->
				<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
					<div class="font-bold text-sm text-slate-700 dark:text-slate-300">
						{isSk ? '💡 Príklad pri 20-sekundovom limite otázky:' : '💡 Example for a 20-second question:'}
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
						<div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
							<span class="text-emerald-600 dark:text-emerald-400">⚡ {isSk ? 'V 1. sekunde' : 'In 1st second'}</span>
							<span class="font-black text-slate-900 dark:text-white">~950 {isSk ? 'bodov' : 'pts'}</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
							<span class="text-teal-600 dark:text-teal-400">⏱️ {isSk ? 'V 5. sekunde' : 'At 5 seconds'}</span>
							<span class="font-black text-slate-900 dark:text-white">~750 {isSk ? 'bodov' : 'pts'}</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
							<span class="text-amber-600 dark:text-amber-400">⏳ {isSk ? 'V polovici (10 s)' : 'Half time (10s)'}</span>
							<span class="font-black text-slate-900 dark:text-white">500 {isSk ? 'bodov' : 'pts'}</span>
						</div>
						<div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
							<span class="text-orange-600 dark:text-orange-400">🐢 {isSk ? 'V 15. sekunde' : 'At 15 seconds'}</span>
							<span class="font-black text-slate-900 dark:text-white">~250 {isSk ? 'bodov' : 'pts'}</span>
						</div>
					</div>
				</div>

				<!-- 4. Férovosť / Latencia -->
				<div class="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3 text-xs">
					<span class="text-emerald-600 dark:text-emerald-400 text-lg shrink-0">🛡️</span>
					<div class="text-slate-600 dark:text-slate-300">
						<span class="font-bold text-slate-900 dark:text-white">
							{isSk ? 'Férovosť pripojenia (Ping): ' : 'Fair Play (Latency): '}
						</span>
						{isSk
							? 'Systém automaticky odpočítava sieťovú odozvu vášho zariadenia, takže hráči s pomalším internetom nie sú znevýhodnení.'
							: 'The system automatically compensates for network latency so players with slower connections are not penalized.'}
					</div>
				</div>

			</div>

			<!-- Footer with Close button -->
			<div class="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
				<button
					type="button"
					onclick={close}
					class="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 active:scale-98 text-white shadow-md transition cursor-pointer"
				>
					{isSk ? 'Rozumiem' : 'Got it'}
				</button>
			</div>
		</div>
	</div>
{/if}

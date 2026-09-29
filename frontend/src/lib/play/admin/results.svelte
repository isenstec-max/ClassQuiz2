<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { getLocalization } from '$lib/i18n';
	import type { Question } from '$lib/quiz_types';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import AnswerShape from '$lib/components/AnswerShape.svelte';
	import JoinInfoCard from '$lib/play/admin/JoinInfoCard.svelte';
	import { parsePlayer } from '$lib/avatars';
	import { DEFAULT_ANSWER_COLORS } from '$lib/answer_theme';

	const { t } = getLocalization();

	interface Props {
		data: any;
		question: Question;
		new_data: Array<{
			username: string;
			answer: string;
			right: boolean;
			time_taken: number;
			score: number;
		}> | string | any;
		game_pin?: string;
		players?: Array<{ username: string; sid?: string }>;
		question_index?: number;
		total_questions?: number;
	}

	let {
		data = $bindable({}),
		question,
		new_data = [],
		game_pin = '',
		players = [],
		question_index = 1,
		total_questions = 1
	}: Props = $props();

	// Bezpečné parsovanie dát výsledkov (či už prídu ako pole, JSON reťazec alebo objekt)
	let parsedNewData = $derived.by(() => {
		if (!new_data) return [];
		if (Array.isArray(new_data)) return new_data;
		if (typeof new_data === 'string') {
			try {
				const parsed = JSON.parse(new_data);
				return Array.isArray(parsed) ? parsed : (parsed?.root || []);
			} catch {
				return [];
			}
		}
		if (typeof new_data === 'object' && Array.isArray((new_data as any).root)) {
			return (new_data as any).root;
		}
		return [];
	});

	let score_by_username = $derived.by(() => {
		const ret_data: Record<string, number> = {};
		for (const i of parsedNewData) {
			if (i && i.username) {
				ret_data[i.username] = i.score ?? 0;
			}
		}
		return ret_data;
	});

	let time_by_username = $derived.by(() => {
		const ret_data: Record<string, number> = {};
		for (const i of parsedNewData) {
			if (i && i.username && i.time_taken !== undefined && i.time_taken !== null && !isNaN(Number(i.time_taken))) {
				ret_data[i.username] = Math.max(0, Number(i.time_taken));
			}
		}
		return ret_data;
	});

	// Zjednotenie a zoradenie všetkých účastníkov
	let allPlayerUsernames = $derived.by(() => {
		const set = new Set<string>();
		if (players && Array.isArray(players)) {
			for (const p of players) {
				if (p?.username) set.add(p.username);
			}
		}
		for (const k of Object.keys(data || {})) {
			if (k) set.add(k);
		}
		for (const item of parsedNewData) {
			if (item?.username) set.add(item.username);
		}
		return Array.from(set).sort((a, b) => {
			const scoreA = parseFloat(data?.[a]) || 0;
			const scoreB = parseFloat(data?.[b]) || 0;
			return scoreB - scoreA;
		});
	});

	let show_new_score_clicked = $state(false);

	const show_new_score = () => {
		if (!data) data = {};
		for (const i of allPlayerUsernames) {
			const current = Number(data[i]);
			const add = Number(score_by_username[i] ?? 0);
			data[i] = (isNaN(current) ? 0 : current) + add;
		}
		for (const i of parsedNewData) {
			if (i?.username && data[i.username] === undefined) {
				data[i.username] = score_by_username[i.username] ?? 0;
			}
		}
		show_new_score_clicked = true;
	};

	onMount(() => {
		setTimeout(show_new_score, 1000);
	});

	function normalize(val: any): string {
		if (val === null || val === undefined) return '';
		return String(val).trim().toLowerCase();
	}

	// Štatistiky odpovedí pre stĺpcový graf
	let answerStats = $derived.by(() => {
		const answers = question?.answers || [];
		const list = parsedNewData || [];
		const total = list.length;
		const counts = answers.map((ans, idx) => {
			let c = 0;
			for (const item of list) {
				if (!item) continue;
				const itemAns = normalize(item.answer);
				const optionAns = normalize(ans?.answer);
				if (
					itemAns === optionAns ||
					String(item.answer) === String(idx) ||
					itemAns === String(idx)
				) {
					c += 1;
				}
			}
			return c;
		});

		const maxCount = Math.max(1, ...counts);
		const maxBarHeightPx = 160;
		return answers.map((ans, idx) => {
			const count = counts[idx] || 0;
			const percent = total > 0 ? Math.round((count / total) * 100) : 0;
			const barHeightPx = count > 0
				? Math.round((count / maxCount) * (maxBarHeightPx - 30)) + 30
				: 6;
			return {
				answer: ans?.answer || '',
				right: !!ans?.right,
				color: ans?.color ?? DEFAULT_ANSWER_COLORS[idx % DEFAULT_ANSWER_COLORS.length],
				count,
				percent,
				barHeightPx
			};
		});
	});

	function formatPoints(pts: number): string {
		return new Intl.NumberFormat('sk-SK').format(pts || 0);
	}
</script>

<div class="w-full max-w-[98vw] 2xl:max-w-[1850px] mx-auto px-2 sm:px-4 md:px-6 py-1 flex flex-col justify-start">
	<!-- 3 stĺpce: Vľavo (Join), V strede (Názov otázky + Graf & Odpovede), Vpravo (Číslo otázky & Účastníci) -->
	<div class="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch">
		<!-- Vľavo: Permanentný Join Info Card (QR kód + PIN) -->
		<div class="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2 flex justify-center">
			<JoinInfoCard {game_pin} class="w-full max-w-[280px] md:max-w-none md:h-full" />
		</div>

		<!-- V strede: Názov otázky + Stĺpcový graf vyhodnotenia a bloky odpovedí -->
		<div class="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-8 flex flex-col gap-4">
			<!-- Horná lišta s textom otázky - DOKONALE VYCENTROVANÁ PRIAMO NAD STREDNÝM GRAFOM -->
			<div class="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white px-6 md:px-10 py-3.5 md:py-4 rounded-2xl shadow-xl border border-black/5 text-center w-full">
				<h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
					{@html question?.question || ''}
				</h2>
			</div>

			<!-- Stĺpcový graf vyhodnotenia a bloky odpovedí -->
			<div class="flex-1 flex flex-col justify-between bg-slate-900/50 dark:bg-black/50 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-white/10 shadow-2xl">
				<!-- Stĺpcový graf (Bar Chart) s dostatočným voľným priestorom hore -->
				<div class="h-[290px] md:h-[320px] flex items-end justify-center gap-4 sm:gap-6 md:gap-8 pt-8 pb-5 px-4 sm:px-6 border-b border-white/10">
				{#each answerStats as stat, i}
					<div class="flex flex-col items-center justify-end h-full flex-1 max-w-[130px] group">
						<!-- Počet a percentá nad stĺpcom s príjemným odstupom -->
						<div class="mb-3 text-center">
							<span class="text-xl md:text-3xl font-black text-white drop-shadow">
								{stat.count}
							</span>
							<span class="block text-xs md:text-sm font-bold text-gray-300">
								{stat.percent}%
							</span>
						</div>

						<!-- Samotný stĺpec -->
						<div class="w-full flex flex-col justify-end items-center relative">
							<!-- Zelená fajka na pravej strane správneho stĺpca -->
							{#if stat.right}
								<div
									class="absolute top-0 -right-3.5 sm:-right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xl animate-bounce"
									title="Správna odpoveď"
								>
									<svg class="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
								</div>
							{/if}

							<!-- Farebný stĺpec stúpajúci nahor s priamou výškou v pixeloch -->
							<div
								class="w-full rounded-t-xl transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
								style="height: {stat.barHeightPx}px; background-color: {stat.color};"
								class:ring-4={stat.right}
								class:ring-emerald-400={stat.right}
								class:opacity-75={!stat.right}
							>
								<div class="absolute inset-x-0 top-0 h-4 bg-white/25"></div>
							</div>

							<!-- Pätka stĺpca s geometrickým tvarom -->
							<div
								class="w-full py-2.5 flex items-center justify-center rounded-b-xl shadow-md"
								style="background-color: {stat.color}; filter: brightness(0.85);"
							>
								<AnswerShape shapeIndex={i} class="w-7 h-7 text-white drop-shadow" />
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Spodná 2x2 mriežka kariet odpovedí s tvarmi -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
				{#each answerStats as stat, i}
					<div
						class="flex items-center gap-3.5 p-4 rounded-2xl shadow-lg border transition-all text-white font-bold min-h-[72px]"
						style="background-color: {stat.color};"
						class:ring-4={stat.right}
						class:ring-emerald-400={stat.right}
						class:opacity-75={!stat.right}
					>
						<div class="p-2 rounded-xl bg-black/20 shrink-0 flex items-center justify-center">
							<AnswerShape shapeIndex={i} class="w-8 h-8 text-white" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-3">
								<span class="text-base md:text-xl font-bold truncate drop-shadow-sm">{@html stat.answer}</span>
								<span class="text-xs md:text-sm bg-black/35 px-2.5 py-1 rounded-full shrink-0 font-mono font-bold">
									{stat.percent}% ({stat.count})
								</span>
							</div>
						</div>
						{#if stat.right}
							<div class="w-7 h-7 rounded-full bg-emerald-500 border border-white flex items-center justify-center shrink-0 shadow">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Vpravo: Číslo otázky a Zoznam všetkých účastníkov s bodmi -->
	<div class="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2 flex flex-col gap-3.5">
		<!-- Číslo otázky vycentrované nad zoznamom účastníkov s okrasným fontom -->
		<div class="w-full flex justify-center">
			<div class="w-full bg-slate-900/95 dark:bg-black/90 backdrop-blur-md rounded-2xl py-3 px-3 sm:px-4 border border-slate-700/70 shadow-2xl flex items-center justify-center gap-2.5 text-center">
				<span class="text-xs uppercase font-black tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg shrink-0">
					Otázka
				</span>
				<div class="font-decorative text-2xl md:text-3xl font-black tracking-wider text-white drop-shadow flex items-center gap-1 shrink-0">
					<span class="text-amber-300 drop-shadow">{question_index}</span>
					<span class="text-slate-500 text-xl font-light">/</span>
					<span class="text-slate-200">{total_questions}</span>
				</div>
			</div>
		</div>

		<!-- Zoznam všetkých účastníkov s bodmi -->
		<div class="flex-1 flex flex-col bg-slate-900/95 text-white rounded-3xl p-5 shadow-2xl border border-slate-700/60 backdrop-blur-md min-h-[440px] max-h-[580px] xl:max-h-[640px]">
			<!-- Hlavička zoznamu -->
			<div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
				<div class="flex items-center gap-2">
					<span class="text-lg">👥</span>
					<h3 class="font-extrabold text-base md:text-lg tracking-wide text-white">
						Účastníci ({allPlayerUsernames.length})
					</h3>
				</div>
				<span class="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
					Body
				</span>
			</div>

			<!-- Rolovací zoznam účastníkov -->
			<div class="flex-1 overflow-y-auto space-y-2 pr-1.5 custom-scroll">
				{#if allPlayerUsernames.length === 0}
					<div class="text-center py-8 text-slate-400 text-sm">Žiadni účastníci</div>
				{:else}
					{#each allPlayerUsernames as player, i (player)}
						{@const parsed = parsePlayer(player)}
						<div
							class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 transition-all border border-slate-700/40"
						>
							<div class="flex items-center gap-2.5 min-w-0">
								<span class="text-xs font-mono font-bold text-slate-400 w-4 text-center">{i + 1}.</span>
								<AnimalAvatar avatarId={parsed.avatarId} size={30} class="shrink-0 shadow-sm" />
								<span class="font-bold text-sm md:text-base text-gray-100 truncate">{parsed.name}</span>
							</div>

							<div class="flex items-center gap-2 shrink-0">
								{#if time_by_username[player] !== undefined}
									<span class="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60" title="Čas odpovede">
										{(time_by_username[player] / 1000).toFixed(2)}s
									</span>
								{/if}
								{#if show_new_score_clicked && (score_by_username[player] ?? 0) > 0}
									<span class="text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded transition-all">
										+{score_by_username[player]}
									</span>
								{/if}
								<span class="font-extrabold font-mono text-sm md:text-base text-white">
									{formatPoints(data?.[player] || 0)}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
</div>

<style>
	.custom-scroll::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scroll::-webkit-scrollbar-track {
		background: rgba(15, 23, 42, 0.6);
		border-radius: 9999px;
	}
	.custom-scroll::-webkit-scrollbar-thumb {
		background: rgba(100, 116, 139, 0.5);
		border-radius: 9999px;
	}
	.custom-scroll::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.8);
	}
</style>

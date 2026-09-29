<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { getLocalization } from '$lib/i18n';
	import type { Question } from '$lib/quiz_types';
	import { QuizQuestionType } from '$lib/quiz_types';
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
		}>;
		game_pin?: string;
		players?: Array<{ username: string; sid?: string }>;
	}

	let { data = $bindable(), question, new_data = [], game_pin = '', players = [] }: Props = $props();

	const group_username_by_score = (new_d: any[]): Record<string, number> => {
		const ret_data: Record<string, number> = {};
		for (const i of new_d || []) {
			ret_data[i.username] = i.score;
		}
		return ret_data;
	};

	let score_by_username = $derived(group_username_by_score(new_data));

	// Zjednotenie a zoradenie všetkých účastníkov
	let allPlayerUsernames = $derived.by(() => {
		const set = new Set<string>();
		if (players && Array.isArray(players)) {
			for (const p of players) {
				if (p?.username) set.add(p.username);
			}
		}
		for (const k of Object.keys(data || {})) {
			set.add(k);
		}
		for (const item of new_data || []) {
			if (item?.username) set.add(item.username);
		}
		return Array.from(set).sort((a, b) => {
			const scoreA = parseFloat(data[a]) || 0;
			const scoreB = parseFloat(data[b]) || 0;
			return scoreB - scoreA;
		});
	});

	if (JSON.stringify(data) === '{}') {
		for (const i of new_data) {
			data[i.username] = 0;
		}
	}

	let show_new_score_clicked = $state(false);

	const show_new_score = () => {
		for (const i of allPlayerUsernames) {
			if (isNaN(data[i])) {
				data[i] = 0;
			}
			data[i] = (score_by_username[i] ?? 0) + (data[i] ?? 0);
		}
		for (const i of new_data) {
			if (data[i.username] === undefined) {
				data[i.username] = score_by_username[i.username] ?? 0;
			}
		}
		show_new_score_clicked = true;
		setTimeout(() => {
			data = data;
		}, 800);
	};

	onMount(() => {
		setTimeout(show_new_score, 1000);
	});

	// Štatistiky odpovedí pre stĺpcový graf
	let answerStats = $derived.by(() => {
		const answers = question?.answers || [];
		const total = new_data?.length || 0;
		const counts = answers.map((ans, idx) => {
			let c = 0;
			for (const item of new_data || []) {
				if (item.answer === ans.answer || String(item.answer) === String(idx)) {
					c += 1;
				}
			}
			return c;
		});

		const maxCount = Math.max(1, ...counts);
		return answers.map((ans, idx) => {
			const count = counts[idx];
			const percent = total > 0 ? Math.round((count / total) * 100) : 0;
			const heightPercent = total > 0 ? Math.round((count / maxCount) * 85) + 15 : 15;
			return {
				answer: ans.answer,
				right: ans.right,
				color: ans.color ?? DEFAULT_ANSWER_COLORS[idx % DEFAULT_ANSWER_COLORS.length],
				count,
				percent,
				heightPercent
			};
		});
	});

	function formatPoints(pts: number): string {
		return new Intl.NumberFormat('sk-SK').format(pts || 0);
	}
</script>

<div class="h-full min-h-[calc(100vh-6rem)] flex flex-col p-3 md:p-6 w-full max-w-[1700px] mx-auto">
	<!-- Horná lišta s textom otázky -->
	<div class="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white px-8 py-3.5 rounded-2xl shadow-xl border border-black/5 text-center max-w-4xl mx-auto mb-6 w-full">
		<h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">
			{@html question.question}
		</h2>
	</div>

	<!-- 3 stĺpce: Vľavo (Join), V strede (Stĺpcový graf & Odpovede), Vpravo (Účastníci) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
		<!-- Vľavo: Permanentný Join Info Card (QR kód + PIN) -->
		<div class="lg:col-span-3 xl:col-span-2 flex justify-center">
			<JoinInfoCard {game_pin} class="w-full max-w-[280px] h-full" />
		</div>

		<!-- V strede: Stĺpcový graf vyhodnotenia a bloky odpovedí -->
		<div class="lg:col-span-6 xl:col-span-7 flex flex-col justify-between bg-slate-900/40 dark:bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
			<!-- Stĺpcový graf (Bar Chart) -->
			<div class="flex-1 min-h-[220px] max-h-[340px] flex items-end justify-center gap-4 sm:gap-6 md:gap-10 pb-4 px-4 border-b border-white/10">
				{#each answerStats as stat, i}
					<div class="flex flex-col items-center justify-end h-full flex-1 max-w-[110px] group">
						<!-- Počet a percentá nad stĺpcom -->
						<div class="mb-2 text-center">
							<span class="text-lg md:text-xl font-black text-white drop-shadow">
								{stat.count}
							</span>
							<span class="block text-[11px] font-bold text-gray-300">
								{stat.percent}%
							</span>
						</div>

						<!-- Samotný stĺpec -->
						<div class="w-full flex flex-col justify-end items-center relative">
							<!-- Zelená fajka nad správnym stĺpcom -->
							{#if stat.right}
								<div class="absolute -top-7 z-10 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
								</div>
							{/if}

							<!-- Farebný stĺpec stúpajúci nahor -->
							<div
								class="w-full rounded-t-xl transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
								style="height: {stat.heightPercent}%; background-color: {stat.color};"
								class:ring-4={stat.right}
								class:ring-emerald-400={stat.right}
								class:opacity-75={!stat.right}
							>
								<div class="absolute inset-x-0 top-0 h-4 bg-white/25"></div>
							</div>

							<!-- Pätka stĺpca s geometrickým tvarom -->
							<div
								class="w-full py-2 flex items-center justify-center rounded-b-xl shadow-md"
								style="background-color: {stat.color}; filter: brightness(0.85);"
							>
								<AnswerShape shapeIndex={i} class="w-6 h-6 text-white drop-shadow" />
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Spodná 2x2 mriežka kariet odpovedí s tvarmi -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
				{#each answerStats as stat, i}
					<div
						class="flex items-center gap-3 p-3.5 rounded-2xl shadow-lg border transition-all text-white font-bold"
						style="background-color: {stat.color};"
						class:ring-4={stat.right}
						class:ring-emerald-400={stat.right}
						class:opacity-75={!stat.right}
					>
						<div class="p-1.5 rounded-xl bg-black/20 shrink-0">
							<AnswerShape shapeIndex={i} class="w-7 h-7 text-white" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-2">
								<span class="text-base md:text-lg truncate drop-shadow-sm">{@html stat.answer}</span>
								<span class="text-xs bg-black/30 px-2 py-0.5 rounded-full shrink-0 font-mono">
									{stat.percent}% ({stat.count})
								</span>
							</div>
						</div>
						{#if stat.right}
							<div class="w-6 h-6 rounded-full bg-emerald-500 border border-white flex items-center justify-center shrink-0">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Vpravo: Zoznam všetkých účastníkov s bodmi -->
		<div class="lg:col-span-3 flex flex-col bg-slate-900/95 text-white rounded-3xl p-5 shadow-2xl border border-slate-700/60 backdrop-blur-md max-h-[680px]">
			<!-- Hlavička zoznamu -->
			<div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
				<div class="flex items-center gap-2">
					<span class="text-lg">👥</span>
					<h3 class="font-extrabold text-base md:text-lg tracking-wide text-white">
						Účastníci ({allPlayerUsernames.length})
					</h3>
				</div>
				<span class="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
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
							animate:flip={{ duration: 400 }}
							class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 transition-all border border-slate-700/40"
						>
							<div class="flex items-center gap-2.5 min-w-0">
								<span class="text-xs font-mono font-bold text-slate-400 w-4 text-center">{i + 1}.</span>
								<AnimalAvatar avatarId={parsed.avatarId} size={30} class="shrink-0 shadow-sm" />
								<span class="font-bold text-sm md:text-base text-gray-100 truncate">{parsed.name}</span>
							</div>

							<div class="flex items-center gap-2 shrink-0">
								{#if show_new_score_clicked && score_by_username[player] > 0}
									<span in:fly|global={{ x: 20 }} class="text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
										+{score_by_username[player]}
									</span>
								{/if}
								<span class="font-extrabold font-mono text-sm md:text-base text-white">
									{formatPoints(data[player] || 0)}
								</span>
							</div>
						</div>
					{/each}
				{/if}
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

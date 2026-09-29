<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { QuizQuestionType } from '$lib/quiz_types';
	import { getLocalization } from '$lib/i18n';
	import type { Question } from '$lib/quiz_types';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Answer {
		username: string;
		answer: string;
		right: boolean;
		time_taken: number;
		score: number;
	}

	interface Props {
		question: Question;
		answers: Answer[];
	}

	let { question, answers = [] }: Props = $props();

	const get_answer_count_for_answer = (answerText: string): number => {
		let count = 0;
		let answer_id = 0;
		if (question.type === QuizQuestionType.CHECK && question.answers) {
			for (let i = 0; i < question.answers.length; i++) {
				if (answerText === question.answers[i].answer) {
					answer_id = i;
					break;
				}
			}
		}
		for (let i = 0; i < answers.length; i++) {
			const a = answers[i];
			if (!a) continue;
			if (question.type === QuizQuestionType.CHECK) {
				if (String(a.answer).includes(String(answer_id))) {
					count++;
				}
			} else if (a.answer === answerText) {
				count++;
			}
		}
		return count;
	};

	const formatScore = (val: number) => {
		return new Intl.NumberFormat('sk-SK').format(val);
	};
</script>

<div class="mt-3 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-5">

	<!-- Možnosti odpovedí a ich rozdelenie -->
	{#if question.type !== QuizQuestionType.ORDER && question.type !== QuizQuestionType.RANGE && question.answers && question.answers.length > 0}
		<div class="flex flex-col gap-2">
			<h4 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
				Rozdelenie odpovedí
			</h4>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				{#each question.answers as ansOption}
					{@const count = get_answer_count_for_answer(ansOption.answer)}
					{@const pct = answers.length > 0 ? Math.round((count / answers.length) * 100) : 0}
					<div class="p-3 rounded-xl border {ansOption.right ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'} flex flex-col gap-1.5 shadow-2xs">
						<div class="flex items-center justify-between text-xs font-bold">
							<span class="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 truncate pr-2">
								<span>{ansOption.right ? '✅' : '⚪'}</span>
								<span class="truncate">{ansOption.answer}</span>
							</span>
							<span class="shrink-0 {ansOption.right ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}">
								{count} ({pct}%)
							</span>
						</div>
						<!-- Progress bar -->
						<div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex">
							<div
								class="h-full transition-all duration-300 {ansOption.right ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'}"
								style="width: {pct}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Tabuľka odpovedí hráčov na túto otázku -->
	<div class="flex flex-col gap-2">
		<h4 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
			Odpovede hráčov ({answers.length})
		</h4>

		{#if answers.length === 0}
			<p class="text-xs text-slate-400 italic">Žiadne odpovede na túto otázku.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
							<th class="py-2 px-3">Hráč</th>
							<th class="py-2 px-3">Odpoveď</th>
							<th class="py-2 px-3 text-right">Čas</th>
							{#if question.type !== QuizQuestionType.VOTING}
								<th class="py-2 px-3 text-right">Body</th>
								<th class="py-2 px-3 text-center w-20">Stav</th>
							{/if}
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						{#each answers as ans}
							{@const parsed = parsePlayer(ans.username)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
								<td class="py-2.5 px-3">
									<div class="flex items-center gap-2">
										<AnimalAvatar avatarId={parsed.avatarId} size={24} class="shrink-0" />
										<span class="font-bold text-slate-800 dark:text-slate-200">{parsed.name}</span>
									</div>
								</td>
								<td class="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
									{ans.answer || '—'}
								</td>
								<td class="py-2.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
									{ans.time_taken ? (ans.time_taken / 1000).toFixed(2) + ' s' : '—'}
								</td>
								{#if question.type !== QuizQuestionType.VOTING}
									<td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
										{formatScore(ans.score || 0)}
									</td>
									<td class="py-2.5 px-3 text-center">
										{#if ans.right}
											<span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
												Správne
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-black text-[11px]">
												Nesprávne
											</span>
										{/if}
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

</div>

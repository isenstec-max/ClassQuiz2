<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	function sortObjectbyValue(obj) {
		const ret = {};
		Object.keys(obj)
			.sort((a, b) => obj[b] - obj[a])
			.forEach((s) => (ret[s] = obj[s]));
		return ret;
	}

	interface Props {
		scores: any;
		question_results: Array<{
			username: string;
			answer: string;
			right: boolean;
			time_taken: number;
			score: number;
		}>;
		username: any;
	}

	let { scores = $bindable(), question_results, username }: Props = $props();
	let score_by_username = $state({});

	if (JSON.stringify(scores) === '{}') {
		for (const i of question_results) {
			scores[i.username] = 0;
		}
	}
	for (const i of question_results) {
		score_by_username[i.username] = i.score;
	}
	for (const username of Object.keys(score_by_username)) {
		scores[username] = (score_by_username[username] ?? 0) + (scores[username] ?? 0);
	}
	scores = scores;
	let sorted_scores = $derived(sortObjectbyValue(scores));
	let parsed = $derived(parsePlayer(username || ''));
</script>

<div>
	<div class="flex justify-center h-screen">
		<div class="m-auto flex flex-col items-center gap-3">
			<div class="flex items-center gap-2 bg-white/10 dark:bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
				<AnimalAvatar avatarId={parsed.avatarId} size={36} class="shadow-sm" />
				<span class="font-bold text-lg">{parsed.name}</span>
			</div>
			<p class="p-4 bg-black/40 rounded-lg text-2xl font-bold">
				+{score_by_username[username] ?? '0'}
			</p>
			<p class="text-lg opacity-90">Total score: {sorted_scores[username] ?? '0'}</p>
		</div>
	</div>
</div>

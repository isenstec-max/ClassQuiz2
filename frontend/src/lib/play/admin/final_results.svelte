<!--
SPDX-FileCopyrightText: 2023 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { getLocalization } from '$lib/i18n';
	import { fly } from 'svelte/transition';
	import confetti from 'canvas-confetti';
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	const { t } = getLocalization();

	interface Props {
		data: any;
		username?: any;
		show_final_results: boolean;
	}

	let { data = $bindable(), username, show_final_results }: Props = $props();

	let player_names = $derived(
		Object.keys(data).sort((a, b) => {
			const scoreA = parseFloat(data[a]) || 0;
			const scoreB = parseFloat(data[b]) || 0;
			return scoreB - scoreA;
		})
	);

	let player_count_or_five = $derived(player_names.length >= 5 ? 5 : player_names.length);

	let canvas: HTMLCanvasElement = $state();
	onMount(() => {
		setTimeout(
			() => {
				confetti.create(canvas, {
					resize: true,
					useWorker: true
				});
				confetti({ particleCount: 200, spread: 160 });
			},
			player_count_or_five * 1200 - 800
		);
	});
</script>

{#if show_final_results}
	<canvas bind:this={canvas}></canvas>
	<div class="flex flex-col items-center justify-center my-6">
		{#each player_names as player, i}
			{#if i <= player_count_or_five - 1}
				{@const { avatarId, name } = parsePlayer(player)}
				<div
					in:fly|global={{ y: -300, delay: player_count_or_five * 1200 - (i + 1) * 1000 }}
					class="flex items-center justify-center gap-3 my-2 px-5 py-2 rounded-2xl bg-white/60 dark:bg-gray-800/60 shadow-lg border border-black/10"
				>
					<span class="font-extrabold text-2xl md:text-3xl text-amber-500">#{i + 1}</span>
					<AnimalAvatar {avatarId} size={48} class="shadow-md" />
					<span class="font-bold text-xl md:text-3xl text-gray-900 dark:text-gray-100">{name}</span>
					<span class="font-semibold text-lg md:text-2xl text-emerald-600 dark:text-emerald-400">
						{data[player]} pts
					</span>
				</div>
			{/if}
		{/each}
	</div>
	{#if data[username]}
		{@const { avatarId, name } = parsePlayer(username)}
		<div class="fixed bottom-0 left-0 flex justify-center w-full mb-6">
			<div class="mx-auto p-4 bg-white/90 dark:bg-gray-800/90 border-2 border-emerald-500 rounded-xl shadow-xl flex items-center gap-3">
				<AnimalAvatar {avatarId} size={44} class="shadow-sm" />
				<div>
					<p class="font-bold text-lg text-gray-800 dark:text-gray-100">{$t('play_page.your_score', { score: data[username] })}</p>
					{#each player_names as player, i}
						{#if player === username}
							<p class="text-emerald-600 dark:text-emerald-400 font-semibold">{$t('play_page.your_place', { place: i + 1 })}</p>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	{/if}
{/if}

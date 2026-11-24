<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';
	import type { Player } from '$lib/admin';
	import PlayersMapModal from '$lib/components/PlayersMapModal.svelte';

	interface Props {
		open: boolean;
		players?: Player[];
	}

	let { open = $bindable(false), players = [] }: Props = $props();

	let searchQuery = $state('');
	let showMapModal = $state(false);

	const close = () => {
		open = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && open) {
			close();
		}
	};

	let normalizedPlayers = $derived.by(() => {
		if (!Array.isArray(players)) return [];
		return players.map((p, idx) => {
			const parsed = parsePlayer(p.username || '');
			const meta = p.meta || {};
			const ip = meta.ip || p.ip || 'Neznáma';
			const location = meta.location || 'Neznáma';
			const lat = meta.lat ?? null;
			const lon = meta.lon ?? null;
			const source = meta.source || 'unknown';
			const isp = meta.isp || '';
			const joinedAt = meta.joined_at || '';
			const mapUrl =
				lat !== null && lon !== null
					? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`
					: null;
			return {
				index: idx + 1,
				username: p.username,
				name: parsed.name || p.username,
				avatarId: parsed.avatarId,
				ip,
				location,
				lat,
				lon,
				source,
				isp,
				joinedAt,
				mapUrl
			};
		});
	});

	let filteredPlayers = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return normalizedPlayers;
		return normalizedPlayers.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.ip.toLowerCase().includes(q) ||
				p.location.toLowerCase().includes(q) ||
				p.isp.toLowerCase().includes(q)
		);
	});

	function formatTime(iso: string): string {
		if (!iso) return '—';
		try {
			return new Date(iso).toLocaleTimeString('sk-SK', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
		} catch {
			return iso;
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in pointer-events-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-sky-500/40 overflow-hidden flex flex-col max-h-[90vh]"
		>
			<!-- Header -->
			<div
				class="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between shadow-lg"
			>
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-xl">
						🌐
					</div>
					<div>
						<h2 class="text-lg sm:text-xl font-black tracking-tight">
							IP adresy a poloha účastníkov
						</h2>
						<p class="text-xs text-sky-100/90 font-medium">
							Pripojení hráči ({normalizedPlayers.length})
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={close}
					class="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
					aria-label="Zavrieť"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Search & Map -->
			<div class="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
				<div class="relative flex-1 min-w-[200px] max-w-sm">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Hľadať meno, IP alebo polohu..."
						class="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
					/>
					<svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={() => (showMapModal = true)}
						class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
						title="Zobraziť polohy všetkých hráčov na mape"
					>
						<span>🗺️</span>
						<span>Zobraziť na mape</span>
					</button>
					<span class="text-xs font-bold text-slate-500 dark:text-slate-400">
						Zobrazených: {filteredPlayers.length}
					</span>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-y-auto p-4 sm:p-5 flex-1">
				{#if filteredPlayers.length === 0}
					<div class="py-12 text-center text-slate-400">
						<p class="text-3xl mb-2">🌐</p>
						<p class="font-bold">Žiadni pripojení účastníci</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left border-separate border-spacing-y-1.5">
							<thead>
								<tr class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
									<th class="px-3 py-1.5 w-10">#</th>
									<th class="px-3 py-1.5">Hráč</th>
									<th class="px-3 py-1.5">IP adresa</th>
									<th class="px-3 py-1.5">Poloha</th>
									<th class="px-3 py-1.5 text-right">Čas</th>
								</tr>
							</thead>
							<tbody>
								{#each filteredPlayers as p}
									<tr class="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm">
										<td class="px-3 py-2.5 rounded-l-xl font-mono font-bold text-slate-500">
											{p.index}.
										</td>
										<td class="px-3 py-2.5">
											<div class="flex items-center gap-2.5">
												<AnimalAvatar avatarId={p.avatarId} size={28} class="shrink-0" />
												<span class="font-bold text-slate-900 dark:text-white">{p.name}</span>
											</div>
										</td>
										<td class="px-3 py-2.5">
											<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 text-slate-800 dark:text-sky-300 font-mono font-bold text-xs select-all">
												{p.ip}
											</span>
										</td>
										<td class="px-3 py-2.5">
											<div class="flex flex-wrap items-center gap-1.5">
												<span class="font-medium text-slate-700 dark:text-slate-200">
													{p.location}
												</span>
												{#if p.source === 'gps'}
													<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
														GPS
													</span>
												{:else if p.source === 'ip'}
													<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[10px] font-black uppercase">
														IP
													</span>
												{:else if p.source === 'local'}
													<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
														LAN
													</span>
												{/if}
												{#if p.mapUrl}
													<a
														href={p.mapUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline ml-1"
														title="Otvoriť polohu na mape"
													>
														📍 Mapa
													</a>
												{/if}
											</div>
											{#if p.isp}
												<div class="text-[10px] text-slate-400 truncate max-w-[240px]">
													{p.isp}
												</div>
											{/if}
										</td>
										<td class="px-3 py-2.5 rounded-r-xl text-right font-mono text-xs text-slate-500 dark:text-slate-400">
											{formatTime(p.joinedAt)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<PlayersMapModal bind:open={showMapModal} players={normalizedPlayers} />

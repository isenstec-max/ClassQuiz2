<!--
SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';

	export interface MapPlayerPoint {
		username: string;
		name: string;
		ip?: string;
		location?: string;
		lat?: number | null;
		lon?: number | null;
		source?: string;
	}

	interface Props {
		open: boolean;
		players?: MapPlayerPoint[];
	}

	let { open = $bindable(false), players = [] }: Props = $props();

	let mapContainer: HTMLDivElement | undefined = $state();
	let mapInstance: any = null;
	let loadError = $state('');

	let locatedPlayers = $derived(
		(players || []).filter(
			(p) =>
				p.lat !== null &&
				p.lat !== undefined &&
				p.lon !== null &&
				p.lon !== undefined &&
				!isNaN(Number(p.lat)) &&
				!isNaN(Number(p.lon))
		)
	);

	let unlocatedPlayers = $derived(
		(players || []).filter(
			(p) =>
				p.lat === null ||
				p.lat === undefined ||
				p.lon === null ||
				p.lon === undefined ||
				isNaN(Number(p.lat)) ||
				isNaN(Number(p.lon))
		)
	);

	const close = () => {
		open = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && open) {
			close();
		}
	};

	function ensureLeaflet(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!browser) return reject(new Error('Not in browser'));
			const win = window as any;
			if (win.L) {
				resolve(win.L);
				return;
			}
			if (!document.getElementById('leaflet-css')) {
				const link = document.createElement('link');
				link.id = 'leaflet-css';
				link.rel = 'stylesheet';
				link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				document.head.appendChild(link);
			}
			const existingScript = document.getElementById('leaflet-js') as HTMLScriptElement | null;
			if (existingScript) {
				existingScript.addEventListener('load', () => resolve((window as any).L));
				existingScript.addEventListener('error', () => reject(new Error('Leaflet load failed')));
				return;
			}
			const script = document.createElement('script');
			script.id = 'leaflet-js';
			script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
			script.async = true;
			script.onload = () => resolve((window as any).L);
			script.onerror = () => reject(new Error('Nepodarilo sa načítať mapovú knižnicu Leaflet.'));
			document.head.appendChild(script);
		});
	}

	async function renderMap() {
		if (!browser || !open || !mapContainer) return;
		loadError = '';
		try {
			const L = await ensureLeaflet();
			if (!open || !mapContainer) return;

			if (mapInstance) {
				mapInstance.remove();
				mapInstance = null;
			}

			mapInstance = L.map(mapContainer, {
				zoomControl: true,
				scrollWheelZoom: true
			});

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors',
				maxZoom: 19
			}).addTo(mapInstance);

			if (locatedPlayers.length === 0) {
				mapInstance.setView([48.7164, 21.2611], 7);
				return;
			}

			const bounds: [number, number][] = [];
			const coordCount: Record<string, number> = {};

			for (const p of locatedPlayers) {
				let lat = Number(p.lat);
				let lon = Number(p.lon);
				const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
				const idx = coordCount[key] || 0;
				coordCount[key] = idx + 1;

				// Offset overlapping markers slightly in a spiral so names remain readable
				if (idx > 0) {
					const angle = idx * 0.85;
					const radius = 0.00045 * Math.ceil(idx / 6);
					lat += Math.cos(angle) * radius;
					lon += Math.sin(angle) * radius;
				}

				const isGps = p.source === 'gps';
				const markerColor = isGps ? '#10b981' : '#0ea5e9';
				const icon = L.divIcon({
					className: 'custom-player-marker',
					html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
						<div style="background:${markerColor};color:#fff;font-weight:800;font-size:12px;line-height:1.2;padding:3px 8px;border-radius:9999px;white-space:nowrap;border:2px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);">
							${escapeHtml(p.name)}
						</div>
						<div style="width:10px;height:10px;background:${markerColor};border:2px solid #ffffff;border-radius:9999px;margin-top:2px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
					</div>`,
					iconSize: [0, 0],
					iconAnchor: [0, 0]
				});

				const marker = L.marker([lat, lon], { icon }).addTo(mapInstance);
				marker.bindPopup(
					`<div style="font-family:sans-serif;min-width:150px;">
						<strong style="font-size:14px;">${escapeHtml(p.name)}</strong><br/>
						<span style="color:#475569;font-size:12px;">IP: <code>${escapeHtml(p.ip || 'Neznáma')}</code></span><br/>
						<span style="color:#475569;font-size:12px;">Poloha: ${escapeHtml(p.location || 'Neznáma')}</span><br/>
						<span style="color:#64748b;font-size:11px;">Zdroj: ${isGps ? 'GPS' : 'IP geolokácia'} (${Number(p.lat).toFixed(5)}, ${Number(p.lon).toFixed(5)})</span>
					</div>`
				);

				bounds.push([lat, lon]);
			}

			if (bounds.length === 1) {
				mapInstance.setView(bounds[0], 14);
			} else {
				mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
			}

			setTimeout(() => {
				if (mapInstance) mapInstance.invalidateSize();
			}, 150);
		} catch (e: any) {
			loadError = e?.message || 'Nepodarilo sa zobraziť mapu.';
		}
	}

	function escapeHtml(str: string): string {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	$effect(() => {
		if (open && mapContainer) {
			renderMap();
		} else if (!open && mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	});

	onDestroy(() => {
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	});
</script>

<svelte:window onkeydown={onKeyDown} />

{#if open}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		role="dialog"
		aria-modal="true"
	>
		<div class="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/40 overflow-hidden flex flex-col h-[85vh]">
			<!-- Header -->
			<div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-5 py-3.5 text-white flex items-center justify-between shadow-lg shrink-0">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-xl">
						🗺️
					</div>
					<div>
						<h2 class="text-base sm:text-xl font-black tracking-tight">
							Mapa polohy účastníkov
						</h2>
						<p class="text-xs text-emerald-100 font-medium">
							Na mape: {locatedPlayers.length} {locatedPlayers.length === 1 ? 'hráč' : locatedPlayers.length >= 2 && locatedPlayers.length <= 4 ? 'hráči' : 'hráčov'}
							{#if unlocatedPlayers.length > 0}
								&bull; Bez súradníc: {unlocatedPlayers.length}
							{/if}
						</p>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="hidden sm:flex items-center gap-2 text-[11px] font-bold bg-black/20 px-3 py-1.5 rounded-xl">
						<span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> GPS</span>
						<span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> IP</span>
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
			</div>

			<!-- Map container -->
			<div class="relative flex-1 bg-slate-100 dark:bg-slate-950">
				{#if loadError}
					<div class="absolute inset-0 flex items-center justify-center p-6 text-center text-rose-600 font-bold">
						{loadError}
					</div>
				{/if}
				<div bind:this={mapContainer} class="w-full h-full z-10"></div>

				{#if locatedPlayers.length === 0 && !loadError}
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-slate-900/90 text-white text-xs sm:text-sm font-bold shadow-xl border border-white/15">
						Žiadny účastník nemá dostupné GPS ani verejné IP súradnice (napr. lokálna sieť).
					</div>
				{/if}
			</div>

			{#if unlocatedPlayers.length > 0}
				<div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs shrink-0 max-h-24 overflow-y-auto">
					<span class="font-bold text-slate-500 dark:text-slate-400 mr-1">Bez súradníc:</span>
					{#each unlocatedPlayers as up}
						<span class="px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
							{up.name} ({up.location || up.ip || '—'})
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)
SPDX-License-Identifier: MPL-2.0
-->

<script lang="ts">
	import AnimalAvatar from '$lib/components/AnimalAvatar.svelte';
	import { parsePlayer } from '$lib/avatars';

	interface Props {
		open: boolean;
		final_results?: any;
		scores?: Record<string, number>;
		players?: any[];
		quizTitle?: string;
	}

	let {
		open = $bindable(false),
		final_results = null,
		scores = {},
		players = [],
		quizTitle = 'Kvíz'
	}: Props = $props();

	let searchQuery = $state('');
	let copied = $state(false);

	const close = () => {
		open = false;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
		}
	};

	// Agregácia skóre
	let resolvedScores = $derived.by(() => {
		const res: Record<string, number> = {};

		// 1. Z final_results
		let hasScores = false;
		if (final_results && typeof final_results === 'object') {
			for (const qAnswers of Object.values(final_results)) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						if (a && a.username && a.score !== undefined) {
							hasScores = true;
							res[a.username] = (res[a.username] || 0) + (Number(a.score) || 0);
						}
					}
				}
			}
		}

		// 2. Fallback na scores
		if (!hasScores && scores && typeof scores === 'object') {
			for (const [k, v] of Object.entries(scores)) {
				if (k && !isNaN(Number(v))) {
					res[k] = Number(v);
				}
			}
		}

		// 3. Doplnenie hráčov bez bodov
		if (Array.isArray(players)) {
			for (const p of players) {
				const u = typeof p === 'string' ? p : p?.username;
				if (u && res[u] === undefined) {
					res[u] = 0;
				}
			}
		}

		return res;
	});

	// Počet otázok v kvíze
	let totalQuestions = $derived.by(() => {
		if (final_results && typeof final_results === 'object') {
			const keys = Object.keys(final_results);
			if (keys.length > 0) return keys.length;
		}
		return 0;
	});

	// Štatistiky odpovedí pre každého hráča
	let playerAccuracy = $derived.by(() => {
		const map: Record<string, { correct: number; incorrect: number; total: number; pct: number }> = {};
		if (final_results && typeof final_results === 'object') {
			for (const qAnswers of Object.values(final_results)) {
				if (Array.isArray(qAnswers)) {
					for (const a of qAnswers) {
						if (a && a.username) {
							if (!map[a.username]) {
								map[a.username] = { correct: 0, incorrect: 0, total: 0, pct: 0 };
							}
							map[a.username].total++;
							if (a.right) {
								map[a.username].correct++;
							} else {
								map[a.username].incorrect++;
							}
						}
					}
				}
			}
		}

		const qCount = totalQuestions;
		for (const u of Object.keys(map)) {
			const item = map[u];
			// Ak poznáme celkový počet otázok kvízu, počítame percento z nich, inak zo zodpovedaných
			const denom = qCount > 0 ? qCount : (item.total || 1);
			item.pct = Math.round((item.correct / denom) * 100);
		}
		return map;
	});

	export interface EvaluatedParticipant {
		rank: number;
		username: string;
		cleanName: string;
		avatarId: string;
		score: number;
		correct: number;
		totalAnswered: number;
		totalQuizQuestions: number;
		pct: number;
		points: number;
		pointsLabel: string;
		reason: string;
	}

	// Zoradený a ohodnotený zoznam účastníkov
	let evaluatedParticipants = $derived.by(() => {
		const userList = Object.keys(resolvedScores).sort((a, b) => {
			const scoreA = resolvedScores[a] || 0;
			const scoreB = resolvedScores[b] || 0;
			return scoreB - scoreA;
		});

		const list: EvaluatedParticipant[] = [];
		let currentRank = 1;

		for (let i = 0; i < userList.length; i++) {
			const uname = userList[i];
			const score = resolvedScores[uname] || 0;

			// Určenie umiestnenia (podpora pri rovnosti bodov)
			if (i > 0 && score < (resolvedScores[userList[i - 1]] || 0)) {
				currentRank = i + 1;
			}

			const parsed = parsePlayer(uname);
			const cleanName = parsed.cleanName || parsed.name || uname;
			const acc = playerAccuracy[uname] || { correct: 0, incorrect: 0, total: 0, pct: 0 };
			const pct = acc.pct;

			let points = 0;
			let pointsLabel = '0 bodov';
			let reason = 'Úspešnosť pod 80 %';

			if (currentRank === 1) {
				points = 2;
				pointsLabel = '2 body';
				reason = '1. miesto';
			} else if (currentRank === 2) {
				points = 1;
				pointsLabel = '1 bod';
				reason = '2. miesto';
			} else if (currentRank === 3) {
				points = 0.5;
				pointsLabel = '0,5 bodu';
				reason = '3. miesto';
			} else if (pct >= 80) {
				points = 0.25;
				pointsLabel = '0,25 bodu';
				reason = `Úspešnosť ${pct} % (≥ 80 %)`;
			} else {
				points = 0;
				pointsLabel = '0 bodov';
				reason = `Úspešnosť ${pct} % (< 80 %)`;
			}

			list.push({
				rank: currentRank,
				username: uname,
				cleanName,
				avatarId: parsed.avatarId,
				score,
				correct: acc.correct,
				totalAnswered: acc.total,
				totalQuizQuestions: totalQuestions || acc.total,
				pct,
				points,
				pointsLabel,
				reason
			});
		}

		return list;
	});

	// Filtrovanie podľa vyhľadávania
	let filteredParticipants = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return evaluatedParticipants;
		return evaluatedParticipants.filter(
			(p) =>
				p.cleanName.toLowerCase().includes(q) ||
				p.username.toLowerCase().includes(q) ||
				p.pointsLabel.toLowerCase().includes(q) ||
				p.reason.toLowerCase().includes(q)
		);
	});

	// Štatistiky bodovania
	let pointsStats = $derived.by(() => {
		const total = evaluatedParticipants.length;
		const awarded = evaluatedParticipants.filter((p) => p.points > 0).length;
		const sumPoints = evaluatedParticipants.reduce((acc, p) => acc + p.points, 0);
		return { total, awarded, sumPoints };
	});

	function escapeXml(unsafe: string): string {
		return (unsafe || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
	}

	// Export do XLS tabuľky (presne 2 stĺpce: Meno, Body)
	function exportToXls() {
		const rowsXml = evaluatedParticipants
			.map(
				(p) => `      <Row>
        <Cell ss:StyleID="TextCell"><Data ss:Type="String">${escapeXml(p.cleanName)}</Data></Cell>
        <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${p.points}</Data></Cell>
      </Row>`
			)
			.join('\n');

		const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E40AF"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="TextCell">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="NumberCell">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="0.00"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Body">
    <Table>
      <Column ss:Width="220"/>
      <Column ss:Width="90"/>
      <Row ss:StyleID="Header" ss:Height="24">
        <Cell><Data ss:Type="String">Meno</Data></Cell>
        <Cell><Data ss:Type="String">Body</Data></Cell>
      </Row>
${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;

		const blob = new Blob([xmlContent], {
			type: 'application/vnd.ms-excel;charset=utf-8'
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		const today = new Date().toISOString().slice(0, 10);
		const safeTitle = (quizTitle || 'kviz')
			.toLowerCase()
			.replace(/[^a-z0-9_-]/gi, '_')
			.slice(0, 25);
		link.download = `Body_${safeTitle}_${today}.xls`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	// Rýchle skopírovanie 2 stĺpcov do schránky (Meno\tBody)
	async function copyTableToClipboard() {
		const lines = ['Meno\tBody'];
		for (const p of evaluatedParticipants) {
			// Nahradíme bodku za čiarku pre slovenský Excel pri priamom vložení
			const formattedPts = String(p.points).replace('.', ',');
			lines.push(`${p.cleanName}\t${formattedPts}`);
		}
		const text = lines.join('\n');
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		} catch (e) {
			console.error('Failed to copy', e);
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
			class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/40 overflow-hidden flex flex-col max-h-[92vh] transition-all transform animate-scale-up"
		>
			<!-- Horná zlatá / jantárová lišta -->
			<div
				class="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-4 sm:py-5 text-white flex items-center justify-between shadow-lg"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="relative w-11 h-11 rounded-2xl bg-amber-500/90 border-2 border-white/80 shadow-md flex items-center justify-center shrink-0"
					>
						<!-- Ikonka listu papiera -->
						<svg
							class="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<!-- Písmeno B odznak -->
						<span
							class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-white text-amber-700 font-black text-xs leading-none shadow-sm border border-amber-300"
						>
							B
						</span>
					</div>
					<div>
						<h2 class="text-xl sm:text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
							<span>Zoznam účastníkov & bodovanie</span>
							<span class="text-xs px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 border border-amber-300/40 font-bold uppercase">
								Zápočet
							</span>
						</h2>
						<p class="text-xs text-amber-100 font-medium">
							Pridelené body podľa umiestnenia a percentuálnej úspešnosti
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={close}
					class="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer shrink-0"
					aria-label="Zavrieť"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Pravidlá bodovania (Prehľadné pilulky hore) -->
			<div class="px-6 py-3 bg-amber-50 dark:bg-slate-950/70 border-b border-amber-200/60 dark:border-slate-800">
				<div class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
					Pravidlá pridelenia bodov:
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
					<div class="flex items-center gap-2 p-2 rounded-xl bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/40">
						<span class="text-base">🥇</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">1. miesto</div>
							<div class="font-black text-amber-600 dark:text-amber-400">+2 body</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700">
						<span class="text-base">🥈</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">2. miesto</div>
							<div class="font-black text-slate-600 dark:text-slate-300">+1 bod</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300/60 dark:border-orange-800/40">
						<span class="text-base">🥉</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">3. miesto</div>
							<div class="font-black text-orange-600 dark:text-orange-400">+0,5 bodu</div>
						</div>
					</div>
					<div class="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/40">
						<span class="text-base">🎯</span>
						<div>
							<div class="font-bold text-slate-800 dark:text-slate-200">Úspešnosť ≥ 80 %</div>
							<div class="font-black text-emerald-600 dark:text-emerald-400">+0,25 bodu</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Akčný panel: Vyhľadávanie + Tlačidlá na Export XLS a Kopírovanie -->
			<div class="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
				<!-- Vyhľadávacie pole -->
				<div class="relative flex-1 min-w-[200px]">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Hľadať účastníka podľa mena..."
						class="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
						>
							✕
						</button>
					{/if}
				</div>

				<!-- Exportovacie tlačidlá -->
				<div class="flex items-center gap-2 w-full sm:w-auto">
					<!-- Tlačidlo Exportovať do XLS (so šípkou a tabuľkou) -->
					<button
						type="button"
						onclick={exportToXls}
						class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 border border-emerald-400/50 transition cursor-pointer"
						title="Stiahnuť tabuľku vo formáte XLS (Meno a Body)"
					>
						<!-- Šípka dole / download -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Exportovať XLS</span>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-black/25 uppercase font-mono">.xls</span>
					</button>

					<!-- Rýchle kopírovanie (Meno + Body) -->
					<button
						type="button"
						onclick={copyTableToClipboard}
						class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition cursor-pointer"
						title="Kopírovať tabuľku (Meno a Body) do schránky pre vloženie do Excelu"
					>
						{#if copied}
							<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-emerald-600 dark:text-emerald-400 font-black">Skopírované!</span>
						{:else}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span>Kopírovať</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Zoznam účastníkov -->
			<div class="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2 text-slate-800 dark:text-slate-100 text-sm">
				<!-- Súhrnná info lišta -->
				<div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 mb-1">
					<span>
						Celkovo účastníkov: <strong class="text-slate-800 dark:text-slate-200">{pointsStats.total}</strong>
						{#if pointsStats.awarded > 0}
							&bull; S pridelenými bodmi: <strong class="text-emerald-600 dark:text-emerald-400">{pointsStats.awarded}</strong>
						{/if}
					</span>
					<span class="font-mono text-[11px]">
						Formát XLS: <span class="text-slate-700 dark:text-slate-300 font-semibold">[Meno] [Body]</span>
					</span>
				</div>

				{#if filteredParticipants.length === 0}
					<div class="py-12 text-center text-slate-400">
						<div class="text-4xl mb-2">🔍</div>
						<p class="font-semibold">Žiadny účastník nezodpovedá vyhľadávaniu.</p>
					</div>
				{:else}
					<div class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-xs">
						{#each filteredParticipants as p (p.username)}
							<div class="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
								<!-- Poradie a Účastník -->
								<div class="flex items-center gap-3 min-w-0">
									<!-- Poradie -->
									<div class="w-8 text-center shrink-0">
										{#if p.rank === 1}
											<span class="text-xl" title="1. miesto">🥇</span>
										{:else if p.rank === 2}
											<span class="text-xl" title="2. miesto">🥈</span>
										{:else if p.rank === 3}
											<span class="text-xl" title="3. miesto">🥉</span>
										{:else}
											<span class="font-mono font-bold text-xs text-slate-400">#{p.rank}</span>
										{/if}
									</div>

									<!-- Avatar -->
									<div class="shrink-0">
										<AnimalAvatar avatarId={p.avatarId} size={36} class="shadow-xs" />
									</div>

									<!-- Meno a štatistika odpovedí -->
									<div class="min-w-0">
										<div class="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base leading-tight">
											{p.cleanName}
										</div>
										<div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
											<span class="font-mono font-medium text-slate-600 dark:text-slate-300">
												{new Intl.NumberFormat('sk-SK').format(p.score)} b v kvíze
											</span>
											<span>&bull;</span>
											<span class="{p.pct >= 80 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}">
												Úspešnosť {p.pct} % ({p.correct}/{p.totalQuizQuestions})
											</span>
										</div>
									</div>
								</div>

								<!-- Pridelené body -->
								<div class="shrink-0 text-right">
									{#if p.points > 0}
										<div
											class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-xs border {p.rank === 1
												? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
												: p.rank === 2
												? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
												: p.rank === 3
												? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700'
												: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'}"
										>
											<span class="font-black text-sm sm:text-base tracking-tight">
												+{String(p.points).replace('.', ',')}
											</span>
											<span class="text-xs font-bold opacity-80">
												{p.points === 1 ? 'bod' : p.points === 2 ? 'body' : 'bodu'}
											</span>
										</div>
										<div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
											{p.reason}
										</div>
									{:else}
										<div class="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
											0 bodov
										</div>
										<div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
											&lt; 80 %
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Spodná lišta -->
			<div class="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
				<div class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
					Tabuľka obsahuje 2 stĺpce pripravené pre import do Excelu alebo zápočtových systémov.
				</div>
				<div class="flex items-center gap-2 w-full sm:w-auto justify-end">
					<button
						type="button"
						onclick={exportToXls}
						class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Exportovať XLS</span>
					</button>
					<button
						type="button"
						onclick={close}
						class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
					>
						Zavrieť
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

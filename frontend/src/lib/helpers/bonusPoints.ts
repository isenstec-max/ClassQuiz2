// SPDX-FileCopyrightText: 2026 ClassQuiz2 Contributors
// SPDX-License-Identifier: MPL-2.0

import { parsePlayer } from '$lib/avatars';

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

export interface BonusPointsStats {
	total: number;
	awarded: number;
	sumPoints: number;
}

export function evaluateBonusPoints(
	final_results: any,
	scores: Record<string, number | string> = {},
	players: any[] = []
): { participants: EvaluatedParticipant[]; stats: BonusPointsStats; totalQuestions: number } {
	const resolvedScores: Record<string, number> = {};

	// 1. Z final_results / answers ak existujú
	let hasScores = false;
	if (final_results && typeof final_results === 'object') {
		for (const qAnswers of Object.values(final_results)) {
			if (Array.isArray(qAnswers)) {
				for (const a of qAnswers) {
					if (a && a.username && a.score !== undefined) {
						hasScores = true;
						resolvedScores[a.username] = (resolvedScores[a.username] || 0) + (Number(a.score) || 0);
					}
				}
			}
		}
	}

	// 2. Fallback na scores
	if (!hasScores && scores && typeof scores === 'object') {
		for (const [k, v] of Object.entries(scores)) {
			if (k && !isNaN(Number(v))) {
				resolvedScores[k] = Number(v);
			}
		}
	}

	// 3. Doplnenie hráčov bez bodov
	if (Array.isArray(players)) {
		for (const p of players) {
			const u = typeof p === 'string' ? p : p?.username;
			if (u && resolvedScores[u] === undefined) {
				resolvedScores[u] = 0;
			}
		}
	}

	// Počet otázok v kvíze
	let totalQuestions = 0;
	if (final_results && typeof final_results === 'object') {
		totalQuestions = Object.keys(final_results).length;
	}

	// Štatistiky odpovedí pre každého hráča
	const playerAccuracy: Record<string, { correct: number; incorrect: number; total: number; pct: number }> = {};
	if (final_results && typeof final_results === 'object') {
		for (const qAnswers of Object.values(final_results)) {
			if (Array.isArray(qAnswers)) {
				for (const a of qAnswers) {
					if (a && a.username) {
						if (!playerAccuracy[a.username]) {
							playerAccuracy[a.username] = { correct: 0, incorrect: 0, total: 0, pct: 0 };
						}
						playerAccuracy[a.username].total++;
						if (a.right) {
							playerAccuracy[a.username].correct++;
						} else {
							playerAccuracy[a.username].incorrect++;
						}
					}
				}
			}
		}
	}

	for (const u of Object.keys(playerAccuracy)) {
		const item = playerAccuracy[u];
		const denom = totalQuestions > 0 ? totalQuestions : (item.total || 1);
		item.pct = Math.round((item.correct / denom) * 100);
	}

	const userList = Object.keys(resolvedScores).sort((a, b) => {
		const scoreA = resolvedScores[a] || 0;
		const scoreB = resolvedScores[b] || 0;
		return scoreB - scoreA;
	});

	const participants: EvaluatedParticipant[] = [];
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

		participants.push({
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

	const total = participants.length;
	const awarded = participants.filter((p) => p.points > 0).length;
	const sumPoints = participants.reduce((acc, p) => acc + p.points, 0);

	return {
		participants,
		stats: { total, awarded, sumPoints },
		totalQuestions
	};
}

function escapeXml(unsafe: string): string {
	return (unsafe || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function exportBonusPointsToXls(participants: EvaluatedParticipant[], quizTitle = 'Kvíz') {
	const rowsXml = participants
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

export async function copyBonusPointsToClipboard(participants: EvaluatedParticipant[]): Promise<boolean> {
	const lines = ['Meno\tBody'];
	for (const p of participants) {
		const formattedPts = String(p.points).replace('.', ',');
		lines.push(`${p.cleanName}\t${formattedPts}`);
	}
	const text = lines.join('\n');
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (e) {
		console.error('Failed to copy to clipboard', e);
		return false;
	}
}

<!--
SPDX-FileCopyrightText: 2026 Marlon W (Mawoka)

SPDX-License-Identifier: MPL-2.0
-->
<script lang="ts">
	interface Props {
		avatarId?: string;
		size?: number | string;
		class?: string;
	}

	let { avatarId = 'fox', size = 48, class: className = '' }: Props = $props();

	// Normalizácia avatarId
	let normalizedId = $derived((avatarId || 'fox').toLowerCase().trim());
</script>

<div
	class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform {className}"
	style="width: {typeof size === 'number' ? `${size}px` : size}; height: {typeof size === 'number' ? `${size}px` : size};"
	aria-label="Avatar zvieratka {normalizedId}"
>
	{#if normalizedId === 'fox'}
		<!-- 🦊 Líška v smaragdovej mikine -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FFEDD5" />
			<!-- Uši -->
			<polygon points="20,10 38,42 16,36" fill="#EA580C" />
			<polygon points="18,12 28,30 16,32" fill="#1F2937" />
			<polygon points="80,10 84,36 62,42" fill="#EA580C" />
			<polygon points="82,12 84,32 72,30" fill="#1F2937" />
			<!-- Mikina (telo a golier) -->
			<path d="M12,85 Q50,68 88,85 L95,100 L5,100 Z" fill="#059669" />
			<path d="M35,76 Q50,86 65,76 Q50,72 35,76 Z" fill="#047857" />
			<line x1="45" y1="78" x2="44" y2="92" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
			<line x1="55" y1="78" x2="56" y2="92" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
			<!-- Hlava -->
			<ellipse cx="50" cy="46" rx="30" ry="26" fill="#F97316" />
			<path d="M22,46 Q35,62 50,62 Q65,62 78,46 Q70,72 50,72 Q30,72 22,46 Z" fill="#FFFFFF" />
			<!-- Oči a líca -->
			<ellipse cx="37" cy="44" rx="4" ry="5" fill="#1E293B" />
			<circle cx="38" cy="42" r="1.5" fill="#FFFFFF" />
			<ellipse cx="63" cy="44" rx="4" ry="5" fill="#1E293B" />
			<circle cx="64" cy="42" r="1.5" fill="#FFFFFF" />
			<circle cx="28" cy="52" r="4" fill="#FDA4AF" opacity="0.8" />
			<circle cx="72" cy="52" r="4" fill="#FDA4AF" opacity="0.8" />
			<!-- Nos a ústa -->
			<ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#0F172A" />
			<path d="M46,62 Q50,66 54,62" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'panda'}
		<!-- 🐼 Panda v slnečných okuliaroch a červenej šatke -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#F1F5F9" />
			<!-- Uši -->
			<circle cx="24" cy="24" r="14" fill="#0F172A" />
			<circle cx="76" cy="24" r="14" fill="#0F172A" />
			<!-- Oblečenie (žlté tričko + červená šatka) -->
			<path d="M14,84 Q50,70 86,84 L94,100 L6,100 Z" fill="#F59E0B" />
			<path d="M28,74 Q50,88 72,74 L66,84 Q50,94 34,84 Z" fill="#EF4444" />
			<circle cx="50" cy="85" r="2.5" fill="#FFFFFF" />
			<!-- Hlava -->
			<circle cx="50" cy="48" r="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
			<!-- Očné flaky -->
			<ellipse cx="36" cy="45" rx="9" ry="8" fill="#0F172A" transform="rotate(-15 36 45)" />
			<ellipse cx="64" cy="45" rx="9" ry="8" fill="#0F172A" transform="rotate(15 64 45)" />
			<!-- Štýlové slnečné okuliare -->
			<rect x="23" y="38" width="24" height="15" rx="4" fill="#1E293B" />
			<rect x="53" y="38" width="24" height="15" rx="4" fill="#1E293B" />
			<line x1="47" y1="44" x2="53" y2="44" stroke="#0F172A" stroke-width="3" />
			<line x1="26" y1="41" x2="40" y2="48" stroke="#38BDF8" stroke-width="1.5" opacity="0.6" />
			<line x1="56" y1="41" x2="70" y2="48" stroke="#38BDF8" stroke-width="1.5" opacity="0.6" />
			<!-- Nos a usmievavá papuľka -->
			<ellipse cx="50" cy="59" rx="4" ry="3" fill="#0F172A" />
			<path d="M45,63 Q50,68 55,63" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'lion'}
		<!-- 🦁 Lev v biznis obleku s červenou kravatou -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FEF3C7" />
			<!-- Hriva -->
			<circle cx="50" cy="44" r="36" fill="#D97706" />
			<path d="M22,30 Q12,46 22,62 Q30,76 50,78 Q70,76 78,62 Q88,46 78,30 Q68,14 50,14 Q32,14 22,30 Z" fill="#B45309" />
			<!-- Oblek a kravata -->
			<path d="M12,85 Q50,72 88,85 L95,100 L5,100 Z" fill="#1E3A8A" />
			<polygon points="40,78 60,78 50,92" fill="#FFFFFF" />
			<polygon points="48,82 52,82 54,98 50,100 46,98" fill="#DC2626" />
			<!-- Hlava a uši -->
			<circle cx="28" cy="24" r="7" fill="#F59E0B" />
			<circle cx="72" cy="24" r="7" fill="#F59E0B" />
			<ellipse cx="50" cy="46" rx="25" ry="23" fill="#FBBF24" />
			<!-- Oči -->
			<circle cx="39" cy="42" r="3.5" fill="#1E293B" />
			<circle cx="40" cy="40" r="1.2" fill="#FFFFFF" />
			<circle cx="61" cy="42" r="3.5" fill="#1E293B" />
			<circle cx="62" cy="40" r="1.2" fill="#FFFFFF" />
			<!-- Papuľka, fúzy a nos -->
			<ellipse cx="50" cy="56" rx="10" ry="7" fill="#FEF08A" />
			<polygon points="46,51 54,51 50,56" fill="#78350F" />
			<path d="M46,58 Q50,62 54,58" fill="none" stroke="#78350F" stroke-width="2" stroke-linecap="round" />
			<circle cx="35" cy="56" r="1" fill="#78350F" />
			<circle cx="65" cy="56" r="1" fill="#78350F" />
		</svg>
	{:else if normalizedId === 'cat'}
		<!-- 🐱 Mačička v pruhovanom námorníckom svetri -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#E0F2FE" />
			<!-- Ušká -->
			<polygon points="22,14 42,34 20,38" fill="#FB923C" />
			<polygon points="24,18 36,32 23,34" fill="#FDA4AF" />
			<polygon points="78,14 80,38 58,34" fill="#FB923C" />
			<polygon points="76,18 77,34 64,32" fill="#FDA4AF" />
			<!-- Námornícky pásikavý sveter -->
			<path d="M14,84 Q50,70 86,84 L94,100 L6,100 Z" fill="#2563EB" />
			<path d="M12,88 Q50,76 88,88 L90,92 Q50,80 10,92 Z" fill="#FFFFFF" />
			<path d="M8,97 Q50,86 92,97 L94,100 L6,100 Z" fill="#FFFFFF" />
			<path d="M42,75 Q50,80 58,75 L54,84 Q50,86 46,84 Z" fill="#EF4444" />
			<!-- Hlava -->
			<circle cx="50" cy="46" r="28" fill="#FDBA74" />
			<!-- Očká -->
			<ellipse cx="38" cy="42" rx="4.5" ry="5.5" fill="#10B981" />
			<ellipse cx="38" cy="42" rx="2" ry="4.5" fill="#064E3B" />
			<circle cx="39" cy="40" r="1.5" fill="#FFFFFF" />
			<ellipse cx="62" cy="42" rx="4.5" ry="5.5" fill="#10B981" />
			<ellipse cx="62" cy="42" rx="2" ry="4.5" fill="#064E3B" />
			<circle cx="63" cy="40" r="1.5" fill="#FFFFFF" />
			<!-- Nos, papuľka a fúzy -->
			<polygon points="47,50 53,50 50,54" fill="#F43F5E" />
			<path d="M46,55 Q50,59 54,55" fill="none" stroke="#7C2D12" stroke-width="1.8" stroke-linecap="round" />
			<line x1="22" y1="49" x2="33" y2="51" stroke="#9A3412" stroke-width="1.5" stroke-linecap="round" />
			<line x1="22" y1="55" x2="33" y2="54" stroke="#9A3412" stroke-width="1.5" stroke-linecap="round" />
			<line x1="78" y1="49" x2="67" y2="51" stroke="#9A3412" stroke-width="1.5" stroke-linecap="round" />
			<line x1="78" y1="55" x2="67" y2="54" stroke="#9A3412" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'dog'}
		<!-- 🐶 Psík v šiltovke a džínsovej bunde -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FEE2E2" />
			<!-- Ušká -->
			<ellipse cx="20" cy="38" rx="8" ry="16" fill="#78350F" transform="rotate(20 20 38)" />
			<ellipse cx="80" cy="38" rx="8" ry="16" fill="#78350F" transform="rotate(-20 80 38)" />
			<!-- Džínsová bunda -->
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#3B82F6" />
			<path d="M38,76 L50,92 L62,76" fill="#BFDBFE" />
			<circle cx="44" cy="88" r="1.5" fill="#1D4ED8" />
			<circle cx="56" cy="88" r="1.5" fill="#1D4ED8" />
			<!-- Hlava -->
			<circle cx="50" cy="48" r="28" fill="#FBBF24" />
			<!-- Oranžová šiltovka dozadu -->
			<path d="M26,30 Q50,14 74,30 L70,36 Q50,26 30,36 Z" fill="#EA580C" />
			<ellipse cx="50" cy="24" rx="22" ry="8" fill="#C2410C" />
			<circle cx="50" cy="18" r="3" fill="#EA580C" />
			<!-- Oči -->
			<circle cx="37" cy="44" r="4.5" fill="#1E293B" />
			<circle cx="39" cy="42" r="1.5" fill="#FFFFFF" />
			<circle cx="63" cy="44" r="4.5" fill="#1E293B" />
			<circle cx="65" cy="42" r="1.5" fill="#FFFFFF" />
			<!-- Čumáčik a vyplazený jazyk -->
			<ellipse cx="50" cy="56" rx="9" ry="6" fill="#451A03" />
			<path d="M50,56 L50,63 Q50,67 54,67 Q57,67 57,62" fill="none" stroke="#1E293B" stroke-width="1.8" />
			<path d="M48,62 Q52,73 56,62 Z" fill="#F43F5E" />
		</svg>
	{:else if normalizedId === 'rabbit'}
		<!-- 🐰 Zajačik v smokingu s motýlikom -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#F3E8FF" />
			<!-- Dlhé uši -->
			<ellipse cx="34" cy="20" rx="7" ry="20" fill="#E2E8F0" transform="rotate(-10 34 20)" />
			<ellipse cx="34" cy="20" rx="4" ry="15" fill="#FBCFE8" transform="rotate(-10 34 20)" />
			<ellipse cx="66" cy="20" rx="7" ry="20" fill="#E2E8F0" transform="rotate(10 66 20)" />
			<ellipse cx="66" cy="20" rx="4" ry="15" fill="#FBCFE8" transform="rotate(10 66 20)" />
			<!-- Smoking & zlatý motýlik -->
			<path d="M14,84 Q50,72 86,84 L94,100 L6,100 Z" fill="#4C1D95" />
			<polygon points="38,78 62,78 50,94" fill="#FFFFFF" />
			<polygon points="43,80 57,80 54,86 57,92 43,92 46,86" fill="#EAB308" />
			<circle cx="50" cy="86" r="2.5" fill="#CA8A04" />
			<!-- Hlava -->
			<circle cx="50" cy="52" r="26" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
			<!-- Očká -->
			<ellipse cx="38" cy="48" rx="4" ry="5" fill="#3B0764" />
			<circle cx="40" cy="46" r="1.5" fill="#FFFFFF" />
			<ellipse cx="62" cy="48" rx="4" ry="5" fill="#3B0764" />
			<circle cx="64" cy="46" r="1.5" fill="#FFFFFF" />
			<!-- Ružové líčka a noštek so zúbkami -->
			<circle cx="30" cy="56" r="4" fill="#F472B6" opacity="0.6" />
			<circle cx="70" cy="56" r="4" fill="#F472B6" opacity="0.6" />
			<polygon points="47,56 53,56 50,59" fill="#EC4899" />
			<path d="M46,61 Q50,64 54,61" fill="none" stroke="#475569" stroke-width="1.8" />
			<rect x="48" y="62" width="4" height="4" rx="1" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.8" />
		</svg>
	{:else if normalizedId === 'bear'}
		<!-- 🐻 Medveď v zimnej čiapke a šále -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FEF08A" />
			<!-- Uši -->
			<circle cx="26" cy="28" r="10" fill="#78350F" />
			<circle cx="26" cy="28" r="5" fill="#FDE047" />
			<circle cx="74" cy="28" r="10" fill="#78350F" />
			<circle cx="74" cy="28" r="5" fill="#FDE047" />
			<!-- Zelený pletený šál a kabát -->
			<path d="M12,86 Q50,72 88,86 L95,100 L5,100 Z" fill="#92400E" />
			<path d="M22,76 Q50,88 78,76 L74,88 Q50,98 26,88 Z" fill="#15803D" />
			<rect x="42" y="85" width="12" height="15" fill="#166534" />
			<!-- Hlava -->
			<circle cx="50" cy="50" r="28" fill="#92400E" />
			<!-- Pletená čiapka s brmbolcom -->
			<path d="M24,40 Q50,18 76,40 L74,44 Q50,26 26,44 Z" fill="#DC2626" />
			<circle cx="50" cy="20" r="6" fill="#F8FAFC" />
			<!-- Oči -->
			<circle cx="39" cy="46" r="3.5" fill="#1E293B" />
			<circle cx="40" cy="44" r="1.2" fill="#FFFFFF" />
			<circle cx="61" cy="46" r="3.5" fill="#1E293B" />
			<circle cx="62" cy="44" r="1.2" fill="#FFFFFF" />
			<!-- Ňufáčik -->
			<ellipse cx="50" cy="58" rx="12" ry="8" fill="#FDE047" />
			<ellipse cx="50" cy="55" rx="5" ry="3.5" fill="#1E293B" />
			<path d="M46,60 Q50,64 54,60" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'frog'}
		<!-- 🐸 Žabiak v kráľovskom plášti s korunkou -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#DCFCE7" />
			<!-- Kráľovský plášť -->
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#7E22CE" />
			<path d="M28,75 Q50,86 72,75 L68,84 Q50,94 32,84 Z" fill="#F8FAFC" />
			<circle cx="40" cy="82" r="1.5" fill="#0F172A" />
			<circle cx="50" cy="85" r="1.5" fill="#0F172A" />
			<circle cx="60" cy="82" r="1.5" fill="#0F172A" />
			<!-- Hlava s vypuklými očami -->
			<circle cx="32" cy="34" r="13" fill="#22C55E" />
			<circle cx="68" cy="34" r="13" fill="#22C55E" />
			<ellipse cx="50" cy="50" rx="32" ry="24" fill="#22C55E" />
			<!-- Očká -->
			<circle cx="32" cy="34" r="9" fill="#FEF08A" />
			<circle cx="33" cy="34" r="5" fill="#0F172A" />
			<circle cx="35" cy="32" r="2" fill="#FFFFFF" />
			<circle cx="68" cy="34" r="9" fill="#FEF08A" />
			<circle cx="67" cy="34" r="5" fill="#0F172A" />
			<circle cx="69" cy="32" r="2" fill="#FFFFFF" />
			<!-- Zlatá korunka -->
			<polygon points="40,24 43,14 50,20 57,14 60,24" fill="#FACC15" stroke="#CA8A04" stroke-width="1" />
			<circle cx="50" cy="19" r="1.5" fill="#DC2626" />
			<!-- Úsmev a líčka -->
			<circle cx="26" cy="54" r="5" fill="#86EFAC" />
			<circle cx="74" cy="54" r="5" fill="#86EFAC" />
			<path d="M30,56 Q50,68 70,56" fill="none" stroke="#14532D" stroke-width="3" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'owl'}
		<!-- 🦉 Múdra sovička v okuliaroch a profesorskej veste -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#E0E7FF" />
			<!-- Ušné pierka -->
			<polygon points="26,16 40,32 24,36" fill="#78350F" />
			<polygon points="74,16 76,36 60,32" fill="#78350F" />
			<!-- Profesorská vesta & motýlik -->
			<path d="M14,84 Q50,72 86,84 L94,100 L6,100 Z" fill="#854D0E" />
			<polygon points="36,78 64,78 50,94" fill="#FEF3C7" />
			<polygon points="44,80 56,80 50,86" fill="#DC2626" />
			<!-- Hlava -->
			<ellipse cx="50" cy="48" rx="28" ry="26" fill="#92400E" />
			<circle cx="37" cy="46" r="12" fill="#FEF3C7" />
			<circle cx="63" cy="46" r="12" fill="#FEF3C7" />
			<!-- Oči -->
			<circle cx="37" cy="46" r="6" fill="#F59E0B" />
			<circle cx="37" cy="46" r="3" fill="#0F172A" />
			<circle cx="39" cy="44" r="1.2" fill="#FFFFFF" />
			<circle cx="63" cy="46" r="6" fill="#F59E0B" />
			<circle cx="63" cy="46" r="3" fill="#0F172A" />
			<circle cx="65" cy="44" r="1.2" fill="#FFFFFF" />
			<!-- Zlaté okuliare -->
			<circle cx="37" cy="46" r="12" fill="none" stroke="#D97706" stroke-width="2.5" />
			<circle cx="63" cy="46" r="12" fill="none" stroke="#D97706" stroke-width="2.5" />
			<line x1="49" y1="46" x2="51" y2="46" stroke="#D97706" stroke-width="3" />
			<!-- Zobáčik -->
			<polygon points="47,52 53,52 50,60" fill="#EA580C" />
		</svg>
	{:else if normalizedId === 'tiger'}
		<!-- 🐯 Tiger v čiernej koženej bunde -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FFEDD5" />
			<!-- Uši -->
			<circle cx="24" cy="24" r="10" fill="#EA580C" />
			<circle cx="24" cy="24" r="5" fill="#FDBA74" />
			<circle cx="76" cy="24" r="10" fill="#EA580C" />
			<circle cx="76" cy="24" r="5" fill="#FDBA74" />
			<!-- Kožená motorkárska bunda -->
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#18181B" />
			<path d="M35,76 L46,94 L50,90 L40,76 Z" fill="#3F3F46" />
			<line x1="50" y1="78" x2="50" y2="100" stroke="#94A3B8" stroke-width="2" />
			<!-- Hlava -->
			<circle cx="50" cy="48" r="28" fill="#F97316" />
			<!-- Pruhy na čele a lícach -->
			<polygon points="50,22 47,30 53,30" fill="#1E293B" />
			<polygon points="42,26 42,32 46,30" fill="#1E293B" />
			<polygon points="58,26 58,32 54,30" fill="#1E293B" />
			<polygon points="24,44 32,46 24,49" fill="#1E293B" />
			<polygon points="76,44 68,46 76,49" fill="#1E293B" />
			<!-- Oči -->
			<ellipse cx="37" cy="44" rx="4" ry="4.5" fill="#FACC15" />
			<circle cx="37" cy="44" r="2.5" fill="#0F172A" />
			<circle cx="38" cy="42" r="1" fill="#FFFFFF" />
			<ellipse cx="63" cy="44" rx="4" ry="4.5" fill="#FACC15" />
			<circle cx="63" cy="44" r="2.5" fill="#0F172A" />
			<circle cx="64" cy="42" r="1" fill="#FFFFFF" />
			<!-- Papuľka a nos -->
			<ellipse cx="50" cy="56" rx="10" ry="7" fill="#FFFFFF" />
			<polygon points="47,52 53,52 50,56" fill="#DC2626" />
			<path d="M46,59 Q50,63 54,59" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if normalizedId === 'monkey'}
		<!-- 🐵 Opička v leteckých okuliaroch a helme -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FED7AA" />
			<!-- Uši -->
			<circle cx="18" cy="46" r="12" fill="#92400E" />
			<circle cx="18" cy="46" r="7" fill="#FDE047" />
			<circle cx="82" cy="46" r="12" fill="#92400E" />
			<circle cx="82" cy="46" r="7" fill="#FDE047" />
			<!-- Tričko a pilotná bunda -->
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#78350F" />
			<circle cx="50" cy="88" r="8" fill="#FFFFFF" />
			<!-- Hlava -->
			<circle cx="50" cy="48" r="27" fill="#92400E" />
			<!-- Letecká čiapka a okuliare -->
			<path d="M26,36 Q50,18 74,36 L70,44 Q50,30 30,44 Z" fill="#581C87" />
			<!-- Okuliare na čele -->
			<circle cx="39" cy="30" r="8" fill="#0284C7" stroke="#D97706" stroke-width="2.5" />
			<circle cx="61" cy="30" r="8" fill="#0284C7" stroke="#D97706" stroke-width="2.5" />
			<line x1="47" y1="30" x2="53" y2="30" stroke="#D97706" stroke-width="3" />
			<line x1="36" y1="27" x2="42" y2="33" stroke="#BAE6FD" stroke-width="1.5" />
			<line x1="58" y1="27" x2="64" y2="33" stroke="#BAE6FD" stroke-width="1.5" />
			<!-- Tvár a očká -->
			<ellipse cx="50" cy="54" rx="20" ry="16" fill="#FDE047" />
			<circle cx="41" cy="48" r="3.5" fill="#1E293B" />
			<circle cx="42" cy="46" r="1.2" fill="#FFFFFF" />
			<circle cx="59" cy="48" r="3.5" fill="#1E293B" />
			<circle cx="60" cy="46" r="1.2" fill="#FFFFFF" />
			<!-- Nozdry a široký opičí úsmev -->
			<circle cx="47" cy="55" r="1.5" fill="#78350F" />
			<circle cx="53" cy="55" r="1.5" fill="#78350F" />
			<path d="M40,58 Q50,67 60,58" fill="none" stroke="#78350F" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else}
		<!-- 🐧 Tučniak v žltej havajskej košeli -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#CFFAFE" />
			<!-- Havajská košeľa -->
			<path d="M12,84 Q50,68 88,84 L95,100 L5,100 Z" fill="#FACC15" />
			<!-- Kvety na košeli -->
			<circle cx="30" cy="85" r="3" fill="#EC4899" />
			<circle cx="70" cy="85" r="3" fill="#06B6D4" />
			<circle cx="50" cy="92" r="3" fill="#EC4899" />
			<polygon points="44,76 56,76 50,88" fill="#FFFFFF" />
			<!-- Telo/hlava tučniaka -->
			<ellipse cx="50" cy="46" rx="26" ry="28" fill="#0F172A" />
			<ellipse cx="50" cy="50" rx="19" ry="21" fill="#FFFFFF" />
			<!-- Oči -->
			<circle cx="42" cy="42" r="3.5" fill="#0F172A" />
			<circle cx="43" cy="40" r="1.2" fill="#FFFFFF" />
			<circle cx="58" cy="42" r="3.5" fill="#0F172A" />
			<circle cx="59" cy="40" r="1.2" fill="#FFFFFF" />
			<!-- Oranžový zobák -->
			<polygon points="44,48 56,48 50,56" fill="#F97316" />
			<!-- Ružové líčka -->
			<circle cx="34" cy="50" r="3.5" fill="#FDA4AF" opacity="0.8" />
			<circle cx="66" cy="50" r="3.5" fill="#FDA4AF" opacity="0.8" />
		</svg>
	{/if}
</div>

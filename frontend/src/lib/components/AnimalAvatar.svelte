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

	// Normalizácia avatarId a podpora aliasov
	let normalizedId = $derived((avatarId || 'fox').toLowerCase().trim());
	let effectiveId = $derived(
		normalizedId === 'futurama' ? 'bender' :
		normalizedId === 'xenomorph' ? 'alien' :
		normalizedId
	);
</script>

<div
	class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-transform {className}"
	style="width: {typeof size === 'number' ? `${size}px` : size}; height: {typeof size === 'number' ? `${size}px` : size};"
	aria-label="Avatar {effectiveId}"
>
	{#if effectiveId === 'fox'}
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
	{:else if effectiveId === 'panda'}
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
	{:else if effectiveId === 'lion'}
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
	{:else if effectiveId === 'cat'}
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
	{:else if effectiveId === 'dog'}
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
	{:else if effectiveId === 'rabbit'}
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
	{:else if effectiveId === 'bear'}
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
	{:else if effectiveId === 'frog'}
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
	{:else if effectiveId === 'owl'}
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
	{:else if effectiveId === 'tiger'}
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
	{:else if effectiveId === 'monkey'}
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
	{:else if effectiveId === 'penguin'}
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
	{:else if effectiveId === 'terminator'}
		<!-- 🤖 Terminátor (T-800 s červeným kyber-okom) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#0F172A" />
			<circle cx="50" cy="50" r="48" fill="none" stroke="#334155" stroke-width="1.5" />
			<!-- Krk a ramená -->
			<path d="M14,86 Q50,72 86,86 L94,100 L6,100 Z" fill="#1E293B" />
			<path d="M38,72 L38,88 L62,88 L62,72 Z" fill="#475569" />
			<line x1="44" y1="74" x2="44" y2="86" stroke="#94A3B8" stroke-width="2.5" />
			<line x1="56" y1="74" x2="56" y2="86" stroke="#94A3B8" stroke-width="2.5" />
			<rect x="22" y="82" width="10" height="18" rx="2" fill="#64748B" />
			<rect x="68" y="82" width="10" height="18" rx="2" fill="#64748B" />
			<!-- T-800 titánová lebka -->
			<path d="M26,38 C26,20 36,14 50,14 C64,14 74,20 74,38 C74,52 68,58 68,66 C68,72 62,76 50,76 C38,76 32,72 32,66 C32,58 26,52 26,38 Z" fill="#94A3B8" />
			<path d="M50,14 C64,14 74,20 74,38 C74,52 68,58 68,66 C68,72 62,76 50,76 Z" fill="#64748B" opacity="0.6" />
			<!-- Kovové platne na čele -->
			<path d="M34,26 Q50,22 66,26 L65,30 Q50,26 35,30 Z" fill="#CBD5E1" />
			<line x1="50" y1="16" x2="50" y2="34" stroke="#475569" stroke-width="1.5" />
			<circle cx="38" cy="20" r="1.5" fill="#334155" />
			<circle cx="62" cy="20" r="1.5" fill="#334155" />
			<!-- Nadočnicové oblúky -->
			<path d="M28,38 L46,40 L44,43 L29,41 Z" fill="#475569" />
			<path d="M72,38 L54,40 L56,43 L71,41 Z" fill="#334155" />
			<!-- Očné jamky -->
			<ellipse cx="38" cy="46" rx="8" ry="7" fill="#020617" />
			<ellipse cx="62" cy="46" rx="8" ry="7" fill="#020617" />
			<!-- Pravé oko: mechanická kamera -->
			<circle cx="38" cy="46" r="4.5" fill="#475569" />
			<circle cx="38" cy="46" r="2.5" fill="#94A3B8" />
			<circle cx="39" cy="45" r="1" fill="#FFFFFF" />
			<!-- Ľavé oko: žiariace červené kyber-oko T-800 -->
			<circle cx="62" cy="46" r="9" fill="#EF4444" opacity="0.3" />
			<circle cx="62" cy="46" r="5" fill="#DC2626" />
			<circle cx="62" cy="46" r="3" fill="#EF4444" />
			<circle cx="62" cy="46" r="1.5" fill="#FEF2F2" />
			<!-- Lícne hydrauliky -->
			<line x1="26" y1="52" x2="34" y2="60" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
			<line x1="74" y1="52" x2="66" y2="60" stroke="#475569" stroke-width="2.5" stroke-linecap="round" />
			<!-- Nosový prieduch -->
			<polygon points="48,51 52,51 50,57" fill="#020617" />
			<!-- Kovové zuby T-800 -->
			<rect x="36" y="62" width="28" height="9" rx="2" fill="#0F172A" />
			<rect x="38" y="63" width="4" height="7" rx="1" fill="#E2E8F0" />
			<rect x="43" y="63" width="4" height="7" rx="1" fill="#CBD5E1" />
			<rect x="48" y="63" width="4" height="7" rx="1" fill="#E2E8F0" />
			<rect x="53" y="63" width="4" height="7" rx="1" fill="#CBD5E1" />
			<rect x="58" y="63" width="4" height="7" rx="1" fill="#E2E8F0" />
			<line x1="36" y1="66.5" x2="64" y2="66.5" stroke="#0F172A" stroke-width="1.2" />
		</svg>
	{:else if effectiveId === 'bender'}
		<!-- 🤖 Robot ako z Futuramy (Bender) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#CFFAFE" />
			<!-- Telo / plechový hrudník -->
			<path d="M16,84 Q50,70 84,84 L92,100 L8,100 Z" fill="#94A3B8" />
			<ellipse cx="50" cy="88" rx="20" ry="10" fill="#64748B" opacity="0.4" />
			<!-- Kovový krk -->
			<rect x="40" y="66" width="20" height="12" rx="2" fill="#64748B" />
			<line x1="40" y1="70" x2="60" y2="70" stroke="#475569" stroke-width="1.5" />
			<line x1="40" y1="74" x2="60" y2="74" stroke="#475569" stroke-width="1.5" />
			<!-- Hlava valec -->
			<path d="M30,34 C30,18 40,16 50,16 C60,16 70,18 70,34 L70,64 C70,68 66,70 50,70 C34,70 30,68 30,64 Z" fill="#94A3B8" />
			<path d="M50,16 C60,16 70,18 70,34 L70,64 C70,68 66,70 50,70 Z" fill="#64748B" opacity="0.35" />
			<!-- Ikonická anténa -->
			<line x1="50" y1="16" x2="50" y2="7" stroke="#64748B" stroke-width="3" stroke-linecap="round" />
			<circle cx="50" cy="6" r="4.5" fill="#94A3B8" stroke="#475569" stroke-width="1.2" />
			<!-- Visor box -->
			<rect x="26" y="32" width="48" height="20" rx="8" fill="#475569" stroke="#334155" stroke-width="1.5" />
			<!-- Dve guľaté oči s čiernymi zreničkami -->
			<circle cx="39" cy="42" r="7.5" fill="#FEF08A" stroke="#1E293B" stroke-width="1.2" />
			<circle cx="39" cy="42" r="2.8" fill="#0F172A" />
			<circle cx="61" cy="42" r="7.5" fill="#FEF08A" stroke="#1E293B" stroke-width="1.2" />
			<circle cx="61" cy="42" r="2.8" fill="#0F172A" />
			<!-- Ústna mriežka -->
			<rect x="34" y="55" width="32" height="11" rx="4" fill="#FEF08A" stroke="#334155" stroke-width="1.5" />
			<line x1="39" y1="55" x2="39" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="44" y1="55" x2="44" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="49" y1="55" x2="49" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="54" y1="55" x2="54" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="59" y1="55" x2="59" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="64" y1="55" x2="64" y2="66" stroke="#475569" stroke-width="1.2" />
			<line x1="34" y1="60.5" x2="66" y2="60.5" stroke="#475569" stroke-width="1" />
		</svg>
	{:else if effectiveId === 'predator'}
		<!-- 🛸 Predátor s biomaskou a laserom -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#022C22" />
			<!-- Dready visiace po bokoch -->
			<path d="M26,30 Q12,50 14,80 L20,84 Q18,52 30,36 Z" fill="#0F172A" />
			<path d="M22,38 Q8,60 10,95 L16,97 Q14,62 26,42 Z" fill="#1E293B" />
			<rect x="13" y="60" width="5" height="4" rx="1" fill="#D97706" />
			<rect x="9" y="75" width="5" height="4" rx="1" fill="#94A3B8" />
			<path d="M74,30 Q88,50 86,80 L80,84 Q82,52 70,36 Z" fill="#0F172A" />
			<path d="M78,38 Q92,60 90,95 L84,97 Q86,62 74,42 Z" fill="#1E293B" />
			<rect x="82" y="60" width="5" height="4" rx="1" fill="#D97706" />
			<rect x="86" y="75" width="5" height="4" rx="1" fill="#94A3B8" />
			<!-- Ramenné panciere a plazmový kanón -->
			<path d="M16,84 Q50,70 84,84 L94,100 L6,100 Z" fill="#334155" />
			<path d="M30,80 L70,80 L66,95 L34,95 Z" fill="#1E293B" />
			<rect x="18" y="72" width="12" height="7" rx="2" fill="#475569" stroke="#1E293B" stroke-width="1" />
			<circle cx="19" cy="75.5" r="2.5" fill="#06B6D4" />
			<!-- Biomaska -->
			<path d="M28,24 C34,14 66,14 72,24 C76,32 74,54 70,68 C66,78 58,82 50,82 C42,82 34,78 30,68 C26,54 24,32 28,24 Z" fill="#64748B" />
			<path d="M50,15 C66,15 72,24 72,24 C76,32 74,54 70,68 C66,78 58,82 50,82 Z" fill="#475569" opacity="0.45" />
			<!-- Rytiny na čele -->
			<polygon points="46,18 54,18 50,30" fill="#334155" />
			<line x1="38" y1="24" x2="44" y2="30" stroke="#334155" stroke-width="1.5" />
			<line x1="62" y1="24" x2="56" y2="30" stroke="#334155" stroke-width="1.5" />
			<!-- Šikmé zorníky masky -->
			<polygon points="32,42 46,46 45,51 33,48" fill="#020617" />
			<polygon points="68,42 54,46 55,51 67,48" fill="#020617" />
			<!-- Trojuholníkový červený zameriavač (3 laser bodky) -->
			<circle cx="36" cy="34" r="2.5" fill="#EF4444" />
			<circle cx="41" cy="34" r="2.5" fill="#EF4444" />
			<circle cx="38.5" cy="30" r="2.5" fill="#EF4444" />
			<circle cx="38.5" cy="30" r="1" fill="#FFFFFF" />
			<circle cx="36" cy="34" r="1" fill="#FFFFFF" />
			<circle cx="41" cy="34" r="1" fill="#FFFFFF" />
			<!-- Mandibulárny kryt a filtre -->
			<polygon points="44,58 56,58 54,72 46,72" fill="#334155" />
			<line x1="47" y1="62" x2="53" y2="62" stroke="#94A3B8" stroke-width="1.2" />
			<line x1="48" y1="66" x2="52" y2="66" stroke="#94A3B8" stroke-width="1.2" />
			<circle cx="34" cy="64" r="3" fill="#1E293B" stroke="#94A3B8" stroke-width="1" />
			<circle cx="66" cy="64" r="3" fill="#1E293B" stroke="#94A3B8" stroke-width="1" />
		</svg>
	{:else if effectiveId === 'alien'}
		<!-- 👾 Alien (Xenomorph) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#050811" />
			<circle cx="50" cy="50" r="48" fill="none" stroke="#064E3B" stroke-width="1.5" />
			<!-- Telo a rebrovaný krk -->
			<path d="M14,86 Q50,70 86,86 L94,100 L6,100 Z" fill="#0F172A" />
			<path d="M38,66 Q50,72 62,66 L64,84 Q50,90 36,84 Z" fill="#1E293B" />
			<line x1="38" y1="70" x2="62" y2="70" stroke="#334155" stroke-width="2" />
			<line x1="37" y1="76" x2="63" y2="76" stroke="#334155" stroke-width="2" />
			<line x1="39" y1="82" x2="61" y2="82" stroke="#334155" stroke-width="2" />
			<!-- Predĺžená biomechanická klenba lebky -->
			<path d="M22,50 C12,30 24,10 60,10 C84,10 88,26 82,42 C78,54 70,58 64,62 C50,66 36,66 26,60 Z" fill="#0F172A" />
			<path d="M30,34 C25,20 35,12 60,12 C80,12 84,24 80,38 C72,28 58,22 40,24 Z" fill="#334155" opacity="0.65" />
			<path d="M34,22 C42,16 56,15 72,18" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" opacity="0.75" />
			<line x1="30" y1="40" x2="24" y2="48" stroke="#1E293B" stroke-width="2.5" />
			<line x1="35" y1="44" x2="30" y2="52" stroke="#1E293B" stroke-width="2.5" />
			<line x1="42" y1="48" x2="38" y2="56" stroke="#1E293B" stroke-width="2.5" />
			<!-- Čeľusť a strieborné zuby -->
			<path d="M54,42 C64,44 76,46 76,56 C76,64 68,68 58,68 C52,68 50,60 52,52 Z" fill="#1E293B" />
			<path d="M58,54 Q68,54 74,58 L72,62 Q66,60 58,60 Z" fill="#E2E8F0" />
			<line x1="62" y1="54" x2="62" y2="60" stroke="#0F172A" stroke-width="1.2" />
			<line x1="66" y1="54" x2="66" y2="61" stroke="#0F172A" stroke-width="1.2" />
			<line x1="70" y1="55" x2="70" y2="62" stroke="#0F172A" stroke-width="1.2" />
			<!-- Druhá vnútorná čeľusť -->
			<rect x="70" y="56" width="10" height="4" rx="1.5" fill="#CBD5E1" stroke="#0F172A" stroke-width="0.8" />
			<polygon points="77,55 80,55 78,57" fill="#F8FAFC" />
			<polygon points="77,61 80,61 78,59" fill="#F8FAFC" />
			<!-- Kyselina -->
			<ellipse cx="76" cy="67" rx="1.5" ry="3" fill="#22C55E" opacity="0.8" />
			<circle cx="76" cy="73" r="1.2" fill="#22C55E" />
		</svg>
	{:else if effectiveId === 'retro_robot'}
		<!-- 🤖 Retro plechový robot s budíkmi -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#FEF3C7" />
			<!-- Hrudník a farebné diódy -->
			<path d="M16,84 Q50,72 84,84 L92,100 L8,100 Z" fill="#0D9488" />
			<rect x="36" y="82" width="28" height="18" rx="3" fill="#134E4A" />
			<circle cx="42" cy="90" r="3" fill="#EF4444" />
			<circle cx="50" cy="90" r="3" fill="#FACC15" />
			<circle cx="58" cy="90" r="3" fill="#22C55E" />
			<rect x="42" y="66" width="16" height="8" rx="2" fill="#475569" />
			<line x1="42" y1="70" x2="58" y2="70" stroke="#94A3B8" stroke-width="1.5" />
			<!-- Ušné skrutky s červenými guľkami -->
			<line x1="20" y1="44" x2="28" y2="44" stroke="#475569" stroke-width="3" />
			<circle cx="18" cy="44" r="5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5" />
			<line x1="72" y1="44" x2="80" y2="44" stroke="#475569" stroke-width="3" />
			<circle cx="82" cy="44" r="5" fill="#EF4444" stroke="#991B1B" stroke-width="1.5" />
			<!-- Vrchná anténa so špirálou -->
			<line x1="50" y1="12" x2="50" y2="24" stroke="#475569" stroke-width="2.5" />
			<circle cx="50" cy="10" r="4.5" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5" />
			<!-- Hranatá hlava -->
			<rect x="28" y="24" width="44" height="42" rx="8" fill="#14B8A6" stroke="#0F766E" stroke-width="2" />
			<circle cx="33" cy="29" r="1.5" fill="#115E59" />
			<circle cx="67" cy="29" r="1.5" fill="#115E59" />
			<circle cx="33" cy="61" r="1.5" fill="#115E59" />
			<circle cx="67" cy="61" r="1.5" fill="#115E59" />
			<!-- Oči merače -->
			<circle cx="41" cy="40" r="7.5" fill="#F8FAFC" stroke="#0F766E" stroke-width="1.5" />
			<circle cx="41" cy="40" r="3" fill="#0284C7" />
			<line x1="41" y1="40" x2="44" y2="37" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
			<circle cx="59" cy="40" r="7.5" fill="#F8FAFC" stroke="#0F766E" stroke-width="1.5" />
			<circle cx="59" cy="40" r="3" fill="#0284C7" />
			<line x1="59" y1="40" x2="62" y2="37" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
			<!-- Ústa reproduktor -->
			<rect x="36" y="52" width="28" height="8" rx="3" fill="#115E59" />
			<line x1="40" y1="53" x2="40" y2="59" stroke="#FACC15" stroke-width="2" />
			<line x1="45" y1="53" x2="45" y2="59" stroke="#FACC15" stroke-width="2" />
			<line x1="50" y1="53" x2="50" y2="59" stroke="#FACC15" stroke-width="2" />
			<line x1="55" y1="53" x2="55" y2="59" stroke="#FACC15" stroke-width="2" />
			<line x1="60" y1="53" x2="60" y2="59" stroke="#FACC15" stroke-width="2" />
		</svg>
	{:else if effectiveId === 'cyborg'}
		<!-- 🕶️ Kybernetik s neónovým priezorom -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#312E81" />
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#0F172A" />
			<path d="M30,76 L50,96 L70,76" fill="#1E1B4B" />
			<line x1="50" y1="84" x2="50" y2="100" stroke="#06B6D4" stroke-width="2" />
			<rect x="42" y="66" width="16" height="12" fill="#E2E8F0" />
			<ellipse cx="50" cy="48" rx="26" ry="28" fill="#F8FAFC" />
			<!-- Kybernetické vlasy -->
			<path d="M24,42 C24,20 36,14 50,14 C64,14 76,20 76,42 C72,28 62,22 50,22 C38,22 28,28 24,42 Z" fill="#0F172A" />
			<path d="M36,16 Q50,24 64,16" stroke="#EC4899" stroke-width="2.5" fill="none" stroke-linecap="round" />
			<!-- Obvody a headset -->
			<path d="M28,46 L34,46 L36,54 L40,54" fill="none" stroke="#06B6D4" stroke-width="1.5" />
			<circle cx="40" cy="54" r="1.5" fill="#06B6D4" />
			<rect x="20" y="44" width="5" height="12" rx="2" fill="#06B6D4" />
			<!-- Neónový cyberpunk visor -->
			<path d="M26,38 L74,38 L70,50 L30,50 Z" fill="#06B6D4" />
			<path d="M27,39 L73,39 L71,43 L29,43 Z" fill="#EC4899" opacity="0.8" />
			<line x1="32" y1="46" x2="68" y2="46" stroke="#FFFFFF" stroke-width="1.5" opacity="0.75" />
			<polygon points="49,54 51,54 50,58" fill="#94A3B8" />
			<line x1="45" y1="64" x2="55" y2="64" stroke="#475569" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if effectiveId === 'mecha'}
		<!-- 🤖 Bojový Mecha (Gundam štýl) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#450A0A" />
			<path d="M14,84 Q50,70 86,84 L94,100 L6,100 Z" fill="#1E3A8A" />
			<polygon points="40,76 60,76 50,90" fill="#DC2626" />
			<rect x="30" y="80" width="8" height="12" fill="#FACC15" />
			<rect x="62" y="80" width="8" height="12" fill="#FACC15" />
			<!-- Pancierová prilba Mecha -->
			<polygon points="26,30 50,18 74,30 70,64 50,74 30,64" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
			<polygon points="26,30 36,36 34,60 26,52" fill="#1E3A8A" />
			<polygon points="74,30 64,36 66,60 74,52" fill="#1E3A8A" />
			<!-- Zlatý V-Fin hrebeň -->
			<polygon points="50,28 32,12 40,24 50,28" fill="#FACC15" stroke="#CA8A04" stroke-width="1" />
			<polygon points="50,28 68,12 60,24 50,28" fill="#FACC15" stroke="#CA8A04" stroke-width="1" />
			<polygon points="47,26 53,26 50,33" fill="#DC2626" />
			<polygon points="46,20 54,20 50,26" fill="#DC2626" />
			<!-- Zelené optické senzory -->
			<polygon points="36,44 46,46 45,49 37,47" fill="#10B981" />
			<polygon points="64,44 54,46 55,49 63,47" fill="#10B981" />
			<polygon points="35,42 65,42 63,51 50,54 37,51" fill="#0F172A" opacity="0.3" />
			<!-- Chladiace vetráky a brada -->
			<polygon points="43,52 57,52 55,66 45,66" fill="#F8FAFC" />
			<line x1="46" y1="56" x2="54" y2="56" stroke="#475569" stroke-width="1.5" />
			<line x1="47" y1="60" x2="53" y2="60" stroke="#475569" stroke-width="1.5" />
			<polygon points="46,66 54,66 50,72" fill="#DC2626" />
		</svg>
	{:else if effectiveId === 'ai_drone'}
		<!-- 🛸 Autonómny AI Dron -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#0C4A6E" />
			<circle cx="50" cy="50" r="42" fill="none" stroke="#38BDF8" stroke-width="1" stroke-dasharray="4,4" opacity="0.6" />
			<!-- Krídelká / trysky -->
			<path d="M12,44 C12,38 20,40 24,46 L24,54 C18,58 12,52 12,44 Z" fill="#E2E8F0" stroke="#0284C7" stroke-width="1.5" />
			<circle cx="16" cy="48" r="2.5" fill="#38BDF8" />
			<path d="M88,44 C88,38 80,40 76,46 L76,54 C82,58 88,52 88,44 Z" fill="#E2E8F0" stroke="#0284C7" stroke-width="1.5" />
			<circle cx="84" cy="48" r="2.5" fill="#38BDF8" />
			<!-- Guľové telo -->
			<circle cx="50" cy="50" r="28" fill="#F8FAFC" stroke="#BAE6FD" stroke-width="2" />
			<path d="M26,42 Q50,34 74,42" fill="none" stroke="#0284C7" stroke-width="2" />
			<path d="M26,58 Q50,66 74,58" fill="none" stroke="#0284C7" stroke-width="2" />
			<!-- Anténky -->
			<line x1="42" y1="24" x2="38" y2="16" stroke="#0284C7" stroke-width="2" stroke-linecap="round" />
			<circle cx="37" cy="15" r="2" fill="#38BDF8" />
			<line x1="58" y1="24" x2="62" y2="16" stroke="#0284C7" stroke-width="2" stroke-linecap="round" />
			<circle cx="63" cy="15" r="2" fill="#38BDF8" />
			<!-- Aperture Core oko -->
			<circle cx="50" cy="50" r="14" fill="#0F172A" />
			<circle cx="50" cy="50" r="11" fill="#0284C7" />
			<circle cx="50" cy="50" r="7" fill="#38BDF8" />
			<circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />
			<circle cx="47" cy="47" r="1.5" fill="#FFFFFF" />
		</svg>
	{:else if effectiveId === 'steampunk_bot'}
		<!-- ⚙️ Steampunk Robot s ozubeniami -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#78350F" />
			<path d="M14,85 Q50,70 86,85 L94,100 L6,100 Z" fill="#B45309" />
			<path d="M30,80 L70,80 L64,95 L36,95 Z" fill="#92400E" />
			<!-- Komín s parou -->
			<rect x="22" y="16" width="8" height="18" rx="1" fill="#D97706" stroke="#78350F" stroke-width="1.5" />
			<ellipse cx="26" cy="16" rx="4" ry="2" fill="#F59E0B" />
			<circle cx="26" cy="10" r="3" fill="#FEF3C7" opacity="0.8" />
			<circle cx="23" cy="6" r="4" fill="#FEF3C7" opacity="0.6" />
			<!-- Hlava a ozubené koliesko -->
			<circle cx="50" cy="48" r="26" fill="#D97706" stroke="#92400E" stroke-width="2" />
			<circle cx="50" cy="48" r="23" fill="#F59E0B" />
			<circle cx="64" cy="36" r="8" fill="#B45309" stroke="#78350F" stroke-width="1.5" />
			<circle cx="64" cy="36" r="3" fill="#FEF3C7" />
			<!-- Teleskopické oko a barometer -->
			<circle cx="38" cy="46" r="10" fill="#78350F" stroke="#B45309" stroke-width="2" />
			<circle cx="38" cy="46" r="7" fill="#0284C7" />
			<circle cx="38" cy="46" r="4" fill="#38BDF8" />
			<circle cx="36" cy="44" r="1.5" fill="#FFFFFF" />
			<line x1="28" y1="46" x2="48" y2="46" stroke="#B45309" stroke-width="1" />
			<circle cx="58" cy="48" r="6" fill="#FEF3C7" stroke="#78350F" stroke-width="1.5" />
			<line x1="58" y1="48" x2="61" y2="45" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" />
			<!-- Mriežka úst -->
			<rect x="40" y="58" width="20" height="7" rx="2" fill="#78350F" />
			<line x1="44" y1="58" x2="44" y2="65" stroke="#F59E0B" stroke-width="1.2" />
			<line x1="48" y1="58" x2="48" y2="65" stroke="#F59E0B" stroke-width="1.2" />
			<line x1="52" y1="58" x2="52" y2="65" stroke="#F59E0B" stroke-width="1.2" />
			<line x1="56" y1="58" x2="56" y2="65" stroke="#F59E0B" stroke-width="1.2" />
		</svg>
	{:else if effectiveId === 'astro_bot'}
		<!-- 👨‍🚀 Astro Bot (kozmický robot) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#1E1B4B" />
			<!-- Hviezdy -->
			<circle cx="20" cy="20" r="1" fill="#FFFFFF" />
			<circle cx="80" cy="25" r="1.5" fill="#FFFFFF" />
			<circle cx="15" cy="70" r="1" fill="#FDE047" />
			<circle cx="85" cy="65" r="1" fill="#FFFFFF" />
			<!-- Skafander -->
			<path d="M14,84 Q50,70 86,84 L94,100 L6,100 Z" fill="#F8FAFC" />
			<path d="M36,78 L64,78 L60,94 L40,94 Z" fill="#3B82F6" />
			<!-- Prilba -->
			<circle cx="50" cy="46" r="30" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
			<rect x="16" y="40" width="6" height="12" rx="3" fill="#3B82F6" />
			<rect x="78" y="40" width="6" height="12" rx="3" fill="#3B82F6" />
			<line x1="81" y1="40" x2="84" y2="28" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" />
			<circle cx="85" cy="27" r="2.5" fill="#EF4444" />
			<!-- Priezor s digitálnou tvárou -->
			<ellipse cx="50" cy="46" rx="22" ry="19" fill="#0F172A" stroke="#1E293B" stroke-width="1.5" />
			<path d="M36,44 Q41,39 46,44" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" />
			<path d="M54,44 Q59,39 64,44" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" />
			<path d="M44,53 Q50,57 56,53" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" />
			<path d="M33,35 Q44,30 58,32" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6" />
		</svg>
	{:else if effectiveId === 'cyber_ninja'}
		<!-- 🥷 Kyber Nindža -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#18181B" />
			<path d="M12,85 Q50,70 88,85 L95,100 L5,100 Z" fill="#27272A" />
			<polygon points="40,78 60,78 50,96" fill="#3F3F46" />
			<line x1="50" y1="80" x2="50" y2="94" stroke="#EF4444" stroke-width="2" />
			<!-- Kukla a čelenka -->
			<path d="M24,42 C24,18 36,12 50,12 C64,12 76,18 76,42 C76,64 68,72 50,72 C32,72 24,64 24,42 Z" fill="#27272A" />
			<path d="M26,30 L74,30 L72,36 L28,36 Z" fill="#52525B" />
			<polygon points="48,31 52,31 50,35" fill="#EF4444" />
			<!-- Maska s filtrami -->
			<polygon points="30,48 50,44 70,48 66,70 50,74 34,70" fill="#09090B" stroke="#3F3F46" stroke-width="1.5" />
			<line x1="38" y1="56" x2="46" y2="58" stroke="#EF4444" stroke-width="2" />
			<line x1="38" y1="62" x2="46" y2="63" stroke="#71717A" stroke-width="1.5" />
			<line x1="62" y1="56" x2="54" y2="58" stroke="#EF4444" stroke-width="2" />
			<line x1="62" y1="62" x2="54" y2="63" stroke="#71717A" stroke-width="1.5" />
			<!-- Červený laserový zorník -->
			<polygon points="32,42 68,42 66,46 34,46" fill="#09090B" />
			<line x1="34" y1="44" x2="66" y2="44" stroke="#EF4444" stroke-width="3" stroke-linecap="round" />
			<line x1="46" y1="44" x2="54" y2="44" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
		</svg>
	{:else if effectiveId === 'glitch_ai'}
		<!-- 💻 Digitálna AI (Matrix CRT) -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#052E16" />
			<text x="18" y="24" fill="#15803D" font-family="monospace" font-size="7" opacity="0.6">01</text>
			<text x="76" y="28" fill="#15803D" font-family="monospace" font-size="7" opacity="0.6">10</text>
			<text x="14" y="78" fill="#15803D" font-family="monospace" font-size="7" opacity="0.6">11</text>
			<text x="78" y="80" fill="#15803D" font-family="monospace" font-size="7" opacity="0.6">00</text>
			<path d="M16,86 Q50,72 84,86 L90,100 L10,100 Z" fill="#14532D" />
			<rect x="44" y="68" width="12" height="12" fill="#166534" />
			<!-- CRT monitor -->
			<rect x="22" y="22" width="56" height="46" rx="8" fill="#166534" stroke="#22C55E" stroke-width="2" />
			<line x1="44" y1="22" x2="36" y2="12" stroke="#22C55E" stroke-width="2" stroke-linecap="round" />
			<circle cx="35" cy="11" r="2" fill="#4ADE80" />
			<line x1="56" y1="22" x2="64" y2="12" stroke="#22C55E" stroke-width="2" stroke-linecap="round" />
			<circle cx="65" cy="11" r="2" fill="#4ADE80" />
			<!-- Obrazovka s pixelovou tvárou -->
			<rect x="27" y="27" width="46" height="36" rx="5" fill="#052E16" />
			<rect x="34" y="36" width="7" height="7" rx="1.5" fill="#4ADE80" />
			<rect x="36" y="38" width="3" height="3" fill="#FFFFFF" />
			<rect x="59" y="36" width="7" height="7" rx="1.5" fill="#4ADE80" />
			<rect x="61" y="38" width="3" height="3" fill="#FFFFFF" />
			<path d="M38,50 L42,54 L58,54 L62,50" fill="none" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round" />
			<line x1="27" y1="33" x2="73" y2="33" stroke="#22C55E" stroke-width="1" opacity="0.3" />
			<line x1="27" y1="45" x2="73" y2="45" stroke="#22C55E" stroke-width="1" opacity="0.3" />
			<line x1="27" y1="57" x2="73" y2="57" stroke="#22C55E" stroke-width="1" opacity="0.3" />
		</svg>
	{:else}
		<!-- Fallback: Tučniak -->
		<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" fill="#CFFAFE" />
			<path d="M12,84 Q50,68 88,84 L95,100 L5,100 Z" fill="#FACC15" />
			<ellipse cx="50" cy="46" rx="26" ry="28" fill="#0F172A" />
			<ellipse cx="50" cy="50" rx="19" ry="21" fill="#FFFFFF" />
			<circle cx="42" cy="42" r="3.5" fill="#0F172A" />
			<circle cx="58" cy="42" r="3.5" fill="#0F172A" />
			<polygon points="44,48 56,48 50,56" fill="#F97316" />
		</svg>
	{/if}
</div>

export interface BoardTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  colors: {
    wrapperBg: string;       // Outer board container
    gridBg: string;          // Inner grid container
    centerBg: string;        // Center stage container
    tileBg: string;          // Regular property tiles
    cornerBg: string;        // Corner tiles (Start, Jail, etc.)
    borderColor: string;     // Border of tiles
    wrapperBorder: string;   // Outer wrapper border
    accentGlow: string;      // Shadow glow color
    previewGradient: string; // Gradient preview for shop card
    primaryAccent: string;   // Accent color for highlights
  };
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight Cyberpunk',
    description: 'Classic Richup deep cosmic violet with neon purple highlights',
    price: 0,
    badge: 'DEFAULT',
    colors: {
      wrapperBg: '#171328',
      gridBg: '#110d1f',
      centerBg: '#130f1d',
      tileBg: '#262a4c',
      cornerBg: '#262a4c',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      wrapperBorder: '#261f3e',
      accentGlow: 'rgba(168, 85, 247, 0.25)',
      previewGradient: 'from-[#171328] via-[#262a4c] to-[#110d1f]',
      primaryAccent: '#a855f7'
    }
  },
  {
    id: 'emerald_casino',
    name: 'Emerald Casino',
    description: 'Luxurious Vegas felt green with polished gold & mahogany trims',
    price: 120,
    badge: 'POPULAR',
    colors: {
      wrapperBg: '#0b2416',
      gridBg: '#06170e',
      centerBg: '#091f13',
      tileBg: '#134026',
      cornerBg: '#195231',
      borderColor: 'rgba(34, 197, 94, 0.4)',
      wrapperBorder: '#165e36',
      accentGlow: 'rgba(34, 197, 94, 0.3)',
      previewGradient: 'from-[#0b2416] via-[#134026] to-[#06170e]',
      primaryAccent: '#22c55e'
    }
  },
  {
    id: 'carthage_sahara',
    name: 'Carthage Sahara',
    description: 'Warm Mediterranean terracotta sands with glowing sunset amber',
    price: 150,
    badge: 'TUNISIA',
    colors: {
      wrapperBg: '#2b170e',
      gridBg: '#1d0e08',
      centerBg: '#23120a',
      tileBg: '#472516',
      cornerBg: '#522b19',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      wrapperBorder: '#63331c',
      accentGlow: 'rgba(245, 158, 11, 0.35)',
      previewGradient: 'from-[#2b170e] via-[#472516] to-[#1d0e08]',
      primaryAccent: '#f59e0b'
    }
  },
  {
    id: 'atlantis_ocean',
    name: 'Atlantis Ocean Blue',
    description: 'Abyssal nautical sapphire waters with radiant cyan luminescence',
    price: 180,
    badge: 'NEW',
    colors: {
      wrapperBg: '#0b1b30',
      gridBg: '#05101f',
      centerBg: '#081628',
      tileBg: '#13335c',
      cornerBg: '#184074',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      wrapperBorder: '#1c4d8c',
      accentGlow: 'rgba(14, 165, 233, 0.35)',
      previewGradient: 'from-[#0b1b30] via-[#13335c] to-[#05101f]',
      primaryAccent: '#0ea5e9'
    }
  },
  {
    id: 'carbon_stealth',
    name: 'Carbon Stealth Onyx',
    description: 'Ultra-clean matte carbon black with razor-sharp silver borders',
    price: 200,
    colors: {
      wrapperBg: '#131316',
      gridBg: '#0a0a0c',
      centerBg: '#0e0e11',
      tileBg: '#1e1e24',
      cornerBg: '#25252d',
      borderColor: 'rgba(255, 255, 255, 0.22)',
      wrapperBorder: '#30303a',
      accentGlow: 'rgba(255, 255, 255, 0.15)',
      previewGradient: 'from-[#131316] via-[#1e1e24] to-[#0a0a0c]',
      primaryAccent: '#e2e8f0'
    }
  },
  {
    id: 'tokyo_sakura',
    name: 'Tokyo Sakura Night',
    description: 'Nocturnal Japanese plum skies with glowing cherry blossom neon',
    price: 240,
    colors: {
      wrapperBg: '#291028',
      gridBg: '#180717',
      centerBg: '#200b20',
      tileBg: '#441842',
      cornerBg: '#541d51',
      borderColor: 'rgba(244, 114, 182, 0.45)',
      wrapperBorder: '#692365',
      accentGlow: 'rgba(236, 72, 153, 0.35)',
      previewGradient: 'from-[#291028] via-[#441842] to-[#180717]',
      primaryAccent: '#ec4899'
    }
  },
  {
    id: 'royal_gold',
    name: 'Imperial 24K Gold',
    description: 'Majestic sovereign amethyst with handcrafted 24-karat gold trims',
    price: 300,
    badge: 'ROYAL',
    colors: {
      wrapperBg: '#240d33',
      gridBg: '#150620',
      centerBg: '#1b0929',
      tileBg: '#3d1657',
      cornerBg: '#4c1a6d',
      borderColor: 'rgba(234, 179, 8, 0.55)',
      wrapperBorder: '#855d14',
      accentGlow: 'rgba(234, 179, 8, 0.45)',
      previewGradient: 'from-[#240d33] via-[#3d1657] to-[#855d14]',
      primaryAccent: '#eab308'
    }
  }
,
  {
    id: 'cyber_matrix',
    name: 'Cyber Matrix Terminal',
    description: 'Phosphor green digital rain terminal with pitch black obsidian panels',
    price: 260,
    badge: 'CYBER',
    colors: {
      wrapperBg: '#05130b',
      gridBg: '#020b06',
      centerBg: '#041009',
      tileBg: '#0c2e1b',
      cornerBg: '#113e25',
      borderColor: 'rgba(34, 197, 94, 0.45)',
      wrapperBorder: '#15803d',
      accentGlow: 'rgba(34, 197, 94, 0.4)',
      previewGradient: 'from-[#05130b] via-[#0c2e1b] to-[#020b06]',
      primaryAccent: '#22c55e'
    }
  },
  {
    id: 'magma_volcano',
    name: 'Molten Magma Core',
    description: 'Blazing volcanic obsidian with molten crimson lava veins and amber embers',
    price: 280,
    badge: 'HOT',
    colors: {
      wrapperBg: '#240808',
      gridBg: '#140303',
      centerBg: '#1c0505',
      tileBg: '#421111',
      cornerBg: '#571616',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      wrapperBorder: '#991b1b',
      accentGlow: 'rgba(249, 115, 22, 0.45)',
      previewGradient: 'from-[#240808] via-[#421111] to-[#140303]',
      primaryAccent: '#f97316'
    }
  }
];

export const DEFAULT_BOARD_THEME = BOARD_THEMES[0];

export function getBoardTheme(id?: string): BoardTheme {
  return BOARD_THEMES.find(t => t.id === id) || DEFAULT_BOARD_THEME;
}

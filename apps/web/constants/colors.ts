/**
 * System Colors & Design Tokens — "Pastel Serenity" Design System
 * 
 * Palette Reference:
 * - Primary Pink: #DF6D93
 * - Soft Pink: #E396AF
 * - Pale Pink / Lavender: #EDCDE3
 * - Soft Sage / Cream Green: #EAF1D7
 * - Soft Cyan: #ACD9DD
 */

export const COLORS = {
  // Brand & Core Palette
  primary: {
    DEFAULT: '#DF6D93',
    hover: '#D45B82',
    active: '#C74A72',
    foreground: '#FFFFFF',
    soft: '#E396AF',
    softHover: '#DA85A0',
    softForeground: '#262626',
  },
  secondary: {
    DEFAULT: '#ACD9DD',
    hover: '#9ACCCF',
    active: '#88BDC1',
    foreground: '#1A383B',
  },
  palePink: {
    DEFAULT: '#EDCDE3',
    hover: '#E4BFDA',
    foreground: '#3D1D33',
  },
  sage: {
    DEFAULT: '#EAF1D7',
    hover: '#DFE8C3',
    foreground: '#23381B',
  },
  accent: {
    DEFAULT: '#EAF1D7',
    foreground: '#23381B',
  },
  surfaceAccent: {
    DEFAULT: '#EDCDE3',
    foreground: '#3D1D33',
  },

  // Neutral System (Clean, Professional & High Contrast)
  neutral: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    mutedSurface: '#F7F7F5',
    border: '#E5E5E2',
    inputBorder: '#E5E5E2',
    textPrimary: '#262626',
    textSecondary: '#666666',
    textMuted: '#8A8A8A',
  },

  // Semantic Status Tokens
  status: {
    success: {
      bg: '#EAF1D7',
      border: '#D0DFAD',
      text: '#23381B',
    },
    error: {
      bg: '#FADBD8',
      border: '#F5B7B1',
      text: '#78281F',
    },
    warning: {
      bg: '#FDF3D7',
      border: '#F9E79F',
      text: '#5C4813',
    },
    info: {
      bg: '#ACD9DD',
      border: '#8FC5C9',
      text: '#1A383B',
    },
  },

  // UI Component Gradients & Patterns
  gradients: {
    brandButton: 'bg-[#DF6D93] hover:bg-[#D45B82]',
    brandLogo: 'from-[#DF6D93] to-[#E396AF]',
    brandText: 'from-[#262626] to-[#666666]',
    softGlowPrimary: 'rgba(223, 109, 147, 0.15)',
    softGlowCyan: 'rgba(172, 217, 221, 0.2)',
  },
} as const;

export type ColorsType = typeof COLORS;

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Brand raw palette ─────────────────────────────────────────── */
      colors: {
        /* Neutral ramp — warm near-neutral (PRD-11 §2) */
        neutral: {
          0: '#FFFFFF',
          50: '#F6F6F4',
          100: '#EDEDEA',
          200: '#E0E0DC',
          300: '#CBCBC6',
          400: '#A6A6A0',
          500: '#86867F',
          600: '#65655F',
          700: '#46463F',
          800: '#2A2A25',
          900: '#1A1A16',
        },
        crowe: {
          indigo: {
            dark: '#011E41',
            core: '#002E62',
            bright: '#003F9F',
          },
          amber: {
            bright: '#FFD231',
            core: '#F5A800',
            dark: '#D7761D',
          },
          teal: { bright: '#16D9BC', core: '#05AB8C', dark: '#0C7876' },
          cyan: { light: '#8FE1FF', core: '#54C0E8', dark: '#007DA3' },
          blue: { light: '#32A8FD', core: '#0075C9', dark: '#0050AD' },
          violet: { bright: '#EA80FF', core: '#B14FC5', dark: '#612080' },
          coral: { bright: '#FF526F', core: '#E5376B', dark: '#992A5C' },
        },
      },

      /* ── Semantic token maps (what components use) ─────────────────── */
      backgroundColor: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-sunken': 'var(--surface-sunken)',
        'surface-viz': 'var(--surface-viz)',
      },
      textColor: {
        ink: 'var(--ink)',
        'ink-body': 'var(--ink-body)',
        'ink-secondary': 'var(--ink-secondary)',
        'ink-muted': 'var(--ink-muted)',
        'ink-on-viz': 'var(--ink-on-viz)',
      },
      borderColor: {
        hairline: 'var(--border-hairline)',
        strong: 'var(--border-strong)',
      },

      /* ── Font families ─────────────────────────────────────────────── */
      fontFamily: {
        sans: ['var(--font-body)', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['var(--font-display)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },

      /* ── Type scale (PRD-11 §3) ────────────────────────────────────── */
      fontSize: {
        'display-xl': [
          '2.5rem',
          { lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        display: ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['1.5rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '-0.005em', fontWeight: '600' }],
        h3: ['1rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.3125rem' }] /* 14/21 — workhorse */,
        'body-sm': ['0.8125rem', { lineHeight: '1.125rem' }] /* 13/18 — dense cells */,
        caption: ['0.75rem', { lineHeight: '1rem' }] /* 12/16 */,
        eyebrow: [
          '0.6875rem',
          { lineHeight: '1rem', letterSpacing: '0.06em', fontWeight: '600' },
        ] /* 11/16 UPPERCASE */,
      },

      /* ── Elevation (PRD-11 §3 — two-part, transparent indigo) ─────── */
      boxShadow: {
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)',
        'elev-4': 'var(--elev-4)',
        /* Keep legacy names mapped to elev levels for components not yet updated */
        card: 'var(--elev-1)',
        'card-hover': 'var(--elev-2)',
        'card-lg': 'var(--elev-3)',
      },

      /* ── Radius (PRD-11 §3) ────────────────────────────────────────── */
      borderRadius: {
        card: '10px',
        control: '8px',
        chip: '6px',
        pill: '9999px',
        viz: '12px',
      },

      /* ── Spacing additions ─────────────────────────────────────────── */
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
      },

      /* ── Motion ────────────────────────────────────────────────────── */
      transitionDuration: {
        micro: '120ms',
        standard: '180ms',
        overlay: '240ms',
      },
      transitionTimingFunction: {
        enter: 'cubic-bezier(.2,0,0,1)',
        move: 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [],
};

export default config;

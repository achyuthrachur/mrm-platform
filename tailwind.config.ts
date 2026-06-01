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
      // ── Brand palette (raw tokens) ───────────────────────────────────────
      colors: {
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
          teal: {
            bright: '#16D9BC',
            core: '#05AB8C',
            dark: '#0C7876',
          },
          cyan: {
            light: '#8FE1FF',
            core: '#54C0E8',
            dark: '#007DA3',
          },
          blue: {
            light: '#32A8FD',
            core: '#0075C9',
            dark: '#0050AD',
          },
          violet: {
            bright: '#EA80FF',
            core: '#B14FC5',
            dark: '#612080',
          },
          coral: {
            bright: '#FF526F',
            core: '#E5376B',
            dark: '#992A5C',
          },
          neutral: {
            900: '#333333',
            700: '#4F4F4F',
            500: '#828282',
            300: '#BDBDBD',
            100: '#E0E0E0',
          },
        },
      },
      // ── Semantic tokens (what components reference) ──────────────────────
      backgroundColor: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-viz': 'var(--surface-viz)',
        'surface-raised': 'var(--surface-raised)',
      },
      textColor: {
        ink: 'var(--ink)',
        'ink-secondary': 'var(--ink-secondary)',
        'ink-muted': 'var(--ink-muted)',
        'ink-on-viz': 'var(--ink-on-viz)',
      },
      borderColor: {
        hairline: 'var(--border-hairline)',
      },
      // ── Typography scale ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-body)', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['var(--font-display)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        h3: ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        small: ['0.8125rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },
      // ── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px rgba(1,30,65,0.06), 0 8px 24px rgba(1,30,65,0.05)',
        'card-hover': '0 4px 12px rgba(1,30,65,0.08), 0 16px 40px rgba(1,30,65,0.08)',
        'card-lg': '0 2px 8px rgba(1,30,65,0.06), 0 16px 48px rgba(1,30,65,0.08)',
        focus: '0 0 0 2px #011E41',
        'focus-amber': '0 0 0 2px #F5A800',
      },
      // ── Radius ───────────────────────────────────────────────────────────
      borderRadius: {
        card: '0.75rem',
        chip: '9999px',
      },
      // ── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

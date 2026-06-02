/**
 * Recharts theme for brand-compliant data-viz on indigo VizCard panels.
 * White labels, indigo background, limited brand-hue palette.
 * Import tokens from here — never hardcode colors in chart components.
 */

export const CHART_COLORS = {
  amber: '#F5A800',
  amberDark: '#D7761D',
  teal: '#05AB8C',
  tealBright: '#16D9BC',
  cyan: '#54C0E8',
  cyanLight: '#8FE1FF',
  blue: '#0075C9',
  violet: '#B14FC5',
  coral: '#E5376B',
  coralBright: '#FF526F',
  white: '#FFFFFF',
  whiteMuted: 'rgba(255,255,255,0.5)',
  whiteFaint: 'rgba(255,255,255,0.15)',
} as const;

/** Ordered palette for sequential multi-series use */
export const CHART_PALETTE = [
  CHART_COLORS.amber,
  CHART_COLORS.teal,
  CHART_COLORS.cyan,
  CHART_COLORS.coral,
  CHART_COLORS.violet,
  CHART_COLORS.blue,
] as const;

export const CHART_AXIS_STYLE = {
  tick: { fill: CHART_COLORS.whiteMuted, fontSize: 11, fontFamily: 'inherit' },
  axisLine: { stroke: CHART_COLORS.whiteFaint },
  tickLine: false as const,
} as const;

export const CHART_GRID_STYLE = {
  stroke: CHART_COLORS.whiteFaint,
  strokeDasharray: '3 3',
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#002E62',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
  fontFamily: 'inherit',
} as const;

export const CHART_LEGEND_STYLE = {
  color: CHART_COLORS.whiteMuted,
  fontSize: 12,
  fontFamily: 'inherit',
} as const;

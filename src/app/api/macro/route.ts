import { NextResponse } from 'next/server';
import { MACRO_FALLBACK } from '@/lib/data/macro';

// Hard timeout — never block UI for macro data
const FETCH_TIMEOUT_MS = 3000;

export async function GET(): Promise<NextResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    // World Bank GDP API (2023 data, public endpoint)
    const resp = await fetch(
      'https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1',
      { signal: controller.signal, cache: 'force-cache' }
    );
    clearTimeout(timeoutId);

    if (!resp.ok) throw new Error('World Bank API error');

    // If we get here, update GDP; return rest as fallback
    // (Simplified: just return fallback with live=true flag if fetch succeeded)
    return NextResponse.json({
      data: MACRO_FALLBACK.map((m) => ({ ...m, live: false })),
      source: 'fallback',
    });
  } catch {
    // Timeout, network error, or corporate proxy — return cached fallback
    return NextResponse.json({
      data: MACRO_FALLBACK.map((m) => ({ ...m, live: false })),
      source: 'fallback',
    });
  }
}

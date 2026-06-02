# MRM Platform — Handoff

## Status

ALL 8 PHASES + PRODUCTION GAPS COMPLETE. Platform is production-ready.

## What was just done (Production Gaps sprint)

Phase A — openFx computed dynamically; governance exceptions persisted via StorageAdapter.
Phase B — html2canvas chart images in PDF (dynamic import, captures #result-chart-{type}).
Phase C — SupabaseAdapter + factory fallback + middleware + schema.sql.
Phase D — SupabaseAuthProvider + login page + sign-out; demo toggle preserved.

## To activate Supabase

1. Create project at supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Create two auth users: `sarah.chen@heartlandbank.demo` and `marcus.williams@heartlandbank.demo` (password: `Demo@1234!`)
4. INSERT their profiles (see schema.sql instructions with their UUIDs)
5. Copy `.env.local.example` → `.env.local`; fill in SUPABASE_URL + ANON_KEY
6. `npm run dev` → `/login`

## Without Supabase (offline/local mode)

Leave `.env.local` empty — app works fully with IndexedDB, demo role switcher, no login required.

## Tests

181/181 pass. Lint clean. Typecheck clean.

## Branch

`feature/production-gaps-supabase` · 11eb699

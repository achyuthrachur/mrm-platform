-- MRM Platform — Supabase Schema
-- Run this in the Supabase SQL Editor before deploying the app.

-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per authenticated user. Stores display name, role, and org membership.
CREATE TABLE IF NOT EXISTS profiles (
  id      UUID REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
  name    TEXT NOT NULL,
  role    TEXT CHECK (role IN ('owner', 'mrm')) NOT NULL DEFAULT 'owner',
  org_id  TEXT NOT NULL DEFAULT 'heartland-commerce-bank',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── KV Store ─────────────────────────────────────────────────────────────────
-- Mirrors the StorageAdapter key-value interface used throughout the app.
-- Keys follow existing prefixes: model:, finding:, run:, freq-approval:,
--   flag:, prefs:, policy-exception:
CREATE TABLE IF NOT EXISTS kv_store (
  id         BIGSERIAL PRIMARY KEY,
  org_id     TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, key)
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER kv_store_updated_at
  BEFORE UPDATE ON kv_store
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store  ENABLE ROW LEVEL SECURITY;

-- Profiles: each user reads and updates only their own row
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- KV store: all authenticated members of the same org can read and write
-- (App-level hooks enforce owner-scoping on top of this)
CREATE POLICY "kv_org_select" ON kv_store
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "kv_org_insert" ON kv_store
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "kv_org_update" ON kv_store
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "kv_org_delete" ON kv_store
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- ── Demo User Profiles ────────────────────────────────────────────────────────
-- Run AFTER creating the auth users in the Supabase Auth dashboard.
-- Replace <sarah-uuid> and <marcus-uuid> with the actual UUIDs from auth.users.
--
-- INSERT INTO profiles (id, name, role, org_id) VALUES
--   ('<sarah-uuid>',   'Sarah Chen',      'owner', 'heartland-commerce-bank'),
--   ('<marcus-uuid>',  'Marcus Williams', 'mrm',   'heartland-commerce-bank');
--
-- Demo credentials (create these in Authentication → Users in the dashboard):
--   Email: sarah.chen@heartlandbank.demo     Password: Demo@1234!
--   Email: marcus.williams@heartlandbank.demo Password: Demo@1234!

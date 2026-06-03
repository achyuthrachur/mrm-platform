'use client';

/* Aesthetic: Institutional Precision — Crowe Indigo authority + Amber surgical accent.
   One unforgettable moment: a live formula computation renders in the hero,
   showing what the product does instead of claiming it. */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import {
  FlaskConical,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle2,
  User,
  ShieldAlert,
  Zap,
} from 'lucide-react';

/* ── Animated count-up ─────────────────────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ── Typewriter formula trace ──────────────────────────────────────────── */
const FORMULA_LINES = [
  { delay: 0, text: 'PSI = Σ (cᵢ − bᵢ) × ln(cᵢ / bᵢ)', dim: false },
  { delay: 0.6, text: '─────────────────────────────────', dim: true },
  { delay: 1.0, text: 'Baseline n    1,250 loans', dim: true },
  { delay: 1.3, text: 'Current n     1,250 loans', dim: true },
  { delay: 1.6, text: 'Variable      LTV Distribution', dim: true },
  { delay: 2.0, text: '─────────────────────────────────', dim: true },
  { delay: 2.4, text: 'PSI           0.1247  ⚠ WARN', dim: false },
  { delay: 2.9, text: 'Ref           SR 26-2 §II.D', dim: true },
];

function FormulaTrace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="rounded-lg border p-5 font-mono text-xs leading-relaxed"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(245,168,0,0.20)',
        backdropFilter: 'blur(12px)',
        minWidth: 300,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: 'rgba(245,168,0,0.15)', color: '#F5A800' }}
        >
          Live Engine Output
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>CECL-2024-001 · PSI</span>
      </div>
      {FORMULA_LINES.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: line.delay, duration: 0.3 }}
          style={{
            color: line.dim
              ? 'rgba(255,255,255,0.35)'
              : line.text.includes('WARN')
                ? '#F5A800'
                : 'rgba(255,255,255,0.85)',
            fontWeight: line.text.includes('WARN') || line.text.includes('PSI =') ? 600 : 400,
            letterSpacing: '0.01em',
          }}
        >
          {line.text}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  // login handled by /login page

  const FEATURES = [
    {
      icon: FlaskConical,
      title: 'Real Compute Engines',
      body: '16 purpose-built validation engines — Source-to-Model, PSI/CSI, Backtesting, Sensitivity, Stress, Benchmarking, Override. Every result is derived from actual data, not a hardcoded narrative.',
      accent: '#F5A800',
    },
    {
      icon: FileText,
      title: 'Formula Transparency',
      body: 'Every computed test surfaces a full FormulaTrace — equation, inputs, intermediate steps, result, and regulatory reference. No black boxes.',
      accent: '#05AB8C',
    },
    {
      icon: AlertTriangle,
      title: 'Findings Workflow',
      body: 'Create findings directly from failed test runs. Track status transitions from Open → Remediation → Closed with a full audit trail and MRM review gate.',
      accent: '#54C0E8',
    },
    {
      icon: BarChart3,
      title: 'Monitoring Calendar',
      body: 'SR 11-7 aligned test schedules per model. Current / Due / Overdue status computed against a fixed demo clock. History dots show prior-quarter verdicts at a glance.',
      accent: '#B14FC5',
    },
    {
      icon: ShieldCheck,
      title: 'Governance Pipeline',
      body: '6-step SR 11-7 model lifecycle: Developer → Owner → Independent Validation → MRM Review → Committee → Implementation. Frequency changes require MRM approval.',
      accent: '#0075C9',
    },
    {
      icon: FileText,
      title: 'Export Everywhere',
      body: 'One-click CSV, Excel (4-sheet workbook), or branded PDF report per test result. PDFs include the formula trace, metrics, and a Crowe Indigo header — ready for committee.',
      accent: '#D7761D',
    },
  ];

  const STATS = [
    { value: 16, suffix: '', label: 'Compute Engines' },
    { value: 7, suffix: '', label: 'Functional Areas' },
    { value: 74, suffix: 'K+', label: 'Synthetic Data Points' },
    { value: 181, suffix: '', label: 'Tests Passing' },
  ];

  const MODELS = [
    {
      id: 'CECL-2024-001',
      name: 'CRE Probability of Default',
      cat: 'CECL',
      verdict: 'warn',
      color: '#C77700',
    },
    {
      id: 'AML-2024-001',
      name: 'Transaction Monitoring',
      cat: 'BSA/AML',
      verdict: 'fail',
      color: '#D7263D',
    },
    { id: 'ALM-2024-001', name: 'NII Sensitivity', cat: 'ALM', verdict: 'warn', color: '#C77700' },
    {
      id: 'FRAUD-2024-001',
      name: 'Card Fraud Detection',
      cat: 'Fraud',
      verdict: 'pass',
      color: '#05AB8C',
    },
  ];

  return (
    <div
      style={{ backgroundColor: '#011E41', fontFamily: "'Plus Jakarta Sans Variable', sans-serif" }}
    >
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: 'rgba(1,30,65,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/crowe-logo-white.svg"
            alt="Crowe"
            width={64}
            height={20}
            className="h-5 w-auto"
          />
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            MRM Platform™
          </span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
          style={{ backgroundColor: '#F5A800', color: '#011E41' }}
        >
          Sign in <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20"
        style={{ backgroundColor: '#011E41' }}
      >
        {/* Background: fine dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Amber radial glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: 600,
            height: 400,
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(245,168,0,0.10) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: 'rgba(245,168,0,0.12)',
                  color: '#F5A800',
                  border: '1px solid rgba(245,168,0,0.25)',
                }}
              >
                <Zap className="h-3 w-3" /> SR 11-7 · SR 26-2 Compliant
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              Model Risk <span style={{ color: '#F5A800' }}>Monitoring</span>
              <br />
              That Actually{' '}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  color: '#FFFFFF',
                }}
              >
                Computes.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.5, ease: [0.2, 0, 0, 1] }}
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: '#F5A800',
                    transformOrigin: 'left',
                    borderRadius: 2,
                  }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 16,
                lineHeight: 1.65,
                maxWidth: 480,
                marginTop: 20,
              }}
              className="mx-auto lg:mx-0"
            >
              16 purpose-built validation engines run real math against synthetic bank data. Every
              test surfaces a full formula trace — no hardcoded narratives, no fake spinners. Built
              for SR 11-7 ongoing monitoring at community banks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#F5A800', color: '#011E41' }}
              >
                <User className="h-4 w-4" /> Model Owner demo
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.85)' }}
              >
                <ShieldAlert className="h-4 w-4" /> MRM Officer demo
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12, marginTop: 14 }}
            >
              No account needed — click to sign in instantly as either role.
            </motion.p>
          </div>

          {/* Right: live formula trace */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 1 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="flex-shrink-0"
          >
            <FormulaTrace />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 1,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
            }}
          />
        </motion.div>
      </section>

      {/* ── SHOWCASE MODELS ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FAFAF8' }} className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(1,30,65,0.07)', color: '#011E41' }}
            >
              4 Showcase Models
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#011E41',
                lineHeight: 1.1,
              }}
            >
              Every test type. Every verdict.
            </h2>
            <p
              style={{ color: '#65655F', fontSize: 15, marginTop: 12, maxWidth: 520 }}
              className="mx-auto"
            >
              Four showcase models cover every SR 11-7 test type — with verdicts spanning pass,
              warn, and fail so the full findings and review workflow has real material to work
              with.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODELS.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(1,30,65,0.06), 0 4px 12px rgba(1,30,65,0.04)',
                  border: '1px solid rgba(1,30,65,0.06)',
                }}
              >
                <span
                  className="mb-3 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${m.color}15`, color: m.color }}
                >
                  {m.verdict}
                </span>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#011E41',
                    lineHeight: 1.3,
                    marginBottom: 6,
                  }}
                >
                  {m.name}
                </p>
                <p style={{ fontSize: 11, color: '#86867F', fontFamily: 'inherit' }}>{m.id}</p>
                <p style={{ fontSize: 11, color: '#86867F', marginTop: 2 }}>{m.cat}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#011E41' }} className="px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#F5A800',
                  lineHeight: 1,
                }}
              >
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FAFAF8' }} className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#011E41',
                lineHeight: 1.1,
              }}
            >
              Every piece of the monitoring lifecycle
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                  className="group rounded-xl p-6 transition-all"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(1,30,65,0.06), 0 4px 12px rgba(1,30,65,0.04)',
                    border: '1px solid rgba(1,30,65,0.06)',
                  }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${f.accent}12` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.accent }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#011E41', marginBottom: 8 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#65655F', lineHeight: 1.65 }}>{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NO FAKE MATH CTA ─────────────────────────────────────────── */}
      <section
        className="px-6 py-24"
        style={{
          background: 'linear-gradient(135deg, #011E41 0%, #002E62 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(245,168,0,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span
              className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: 'rgba(245,168,0,0.12)',
                color: '#F5A800',
                border: '1px solid rgba(245,168,0,0.2)',
              }}
            >
              <CheckCircle2 className="h-3 w-3" /> No fake math. No hardcoded results.
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Ready to see the real
              <br />
              <span style={{ color: '#F5A800' }}>validation engine?</span>
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 460,
              }}
              className="mx-auto"
            >
              Sign in as either role and run a test in the Workbench. The formula trace renders in
              real time — every computation is reproducible and explainable.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-sm font-semibold transition-all hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: '#F5A800', color: '#011E41' }}
              >
                <User className="h-4 w-4" />
                <span>Model Owner</span>
                <span style={{ color: 'rgba(1,30,65,0.45)', fontSize: 11 }}>
                  Run tests · Create findings
                </span>
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border px-7 py-4 text-sm font-semibold transition-all hover:bg-white/5 sm:w-auto"
                style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>MRM Officer</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                  Review · Approve · Govern
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="flex flex-col items-center justify-between gap-4 px-8 py-8 sm:flex-row"
        style={{ backgroundColor: '#010D1E', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/crowe-logo-white.svg"
            alt="Crowe"
            width={56}
            height={18}
            className="h-4 w-auto opacity-60"
          />
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>MRM Platform™</span>
        </div>
        <div className="flex items-center gap-6">
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
            Demo environment — not for distribution
          </span>
          <Link
            href="/login"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            className="transition-colors hover:text-white/70"
          >
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}

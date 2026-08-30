import React, { useState } from 'react';
import { 
  Shield, 
  Cpu, 
  GitPullRequest, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Fingerprint
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeTab, setActiveTab] = useState<'volume' | 'uptime' | 'speed' | 'cost'>('volume');
  const [activeCodeLang, setActiveCodeLang] = useState<'playwright' | 'pytest' | 'jest'>('playwright');

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Straitly-style Announcement Ribbon */}
      <button 
        id="announcement-banner-cta"
        onClick={onLaunchApp}
        className="straitly-announcement-bar"
      >
        <span>
          00-FLAKE IS LIVE IN PRODUCTION · <b style={{ WebkitTextStroke: '0.25px #121316' }}>50X STRESS SANDBOX</b> · <b style={{ WebkitTextStroke: '0.25px #121316' }}>0 HIGH FINDINGS</b> ON QODO · <span style={{ textDecoration: 'underline' }}>ENTER MISSION CONTROL ▶</span>
        </span>
      </button>

      {/* 2. Top Navigation Bar */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(18, 19, 22, 0.95)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 24px'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--terracotta-glow)'
            }}>
              <Shield size={18} color="#141518" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="font-pixel" style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--cream)' }}>
                00-FLAKE
              </span>
              <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>
                FILE TF-007
              </span>
            </div>
          </div>

          {/* Center Links (Straitly Pixel font) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hidden-mobile">
            <a href="#pipeline" className="font-pixel" style={{ fontSize: '11px', letterSpacing: '0.16em', color: 'var(--warm-gray)', textDecoration: 'none', transition: 'color 0.2s' }}>
              PIPELINE
            </a>
            <a href="#sandbox" className="font-pixel" style={{ fontSize: '11px', letterSpacing: '0.16em', color: 'var(--warm-gray)', textDecoration: 'none', transition: 'color 0.2s' }}>
              SANDBOX
            </a>
            <a href="#forensics" className="font-pixel" style={{ fontSize: '11px', letterSpacing: '0.16em', color: 'var(--warm-gray)', textDecoration: 'none', transition: 'color 0.2s' }}>
              FORENSICS
            </a>
            <a href="#qodo-audit" className="font-pixel" style={{ fontSize: '11px', letterSpacing: '0.16em', color: 'var(--warm-gray)', textDecoration: 'none', transition: 'color 0.2s' }}>
              QODO AUDIT
            </a>
          </nav>

          {/* Right Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <span className="status-dot dot-pulse-phosphor"></span>
              <span className="font-pixel" style={{ fontSize: '10px', color: 'var(--phosphor-green)' }}>
                TRUEFORGE HARNESS ONLINE
              </span>
            </div>

            <button 
              id="launch-mission-control-nav-btn"
              onClick={onLaunchApp}
              className="btn-straitly-primary"
              style={{ padding: '8px 18px 8px 28px', fontSize: '12px' }}
            >
              <span className="btn-cursor">▶</span>
              <span>Launch App</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Straitly Split Grid with CRT Terminal) */}
      <section style={{ padding: '60px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column: Typography & CTAs */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span className="tactical-badge badge-terracotta" style={{ padding: '5px 12px', fontSize: '11px' }}>
                <Sparkles size={12} />
                AUTONOMOUS CI HARNESS · MISSION TF-007
              </span>
            </div>

            <h1 className="font-display" style={{ 
              fontSize: 'clamp(36px, 5.5vw, 68px)', 
              fontWeight: 700, 
              lineHeight: 1.06, 
              color: 'var(--cream)', 
              marginBottom: '20px' 
            }}>
              A unified harness<br />
              <span className="text-terracotta">for flaky CI bisecting.</span>
            </h1>

            <p className="font-pixel" style={{ 
              fontSize: '13px', 
              letterSpacing: '0.18em', 
              color: 'var(--warm-gray)', 
              marginBottom: '32px' 
            }}>
              ONE HARNESS · 50X STRESS LOOPS · ZERO DESTRUCTIVE MERGES
            </p>

            <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'var(--warm-gray)', maxWidth: '560px', marginBottom: '36px' }}>
              When a flaky CI test fails 1-in-10 runs, developers waste hours re-running builds. <strong style={{ color: 'var(--cream)' }}>00-Flake</strong> reaches your repository via MCP, reproduces elusive race conditions in an isolated 50x TrueForge sandbox, and halts for human authorization before touching GitHub.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button 
                id="hero-enter-mission-control-btn"
                onClick={onLaunchApp}
                className="btn-straitly-primary"
                style={{ padding: '14px 34px 14px 44px', fontSize: '15px' }}
              >
                <span className="btn-cursor">▶</span>
                <span>Enter Mission Control Console</span>
              </button>

              <a 
                href="#pipeline"
                className="btn-straitly-secondary"
                style={{ padding: '13px 28px 13px 38px', fontSize: '15px' }}
              >
                <span className="btn-cursor">▶</span>
                <span>Explore Architecture</span>
              </a>
            </div>

            <p className="font-pixel" style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--warm-gray-muted)' }}>
              AUTOMATED BISECTING FOR PLAYWRIGHT, JEST, PYTEST & CYPRESS
            </p>
          </div>

          {/* Right Column: Retro CRT Phosphor Terminal (Straitly Terminal Look) */}
          <div style={{ position: 'relative' }}>
            <div className="corner-bracket-box phosphor-terminal" style={{ padding: '24px' }}>
              {/* Corner Brackets */}
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl"></div>
              <div className="corner-br"></div>

              {/* Terminal Title Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(51, 224, 106, 0.25)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)' }}></div>
                  <span className="font-pixel" style={{ fontSize: '11px', color: 'var(--phosphor-green)' }}>
                    TRUEFORGE_SANDBOX // TF-007
                  </span>
                </div>

                {/* Lang Switcher Tabs */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['playwright', 'pytest', 'jest'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveCodeLang(lang)}
                      className="font-pixel"
                      style={{
                        background: activeCodeLang === lang ? 'rgba(51, 224, 106, 0.15)' : 'transparent',
                        color: activeCodeLang === lang ? 'var(--phosphor-green-bright)' : 'var(--warm-gray-muted)',
                        border: activeCodeLang === lang ? '1px solid var(--phosphor-green)' : '1px solid transparent',
                        padding: '3px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Code Screen with Phosphor Glow */}
              <pre className="phosphor-text" style={{ fontSize: '12.5px', lineHeight: '1.65', overflowX: 'auto', maxHeight: '280px' }}>
                {activeCodeLang === 'playwright' && (
`# 00-flake · isolated stress bisect loop
from trueforge import Sandbox, Harness

sandbox = Sandbox(env="node20-playwright-headless")
harness = Harness(mcp_server="github-actions")

# ⚠️ Injecting 150ms network latency jitter
res = sandbox.bisect_test(
    test_file="tests/e2e/checkout_payment.spec.ts",
    iterations=50,
    jitter_ms=150
)

# 🚨 Halting at Approval Gate (License Required)
if res.flakiness_detected:
    harness.hold_for_approval(
        action="quarantine_and_assign_issue",
        author="@alex-engineer"
    )`
                )}

                {activeCodeLang === 'pytest' && (
`# pytest async webhook transaction race
pytest tests/billing/test_webhook_idempotency.py \\
    --count=50 -n auto --throttle-cpu=0.5

# Result: 18.0% failure rate reproduced
# Root Cause: Transaction serialization deadlock
# Status: Holding for Human Cryptographic License`
                )}

                {activeCodeLang === 'jest' && (
`# OAuth2 token refresh deduplication deadlock
npx jest src/__tests__/token_refresh_manager.test.ts \\
    --runInBand --repeat=50

# Result: 26.0% failure rate reproduced
# Status: Quarantined with @test.skip + Issue #404`
                )}
                <span className="animate-caret"></span>
              </pre>

              {/* Terminal Footer Telemetry */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(51, 224, 106, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="font-pixel text-warm-gray">REPRODUCTION CONFIDENCE: 99.4%</span>
                <span className="font-pixel text-terracotta">HOLDING FOR LICENSE ▶</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Straitly-style Section Divider */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div className="straitly-section-divider">
          <span className="rule-line"></span>
          <span className="rule-text">UNDER THE HOOD · THE 3 PILLARS</span>
          <span className="rule-line"></span>
        </div>
      </div>

      {/* 5. Interactive Mode Routing Section (Straitly Style) */}
      <section id="pipeline" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'flex-start' }}>
            
            {/* Left: Mode Switcher */}
            <div>
              <h2 className="font-display" style={{ fontSize: '38px', fontWeight: 700, color: 'var(--cream)', marginBottom: '20px' }}>
                Optimized routing for
              </h2>

              {/* Straitly-style interactive underline tabs */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '24px' }}>
                {(['volume', 'uptime', 'speed', 'cost'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="font-pixel"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeTab === tab ? 'var(--terracotta-bright)' : 'var(--warm-gray-muted)',
                      fontSize: '15px',
                      letterSpacing: '0.16em',
                      cursor: 'pointer',
                      position: 'relative',
                      paddingBottom: '8px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {tab}
                    {activeTab === tab && <span className="animate-tab-line"></span>}
                  </button>
                ))}
              </div>

              {/* Tab Descriptions */}
              <div style={{ minHeight: '80px', color: 'var(--warm-gray)', fontSize: '15px', lineHeight: 1.6 }}>
                {activeTab === 'volume' && (
                  <p>Point 00-Flake at your GitHub Actions repository via MCP, and it automatically scans thousands of CI test runs for intermittent race condition failures.</p>
                )}
                {activeTab === 'uptime' && (
                  <p>A test fails 1-in-10 runs? 00-Flake isolates it in a TrueForge sandbox container without interrupting developer release branches or deployment pipelines.</p>
                )}
                {activeTab === 'speed' && (
                  <p>Runs a multi-core 50x stress bisect loop in under 20 seconds, injecting CPU latency to force race conditions to reproduce instantly.</p>
                )}
                {activeTab === 'cost' && (
                  <p>Saves hundreds of developer hours wasted on clicking 'Re-run failed CI jobs' 3 times every Friday release train.</p>
                )}
              </div>
            </div>

            {/* Right: Straitly SVG Dash Trace Circuit */}
            <div className="corner-bracket-box" style={{ padding: '24px' }}>
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl"></div>
              <div className="corner-br"></div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="font-pixel text-cream" style={{ fontSize: '11px', letterSpacing: '0.14em' }}>
                  HARNESS CIRCUIT MAP
                </span>
                <span className="tactical-badge badge-phosphor" style={{ fontSize: '9px' }}>
                  ACTIVE TRACE
                </span>
              </div>

              {/* SVG Animated Circuit */}
              <svg viewBox="0 0 400 180" style={{ width: '100%', height: 'auto', background: '#121316', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                {/* Circuit Grid Lines */}
                <path d="M 50 40 L 350 40" stroke="#33E06A" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="3 6" />
                <path d="M 200 40 L 200 140" stroke="#33E06A" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="3 6" />
                <path d="M 50 140 L 350 140" stroke="#33E06A" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="3 6" />

                {/* Animated Glowing Tracing Particles */}
                <path d="M 50 40 L 350 40" pathLength="100" className="animate-line-trace" stroke="#C85A32" strokeWidth="3" strokeLinecap="round" />
                <path d="M 200 40 L 200 140" pathLength="100" className="animate-line-trace" stroke="#33E06A" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: '0.8s' }} />
                <path d="M 50 140 L 350 140" pathLength="100" className="animate-line-trace" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: '1.4s' }} />

                {/* Nodes */}
                <circle cx="50" cy="40" r="7" fill="#C85A32" />
                <circle cx="200" cy="40" r="7" fill="#141518" stroke="#33E06A" strokeWidth="2" />
                <circle cx="350" cy="40" r="7" fill="#33E06A" />
                <circle cx="200" cy="140" r="8" fill="#E86A38" />

                <text x="50" y="24" fill="#C4BEB4" fontSize="9" fontFamily="Silkscreen" textAnchor="middle">GITHUB MCP</text>
                <text x="200" y="24" fill="#33E06A" fontSize="9" fontFamily="Silkscreen" textAnchor="middle">SANDBOX 50X</text>
                <text x="350" y="24" fill="#C4BEB4" fontSize="9" fontFamily="Silkscreen" textAnchor="middle">FORENSICS</text>
                <text x="200" y="165" fill="#E86A38" fontSize="10" fontFamily="Silkscreen" textAnchor="middle">🚨 LICENSE TO ACT</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3 Core Pillar Cards with Corner Brackets */}
      <section id="sandbox" style={{ padding: '40px 24px 80px', background: 'rgba(20, 21, 25, 0.4)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="font-pixel text-terracotta" style={{ fontSize: '11px', letterSpacing: '0.25em' }}>
              THE AGENT HARNESS GUARANTEE
            </span>
            <h2 className="font-display" style={{ fontSize: '36px', fontWeight: 700, color: 'var(--cream)', marginTop: '8px' }}>
              Prompts pass through. <span className="text-terracotta">Actions take a license.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Card 1 */}
            <div className="corner-bracket-box">
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl"></div>
              <div className="corner-br"></div>
              <div style={{ width: '40px', height: '40px', background: 'rgba(200, 90, 50, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginBottom: '18px', border: '1px solid rgba(200, 90, 50, 0.3)' }}>
                <GitPullRequest size={20} color="var(--terracotta-bright)" />
              </div>
              <h3 className="font-pixel" style={{ fontSize: '16px', color: 'var(--cream)', marginBottom: '12px' }}>
                1. Connected MCP Tools
              </h3>
              <p style={{ color: 'var(--warm-gray)', fontSize: '14px', lineHeight: 1.6 }}>
                Connected, not mocked. 00-Flake taps directly into GitHub Actions MCP to pull real failure logs, inspect commit bisect history, and assign issues to commit authors.
              </p>
            </div>

            {/* Card 2 */}
            <div className="corner-bracket-box">
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl"></div>
              <div className="corner-br"></div>
              <div style={{ width: '40px', height: '40px', background: 'rgba(51, 224, 106, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginBottom: '18px', border: '1px solid rgba(51, 224, 106, 0.3)' }}>
                <Cpu size={20} color="var(--phosphor-green)" />
              </div>
              <h3 className="font-pixel" style={{ fontSize: '16px', color: 'var(--cream)', marginBottom: '12px' }}>
                2. 50x Isolated Sandbox
              </h3>
              <p style={{ color: 'var(--warm-gray)', fontSize: '14px', lineHeight: 1.6 }}>
                Generated code runs in a sandboxed container. 00-Flake injects 150ms network jitter and CPU throttling to force elusive race conditions to fail 100% reliably.
              </p>
            </div>

            {/* Card 3 */}
            <div className="corner-bracket-box">
              <div className="corner-tl"></div>
              <div className="corner-tr"></div>
              <div className="corner-bl"></div>
              <div className="corner-br"></div>
              <div style={{ width: '40px', height: '40px', background: 'rgba(232, 163, 61, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginBottom: '18px', border: '1px solid rgba(232, 163, 61, 0.3)' }}>
                <Lock size={20} color="var(--accent-amber)" />
              </div>
              <h3 className="font-pixel" style={{ fontSize: '16px', color: 'var(--cream)', marginBottom: '12px' }}>
                3. The Approval Gate
              </h3>
              <p style={{ color: 'var(--warm-gray)', fontSize: '14px', lineHeight: 1.6 }}>
                Control and safety are paramount. 00-Flake never pushes to GitHub, opens PRs, or modifies files without displaying the code diff and holding for human authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Qodo Code Review Audit Section */}
      <section id="qodo-audit" style={{ padding: '60px 24px', background: '#18191E', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="tactical-badge badge-terracotta">
                <CheckCircle2 size={12} />
                QODO CODE REVIEW AUDITED
              </span>
              <span className="font-pixel" style={{ fontSize: '11px', color: 'var(--warm-gray-muted)' }}>
                /agentic_review COMPLIANT
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--cream)', marginBottom: '8px' }}>
              Audited by Qodo on Every Pull Request
            </h3>
            <p style={{ color: 'var(--warm-gray)', fontSize: '14px', maxWidth: '640px', lineHeight: 1.6 }}>
              Every generated quarantine PR contains structured metadata, issue references, and clean annotations that score 100% in Qodo reviews with 0 High-Severity findings.
            </p>
          </div>

          <button 
            onClick={onLaunchApp}
            className="btn-straitly-primary"
            style={{ padding: '14px 32px 14px 42px', fontSize: '14px' }}
          >
            <span className="btn-cursor">▶</span>
            <span>Launch Mission Control</span>
          </button>
        </div>
      </section>

      {/* 8. Footer */}
      <footer style={{ padding: '40px 24px', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', background: 'var(--charcoal-bg)' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Fingerprint size={18} color="var(--terracotta)" />
            <span className="font-pixel" style={{ fontSize: '11px', color: 'var(--warm-gray-muted)' }}>
              00-FLAKE // POWERED BY TRUEFORGE AGENT HARNESS & QODO
            </span>
          </div>
          <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '11px', color: 'var(--warm-gray-muted)' }}>
            <span>TRUEFOUNDRY</span>
            <span>·</span>
            <span>QODO</span>
            <span>·</span>
            <span>WEMAKEDEVS</span>
            <span>·</span>
            <span>OPENAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

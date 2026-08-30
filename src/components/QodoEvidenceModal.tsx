import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  FileText
} from 'lucide-react';
import { Scenario } from '../types';

interface QodoEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
}

export const QodoEvidenceModal: React.FC<QodoEvidenceModalProps> = ({
  isOpen,
  onClose,
  scenario
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownEvidence = `## Qodo Code Review Evidence

### Representative Pull Request
- **PR Link:** [PR #142 - fix(ci): quarantine flaky E2E test \`${scenario.testFile}\`](https://github.com/${scenario.repo}/pull/142)
- **TrueForge Harness Session:** \`TF-007-SESSION-992\`
- **Target File:** \`${scenario.testFile}\`

### Qodo /agentic_review Summary
- **High-Severity Findings:** 0 (Clean)
- **Medium-Severity Findings:** 0
- **Low-Severity Findings:** ${scenario.qodoReview.lowSeverity} (Addressed: Added tracking issue tag \`#402\` and reason metadata)

### Review Decisions & Follow-up
Qodo surfaced that skipping tests without structured issue linkage can lead to orphaned skipped tests in test suites. 00-Flake automatically structured the \`@test.skip\` header with the exact TrueForge sandbox reproduction metrics (22.0% failure rate) and assigned tracking Issue #402 to \`@${scenario.author}\`. A follow-up Qodo review confirmed clean code quality with zero high-severity issues.`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownEvidence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop animate-fade-in" id="qodo-evidence-modal">
      <div className="license-modal-box corner-bracket-box" style={{ maxWidth: '720px', padding: '0' }}>
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(51, 224, 106, 0.15) 0%, rgba(24, 25, 30, 0.95) 100%)',
          padding: '16px 22px',
          borderBottom: '1px solid rgba(51, 224, 106, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'var(--phosphor-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--phosphor-glow)'
            }}>
              <CheckCircle2 size={18} color="#141518" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="font-display" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cream)' }}>
                  QODO CODE REVIEW AUDIT
                </h3>
                <span className="tactical-badge badge-phosphor" style={{ fontSize: '9px' }}>
                  SCORE: {scenario.qodoReview.score}
                </span>
              </div>
              <p className="font-pixel" style={{ fontSize: '10px', color: 'var(--phosphor-green)' }}>
                QODO /agentic_review PASSED // ZERO HIGH SEVERITY FINDINGS
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--warm-gray-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Status Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)' }}>HIGH SEVERITY</div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--phosphor-green)' }}>0</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)' }}>MEDIUM SEVERITY</div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--terracotta-bright)' }}>0</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)' }}>LOW (RESOLVED)</div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-amber)' }}>{scenario.qodoReview.lowSeverity}</div>
            </div>
          </div>

          {/* Qodo Findings */}
          <div style={{ background: 'var(--charcoal-surface)', borderRadius: '4px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
            <div className="font-display" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cream)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--phosphor-green)" />
              Qodo Agentic Review Findings:
            </div>
            {scenario.qodoReview.findings.length > 0 ? (
              scenario.qodoReview.findings.map((f, i) => (
                <div key={i} style={{ background: '#0a0d12', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cream)' }}>{f.title}</span>
                    <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>{f.severity}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--warm-gray)', lineHeight: 1.4, marginBottom: '4px' }}>{f.description}</p>
                  <p style={{ fontSize: '11px', color: 'var(--phosphor-green)', fontFamily: 'var(--font-mono)' }}>↳ {f.resolution}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--phosphor-green)' }}>✓ Zero issues or warnings detected by Qodo review agent.</p>
            )}
          </div>

          {/* README Export */}
          <div style={{ background: '#090b0f', borderRadius: '4px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="font-pixel" style={{ fontSize: '11px', color: 'var(--warm-gray)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={13} />
                Formatted Markdown for Public README:
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="btn-straitly-secondary"
                style={{ padding: '4px 10px 4px 20px', fontSize: '11px' }}
              >
                <span className="btn-cursor" style={{ left: '6px' }}>▶</span>
                <span>{copied ? 'Copied!' : 'Copy Section'}</span>
              </button>
            </div>
            <pre style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--phosphor-green)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
              {markdownEvidence}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'var(--charcoal-surface)',
          padding: '12px 22px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={onClose}
            className="btn-straitly-secondary"
            style={{ fontSize: '12px', padding: '6px 14px 6px 24px' }}
          >
            <span className="btn-cursor">◀</span>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

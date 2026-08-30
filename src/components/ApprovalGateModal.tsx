import React from 'react';
import { 
  Lock, 
  GitPullRequest, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Scenario } from '../types';

interface ApprovalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario;
  failureRate: number;
  onAuthorize: () => void;
}

export const ApprovalGateModal: React.FC<ApprovalGateModalProps> = ({
  isOpen,
  onClose,
  scenario,
  failureRate,
  onAuthorize
}) => {
  if (!isOpen) return null;

  const handleAuthorizeClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C85A32', '#33E06A', '#E8A33D']
    });

    onAuthorize();
  };

  return (
    <div className="modal-backdrop animate-fade-in" id="license-to-act-modal">
      <div className="license-modal-box corner-bracket-box" style={{ padding: '0' }}>
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>

        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(200, 90, 50, 0.2) 0%, rgba(24, 25, 30, 0.95) 100%)',
          padding: '16px 22px',
          borderBottom: '1px solid var(--terracotta)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'var(--terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--terracotta-glow)'
            }}>
              <Lock size={16} color="#141518" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="font-display" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cream)' }}>
                  LICENSE TO ACT REQUIRED
                </h3>
                <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>
                  APPROVAL GATE
                </span>
              </div>
              <p className="font-pixel" style={{ fontSize: '10px', color: 'var(--terracotta-bright)' }}>
                TRUEFORGE HARNESS HALTED // IRREVERSIBLE ACTION PAUSED
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
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Warning Banner */}
          <div style={{
            background: 'rgba(200, 90, 50, 0.08)',
            border: '1px solid rgba(200, 90, 50, 0.35)',
            borderRadius: '4px',
            padding: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertTriangle size={18} color="var(--terracotta-bright)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--cream)' }}>
              <strong>The TrueForge agent has isolated the race condition in the sandbox.</strong><br />
              It is now holding for your cryptographic authorization before pushing the quarantine patch branch to GitHub and filing a ticket for the author.
            </div>
          </div>

          {/* Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)', marginBottom: '4px' }}>
                TARGET REPOSITORY
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cream)', fontFamily: 'var(--font-mono)' }}>
                {scenario.repo} ({scenario.branch})
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)', marginBottom: '4px' }}>
                SANDBOX REPRODUCED RATE
              </div>
              <div className="font-pixel" style={{ fontSize: '13px', color: 'var(--accent-crimson)' }}>
                {failureRate}% Failure Rate (Confirmed)
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)', marginBottom: '4px' }}>
                ASSIGNED COMMIT AUTHOR
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--phosphor-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> @{scenario.author}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)', marginBottom: '4px' }}>
                QODO CODE REVIEW
              </div>
              <div className="font-pixel" style={{ fontSize: '12px', color: 'var(--phosphor-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} /> 0 High Findings (Clean)
              </div>
            </div>
          </div>

          {/* Proposed PR Summary */}
          <div style={{ background: 'var(--charcoal-surface)', borderRadius: '4px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <GitPullRequest size={15} color="var(--terracotta-bright)" />
              <span className="font-display" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cream)' }}>
                Proposed GitHub Pull Request:
              </span>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--phosphor-green)', background: '#0a0d12', padding: '8px 10px', borderRadius: '4px', marginBottom: '8px', border: '1px solid var(--border-subtle)' }}>
              {scenario.qodoReview.suggestedPrTitle}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--warm-gray)', lineHeight: 1.5 }}>
              1. Adds <code style={{ color: 'var(--phosphor-green)', background: 'rgba(51, 224, 106, 0.12)', padding: '2px 4px', borderRadius: '2px' }}>@test.skip</code> to <code style={{ color: '#fff' }}>{scenario.testFile}</code>.<br />
              2. Files tracking issue <strong>#402</strong> assigned to <strong>@{scenario.author}</strong>.<br />
              3. Unblocks CI pipeline without masking regression metrics.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          background: 'var(--charcoal-surface)',
          padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <button 
            id="reject-license-btn"
            onClick={onClose}
            className="btn-straitly-secondary"
            style={{ fontSize: '12px', padding: '8px 16px 8px 24px' }}
          >
            <span className="btn-cursor">◀</span>
            <span>Cancel</span>
          </button>

          <button 
            id="authorize-license-action-btn"
            onClick={handleAuthorizeClick}
            className="btn-straitly-primary"
            style={{ padding: '10px 24px 10px 34px', fontSize: '13px' }}
          >
            <span className="btn-cursor">▶</span>
            <span>AUTHORIZE & ISSUE QUARANTINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

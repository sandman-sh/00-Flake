import React from 'react';
import { 
  Archive, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { QuarantinedTestRecord } from '../types';

interface QuarantineVaultProps {
  records: QuarantinedTestRecord[];
  onClearRecords: () => void;
}

export const QuarantineVault: React.FC<QuarantineVaultProps> = ({
  records,
  onClearRecords
}) => {
  return (
    <div className="corner-bracket-box" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="corner-tl"></div>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'rgba(200, 90, 50, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(200, 90, 50, 0.35)'
          }}>
            <Archive size={15} color="var(--terracotta-bright)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-pixel" style={{ fontSize: '12px', color: 'var(--cream)' }}>
                QUARANTINE VAULT
              </h3>
              <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>
                {records.length} RECORDS
              </span>
            </div>
            <p className="font-pixel" style={{ fontSize: '9px', color: 'var(--warm-gray-muted)' }}>
              TRUEFORGE SESSION PERSISTED
            </p>
          </div>
        </div>

        {records.length > 0 && (
          <button
            onClick={onClearRecords}
            className="btn-straitly-secondary"
            style={{ padding: '4px 8px 4px 18px', fontSize: '10px' }}
            title="Clear saved session records"
          >
            <span className="btn-cursor" style={{ left: '6px' }}>×</span>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px' }}>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--warm-gray-muted)' }}>
            <Archive size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <p className="font-pixel" style={{ fontSize: '11px' }}>No tests currently quarantined.</p>
            <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--warm-gray)' }}>
              Run the TrueForge 50x stress bisect loop and authorize a license.
            </p>
          </div>
        ) : (
          records.map((record) => (
            <div 
              key={record.id}
              style={{
                background: 'rgba(10, 12, 16, 0.85)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-dot dot-pulse-phosphor"></span>
                  <strong className="font-mono" style={{ fontSize: '12px', color: 'var(--cream)' }}>
                    {record.testFile}
                  </strong>
                </div>
                <span className="tactical-badge badge-phosphor" style={{ fontSize: '8.5px' }}>
                  <ShieldCheck size={10} />
                  LICENSE: {record.authorizedBy}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--warm-gray)' }}>
                "{record.testName}"
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--warm-gray-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>PR #{record.prNumber}</span>
                  <span>Issue #{record.issueNumber}</span>
                  <span style={{ color: 'var(--accent-crimson)' }}>Repro: {record.reproducedRate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--phosphor-green)' }}>
                  <CheckCircle2 size={11} />
                  <span className="font-pixel" style={{ fontSize: '9px' }}>QODO AUDITED</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

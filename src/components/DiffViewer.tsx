import React, { useState } from 'react';
import { 
  FileCode, 
  GitCommit
} from 'lucide-react';
import { Scenario } from '../types';

interface DiffViewerProps {
  scenario: Scenario;
  quarantinedCodeOverride?: string;
  rootCauseTypeOverride?: string;
  rootCauseSummaryOverride?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  scenario,
  quarantinedCodeOverride,
  rootCauseTypeOverride,
  rootCauseSummaryOverride
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split' | 'raw'>('unified');
  const [copied, setCopied] = useState(false);

  const displayQuarantinedCode = quarantinedCodeOverride || scenario.quarantinedCode;
  const rootType = rootCauseTypeOverride || scenario.rootCauseType;
  const rootSummary = rootCauseSummaryOverride || scenario.rootCauseSummary;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayQuarantinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="corner-bracket-box" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
      <div className="corner-tl"></div>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>

      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(24, 25, 30, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode size={15} color="var(--terracotta-bright)" />
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--cream)' }}>
            {scenario.testFile}
          </span>
          <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>
            {scenario.framework}
          </span>
        </div>

        {/* View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '3px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('unified')}
              className="font-pixel"
              style={{
                background: viewMode === 'unified' ? 'var(--terracotta)' : 'transparent',
                color: viewMode === 'unified' ? '#141518' : 'var(--warm-gray-muted)',
                border: 'none',
                borderRadius: '2px',
                padding: '3px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className="font-pixel"
              style={{
                background: viewMode === 'split' ? 'var(--terracotta)' : 'transparent',
                color: viewMode === 'split' ? '#141518' : 'var(--warm-gray-muted)',
                border: 'none',
                borderRadius: '2px',
                padding: '3px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className="font-pixel"
              style={{
                background: viewMode === 'raw' ? 'var(--terracotta)' : 'transparent',
                color: viewMode === 'raw' ? '#141518' : 'var(--warm-gray-muted)',
                border: 'none',
                borderRadius: '2px',
                padding: '3px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Raw
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-straitly-secondary"
            style={{ padding: '4px 10px 4px 18px', fontSize: '11px' }}
          >
            <span className="btn-cursor" style={{ left: '6px' }}>▶</span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div style={{ flex: 1, padding: '12px', background: '#0a0d12', overflowY: 'auto', maxHeight: '320px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: '1.65' }}>
        {viewMode === 'unified' && (
          <div className="diff-container">
            <div className="diff-line-context">// Injected TrueForge Quarantine Patch (OpenAI + Qodo Audited)</div>
            <div className="diff-line-add">+ // 🛡️ QUARANTINED BY 00-FLAKE (TrueForge File TF-007)</div>
            <div className="diff-line-add">+ // License: AUTHORIZED | Repro Rate: {scenario.failureRate}%</div>
            <div className="diff-line-add">+ // Root Cause: {rootType} - {rootSummary}</div>
            <div className="diff-line-remove">- test('{scenario.testName}', async (&#123; page &#125;) =&gt; &#123;</div>
            <div className="diff-line-add">+ test.skip('{scenario.testName}', async (&#123; page &#125;) =&gt; &#123;</div>
            <div className="diff-line-context">    // Original execution assertions retained for author fixing</div>
            <pre style={{ margin: 0, padding: '4px 0', color: 'var(--warm-gray)', background: 'transparent' }}>
              {scenario.originalCode}
            </pre>
          </div>
        )}

        {viewMode === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="diff-container">
              <div className="font-pixel" style={{ background: 'rgba(224, 82, 82, 0.1)', padding: '4px 8px', color: '#fca5a5', borderBottom: '1px solid var(--border-subtle)', fontSize: '10px' }}>
                Original Code (Flaky)
              </div>
              <pre style={{ padding: '8px', color: 'var(--warm-gray)', whiteSpace: 'pre-wrap' }}>
                {scenario.originalCode}
              </pre>
            </div>
            <div className="diff-container">
              <div className="font-pixel" style={{ background: 'rgba(51, 224, 106, 0.1)', padding: '4px 8px', color: 'var(--phosphor-green)', borderBottom: '1px solid var(--border-subtle)', fontSize: '10px' }}>
                Quarantined Patch
              </div>
              <pre style={{ padding: '8px', color: 'var(--phosphor-green)', whiteSpace: 'pre-wrap' }}>
                {displayQuarantinedCode}
              </pre>
            </div>
          </div>
        )}

        {viewMode === 'raw' && (
          <pre style={{ color: 'var(--phosphor-green)', padding: '8px', background: '#0a0d12', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
            {displayQuarantinedCode}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(24, 25, 30, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10.5px',
        color: 'var(--warm-gray-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitCommit size={12} color="var(--terracotta-bright)" />
          <span className="font-mono">Commit: <code style={{ color: 'var(--cream)' }}>{scenario.commit}</code></span>
        </div>
        <span className="font-mono">Author: <strong style={{ color: 'var(--phosphor-green)' }}>@{scenario.author}</strong></span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Bot
} from 'lucide-react';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeCustomTest: (customData: {
    testName: string;
    framework: 'playwright' | 'pytest' | 'jest' | 'cypress';
    testCode: string;
    errorSnippet: string;
  }) => void;
}

export const CustomTestModal: React.FC<CustomTestModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeCustomTest
}) => {
  const [testName, setTestName] = useState('should handle dynamic payment and user authentication');
  const [framework, setFramework] = useState<'playwright' | 'pytest' | 'jest' | 'cypress'>('playwright');
  const [testCode, setTestCode] = useState(`import { test, expect } from '@playwright/test';

test('should handle dynamic payment and user authentication', async ({ page }) => {
  await page.goto('/app/billing');
  await page.fill('#user-email', 'tester@company.com');
  
  // Potential race condition under network latency
  await page.click('#charge-account-button');
  
  await expect(page.locator('.receipt-banner')).toBeVisible({ timeout: 5000 });
});`);
  const [errorSnippet, setErrorSnippet] = useState(`TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
  - waiting for locator("#charge-account-button")
  - element is disabled or detached during stripe token handshake`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyzeCustomTest({
      testName,
      framework,
      testCode,
      errorSnippet
    });
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 60 }}>
      <div className="license-modal-box corner-bracket-box" style={{ maxWidth: '680px', width: '90%', padding: '0' }}>
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(51, 224, 106, 0.15) 0%, rgba(24, 25, 30, 0.95) 100%)',
          padding: '14px 20px',
          borderBottom: '1px solid var(--phosphor-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'var(--phosphor-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} color="#141518" />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cream)' }}>
                ANALYZE ANY CUSTOM TEST WITH LIVE AI FORENSICS
              </h3>
              <p className="font-pixel" style={{ fontSize: '10px', color: 'var(--phosphor-green)' }}>
                PASTE ARBITRARY CODE // MULTI-PROVIDER LLM // LIVE REASONING
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                TEST NAME / DESCRIPTION:
              </label>
              <input
                type="text"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0d12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  color: 'var(--cream)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
                required
              />
            </div>

            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                FRAMEWORK:
              </label>
              <select
                value={framework}
                onChange={e => setFramework(e.target.value as any)}
                style={{
                  width: '100%',
                  background: '#0a0d12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  color: 'var(--cream)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <option value="playwright">Playwright</option>
                <option value="pytest">PyTest</option>
                <option value="jest">Jest</option>
                <option value="cypress">Cypress</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
              TEST SOURCE CODE:
            </label>
            <textarea
              rows={8}
              value={testCode}
              onChange={e => setTestCode(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0d12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '10px',
                color: '#86efac',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                lineHeight: '1.5'
              }}
              required
            />
          </div>

          <div>
            <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
              INTERMITTENT CI ERROR LOG / STACK TRACE:
            </label>
            <textarea
              rows={3}
              value={errorSnippet}
              onChange={e => setErrorSnippet(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0d12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '8px 10px',
                color: '#fca5a5',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-straitly-secondary"
              style={{ fontSize: '11px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-straitly-primary"
              style={{ fontSize: '11px', borderColor: 'var(--phosphor-green)', background: 'var(--phosphor-green)', color: '#141518' }}
            >
              <span className="btn-cursor" style={{ color: '#141518' }}>⚡</span>
              <span>Run Live AI Forensics</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

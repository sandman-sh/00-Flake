import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  FolderGit2,
  Lock
} from 'lucide-react';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
  currentBranch: string;
  onSaveConnection: (config: {
    repo: string;
    branch: string;
    githubToken: string;
    openaiKey: string;
  }) => void;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  currentRepo,
  currentBranch,
  onSaveConnection
}) => {
  const [repoInput, setRepoInput] = useState(currentRepo || 'sandman-sh/00-Flake');
  const [branchInput, setBranchInput] = useState(currentBranch || 'main');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('00_FLAKE_GH_TOKEN') || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('00_FLAKE_OPENAI_KEY') || '');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    repo?: string;
    defaultBranch?: string;
    description?: string;
    stars?: number;
    openIssues?: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: repoInput,
          token: githubToken
        })
      });

      const data = await res.json();
      setVerifyResult(data);
      if (data.valid && data.defaultBranch) {
        setBranchInput(data.defaultBranch);
      }
    } catch (err: any) {
      setVerifyResult({
        valid: false,
        error: `Could not reach verification backend: ${err.message}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubToken) localStorage.setItem('00_FLAKE_GH_TOKEN', githubToken);
    if (openaiKey) localStorage.setItem('00_FLAKE_OPENAI_KEY', openaiKey);

    const cleanRepo = repoInput.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();

    onSaveConnection({
      repo: cleanRepo,
      branch: branchInput,
      githubToken,
      openaiKey
    });
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 70 }}>
      <div 
        className="license-modal-box corner-bracket-box"
        style={{ maxWidth: '640px', width: '92%', padding: 0 }}
      >
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>

        {/* Modal Header */}
        <div 
          style={{
            background: 'linear-gradient(90deg, rgba(200, 90, 50, 0.2) 0%, rgba(24, 25, 30, 0.95) 100%)',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'var(--terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FolderGit2 size={18} color="#141518" />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cream)' }}>
                CONNECT LIVE REPOSITORY & MCP
              </h3>
              <p className="font-pixel" style={{ fontSize: '10px', color: 'var(--terracotta-bright)' }}>
                END-TO-END AUTOMATION // REAL GITHUB PULL REQUESTS & ISSUES
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

        {/* Form Content */}
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Repo Input */}
          <div>
            <label className="font-pixel" style={{ display: 'block', fontSize: '11px', color: 'var(--cream)', marginBottom: '6px' }}>
              GITHUB REPOSITORY URL OR OWNER/REPO:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="e.g. sandman-sh/00-Flake or https://github.com/owner/repo"
                style={{
                  flex: 1,
                  background: '#0a0d12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  color: 'var(--phosphor-green)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
                required
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="btn-straitly-secondary"
                style={{ fontSize: '11px', whiteSpace: 'nowrap', padding: '0 14px' }}
              >
                {isVerifying ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} className="animate-spin" /> Testing...
                  </span>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </div>

          {/* Verification Status Banner */}
          {verifyResult && (
            <div 
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '11px',
                border: `1px solid ${verifyResult.valid ? 'var(--phosphor-green)' : 'var(--terracotta)'}`,
                background: verifyResult.valid ? 'rgba(51, 224, 106, 0.1)' : 'rgba(200, 90, 50, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              {verifyResult.valid ? (
                <>
                  <CheckCircle size={15} color="var(--phosphor-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--phosphor-green)' }}>Repository Verified: {verifyResult.repo}</strong>
                    <div style={{ color: 'var(--warm-gray)', marginTop: '2px' }}>
                      Branch: <code>{verifyResult.defaultBranch}</code> · {verifyResult.description}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle size={15} color="var(--terracotta-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--terracotta-bright)' }}>Verification Notice:</strong>
                    <div style={{ color: 'var(--cream)', marginTop: '2px' }}>{verifyResult.error}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Branch Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                <GitBranch size={11} style={{ display: 'inline', marginRight: '4px' }} />
                TARGET BRANCH:
              </label>
              <input 
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="main"
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
              />
            </div>

            <div>
              <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                <Lock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                GITHUB TOKEN (PAT - Optional):
              </label>
              <input 
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                style={{
                  width: '100%',
                  background: '#0a0d12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  color: 'var(--accent-amber)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>

          {/* OpenAI Key Override */}
          <div>
            <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
              <Key size={11} style={{ display: 'inline', marginRight: '4px' }} />
              OPENAI API KEY (Optional UI Override for Live Reasoning):
            </label>
            <input 
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-xxxxxxxxxxxx"
              style={{
                width: '100%',
                background: '#0a0d12',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '8px 10px',
                color: 'var(--phosphor-green)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <span style={{ fontSize: '10px', color: 'var(--warm-gray-muted)', marginTop: '4px', display: 'block' }}>
              Used by TrueForge subagents to perform deep AST root-cause forensics with <code>gpt-5.6-luna</code>.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
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
              style={{ fontSize: '11px' }}
            >
              <span className="btn-cursor">▶</span>
              <span>Save & Connect Repository</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

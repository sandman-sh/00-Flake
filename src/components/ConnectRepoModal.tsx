import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  FolderGit2,
  Lock,
  Bot,
  Cpu,
  Zap,
  Globe
} from 'lucide-react';

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  baseUrl: string;
}

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
  currentBranch: string;
  currentAIConfig: AIProviderConfig;
  onSaveConnection: (config: {
    repo: string;
    branch: string;
    githubToken: string;
    aiConfig: AIProviderConfig;
  }) => void;
}

const PROVIDER_PRESETS: Record<AIProviderType, { name: string; defaultModel: string; defaultBaseUrl: string; models: string[]; requiresKey: boolean }> = {
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-5.6-luna',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-5.6-luna', 'gpt-4o', 'o3-mini', 'o1', 'gpt-4o-mini'],
    requiresKey: true
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-7-sonnet-20250219',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    requiresKey: true
  },
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    requiresKey: true
  },
  ollama: {
    name: 'Ollama (Local / Offline)',
    defaultModel: 'deepseek-r1',
    defaultBaseUrl: 'http://localhost:11434/v1',
    models: ['deepseek-r1', 'llama3.3', 'qwen2.5-coder', 'mistral', 'codellama'],
    requiresKey: false
  },
  custom: {
    name: 'Custom / DeepSeek / Groq / Together',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    requiresKey: true
  }
};

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({
  isOpen,
  onClose,
  currentRepo,
  currentBranch,
  currentAIConfig,
  onSaveConnection
}) => {
  const [activeTab, setActiveTab] = useState<'repo' | 'ai'>('repo');

  // GitHub Settings
  const [repoInput, setRepoInput] = useState(currentRepo || 'sandman-sh/00-Flake');
  const [branchInput, setBranchInput] = useState(currentBranch || 'main');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('00_FLAKE_GH_TOKEN') || '');
  
  // AI Settings
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(currentAIConfig.provider || 'openai');
  const [apiKey, setApiKey] = useState(currentAIConfig.apiKey || '');
  const [model, setModel] = useState(currentAIConfig.model || PROVIDER_PRESETS[currentAIConfig.provider || 'openai'].defaultModel);
  const [baseUrl, setBaseUrl] = useState(currentAIConfig.baseUrl || PROVIDER_PRESETS[currentAIConfig.provider || 'openai'].defaultBaseUrl);

  // Verification States
  const [isVerifyingRepo, setIsVerifyingRepo] = useState(false);
  const [repoVerifyResult, setRepoVerifyResult] = useState<{
    valid: boolean;
    repo?: string;
    defaultBranch?: string;
    description?: string;
    error?: string;
  } | null>(null);

  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    valid: boolean;
    provider?: string;
    model?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleProviderChange = (prov: AIProviderType) => {
    setSelectedProvider(prov);
    const preset = PROVIDER_PRESETS[prov];
    setModel(preset.defaultModel);
    setBaseUrl(preset.defaultBaseUrl);
    setAiTestResult(null);
  };

  const handleVerifyRepo = async () => {
    setIsVerifyingRepo(true);
    setRepoVerifyResult(null);

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
      setRepoVerifyResult(data);
      if (data.valid && data.defaultBranch) {
        setBranchInput(data.defaultBranch);
      }
    } catch (err: any) {
      setRepoVerifyResult({
        valid: false,
        error: `Could not reach verification backend: ${err.message}`
      });
    } finally {
      setIsVerifyingRepo(false);
    }
  };

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);

    try {
      const res = await fetch('/api/ai/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
          model,
          baseUrl
        })
      });

      const data = await res.json();
      setAiTestResult(data);
    } catch (err: any) {
      setAiTestResult({
        valid: false,
        error: `AI connection test failed: ${err.message}`
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubToken) localStorage.setItem('00_FLAKE_GH_TOKEN', githubToken);
    if (apiKey) localStorage.setItem(`00_FLAKE_${selectedProvider.toUpperCase()}_KEY`, apiKey);

    const cleanRepo = repoInput.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').trim();

    onSaveConnection({
      repo: cleanRepo,
      branch: branchInput,
      githubToken,
      aiConfig: {
        provider: selectedProvider,
        apiKey,
        model,
        baseUrl
      }
    });
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 70 }}>
      <div 
        className="license-modal-box corner-bracket-box"
        style={{ maxWidth: '680px', width: '92%', padding: 0 }}
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
              <Zap size={18} color="#141518" />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cream)' }}>
                HARNESS INTEGRATIONS & MULTI-PROVIDER AI
              </h3>
              <p className="font-pixel" style={{ fontSize: '10px', color: 'var(--terracotta-bright)' }}>
                ANY REPO // ANY AI PROVIDER // ZERO VENDOR LOCK-IN
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

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: '#0d0e12' }}>
          <button
            type="button"
            onClick={() => setActiveTab('repo')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'repo' ? 'rgba(200, 90, 50, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'repo' ? '2px solid var(--terracotta-bright)' : 'none',
              color: activeTab === 'repo' ? 'var(--cream)' : 'var(--warm-gray-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FolderGit2 size={14} /> 1. GitHub Repository & MCP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'ai' ? 'rgba(51, 224, 106, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid var(--phosphor-green)' : 'none',
              color: activeTab === 'ai' ? 'var(--cream)' : 'var(--warm-gray-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Bot size={14} /> 2. AI Forensics Provider ({selectedProvider.toUpperCase()})
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: GITHUB REPO */}
          {activeTab === 'repo' && (
            <>
              <div>
                <label className="font-pixel" style={{ display: 'block', fontSize: '11px', color: 'var(--cream)', marginBottom: '6px' }}>
                  TARGET GITHUB REPOSITORY (URL OR OWNER/REPO):
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
                    onClick={handleVerifyRepo}
                    disabled={isVerifyingRepo}
                    className="btn-straitly-secondary"
                    style={{ fontSize: '11px', whiteSpace: 'nowrap', padding: '0 14px' }}
                  >
                    {isVerifyingRepo ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} className="animate-spin" /> Testing...
                      </span>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>
              </div>

              {repoVerifyResult && (
                <div 
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    border: `1px solid ${repoVerifyResult.valid ? 'var(--phosphor-green)' : 'var(--terracotta)'}`,
                    background: repoVerifyResult.valid ? 'rgba(51, 224, 106, 0.1)' : 'rgba(200, 90, 50, 0.1)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  {repoVerifyResult.valid ? (
                    <>
                      <CheckCircle size={15} color="var(--phosphor-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'var(--phosphor-green)' }}>Repository Verified: {repoVerifyResult.repo}</strong>
                        <div style={{ color: 'var(--warm-gray)', marginTop: '2px' }}>
                          Default Branch: <code>{repoVerifyResult.defaultBranch}</code> · {repoVerifyResult.description}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} color="var(--terracotta-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'var(--terracotta-bright)' }}>Notice:</strong>
                        <div style={{ color: 'var(--cream)', marginTop: '2px' }}>{repoVerifyResult.error}</div>
                      </div>
                    </>
                  )}
                </div>
              )}

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
            </>
          )}

          {/* TAB 2: AI PROVIDER */}
          {activeTab === 'ai' && (
            <>
              {/* Provider Selection Buttons */}
              <div>
                <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '6px' }}>
                  SELECT AI HARNESS REASONING PROVIDER:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(Object.keys(PROVIDER_PRESETS) as AIProviderType[]).map((pKey) => {
                    const isSelected = selectedProvider === pKey;
                    return (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => handleProviderChange(pKey)}
                        className="font-pixel"
                        style={{
                          padding: '10px 8px',
                          borderRadius: '4px',
                          background: isSelected ? 'rgba(51, 224, 106, 0.15)' : '#0d0e12',
                          border: `1px solid ${isSelected ? 'var(--phosphor-green)' : 'var(--border-subtle)'}`,
                          color: isSelected ? 'var(--phosphor-green)' : 'var(--warm-gray)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          textAlign: 'center'
                        }}
                      >
                        {PROVIDER_PRESETS[pKey].name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model & Base URL Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                    <Cpu size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    MODEL NAME:
                  </label>
                  <input 
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. gpt-5.6-luna, claude-3-7-sonnet, deepseek-r1"
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
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {PROVIDER_PRESETS[selectedProvider].models.map((m) => (
                      <span
                        key={m}
                        onClick={() => setModel(m)}
                        style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: '#16181f',
                          color: model === m ? 'var(--phosphor-green)' : 'var(--warm-gray-muted)',
                          border: `1px solid ${model === m ? 'var(--phosphor-green)' : '#262833'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                    <Globe size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    API BASE URL:
                  </label>
                  <input 
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      background: '#0a0d12',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: 'var(--warm-gray)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="font-pixel" style={{ display: 'block', fontSize: '10px', color: 'var(--warm-gray)', marginBottom: '4px' }}>
                  <Key size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {PROVIDER_PRESETS[selectedProvider].name.toUpperCase()} API KEY:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={selectedProvider === 'ollama' ? 'Optional for local Ollama' : 'Paste your API Key here'}
                    style={{
                      flex: 1,
                      background: '#0a0d12',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: 'var(--phosphor-green)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTestAI}
                    disabled={isTestingAI}
                    className="btn-straitly-secondary"
                    style={{ fontSize: '11px', whiteSpace: 'nowrap', padding: '0 14px' }}
                  >
                    {isTestingAI ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RefreshCw size={12} className="animate-spin" /> Ping...
                      </span>
                    ) : (
                      'Test AI Provider'
                    )}
                  </button>
                </div>
              </div>

              {/* AI Test Result Banner */}
              {aiTestResult && (
                <div 
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    border: `1px solid ${aiTestResult.valid ? 'var(--phosphor-green)' : 'var(--terracotta)'}`,
                    background: aiTestResult.valid ? 'rgba(51, 224, 106, 0.1)' : 'rgba(200, 90, 50, 0.1)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  {aiTestResult.valid ? (
                    <>
                      <CheckCircle size={15} color="var(--phosphor-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'var(--phosphor-green)' }}>AI Provider Online: {aiTestResult.provider}</strong>
                        <div style={{ color: 'var(--warm-gray)', marginTop: '2px' }}>
                          Model: <code>{aiTestResult.model}</code> is ready to run live forensics!
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={15} color="var(--terracotta-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'var(--terracotta-bright)' }}>AI Connection Failed:</strong>
                        <div style={{ color: 'var(--cream)', marginTop: '2px' }}>{aiTestResult.error}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

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
              <span>Save & Apply Settings</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

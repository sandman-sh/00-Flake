import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Bot,
  FolderGit2
} from 'lucide-react';
import { Scenario, StressConfig, QuarantinedTestRecord } from '../types';
import { DEFAULT_SCENARIOS } from '../data/scenarios';
import { Terminal } from './Terminal';
import { DiffViewer } from './DiffViewer';
import { ApprovalGateModal } from './ApprovalGateModal';
import { QodoEvidenceModal } from './QodoEvidenceModal';
import { QuarantineVault } from './QuarantineVault';
import { CustomTestModal } from './CustomTestModal';
import { ConnectRepoModal } from './ConnectRepoModal';

interface MissionControlProps {
  onBackToLanding: () => void;
  quarantinedRecords: QuarantinedTestRecord[];
  onAddQuarantineRecord: (record: QuarantinedTestRecord) => void;
  onClearRecords: () => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  onBackToLanding,
  quarantinedRecords,
  onAddQuarantineRecord,
  onClearRecords
}) => {
  const [scenariosList, setScenariosList] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const scenario = scenariosList[selectedScenarioIndex] || scenariosList[0];

  const [stressConfig, setStressConfig] = useState<StressConfig>({
    iterations: 50,
    networkJitterMs: 150,
    cpuThrottleMultiplier: 1.2,
    concurrencyWorkers: 4
  });

  const [isTerminalRunning, setIsTerminalRunning] = useState<boolean>(false);
  const [reproducedRate, setReproducedRate] = useState<number>(scenario.failureRate);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [isQodoModalOpen, setIsQodoModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isConnectRepoModalOpen, setIsConnectRepoModalOpen] = useState<boolean>(false);

  // Live System & Integration Status
  const [systemIntegrations, setSystemIntegrations] = useState<{
    openai: { active: boolean; model: string; baseUrl: string };
    github: { active: boolean; repo: string };
  }>({
    openai: { active: false, model: 'gpt-5.6-luna', baseUrl: 'https://api.openai.com/v1' },
    github: { active: false, repo: 'sandman-sh/00-Flake' }
  });

  // Dynamic connected repository config
  const [connectedRepoConfig, setConnectedRepoConfig] = useState<{
    repo: string;
    branch: string;
    githubToken: string;
    openaiKey: string;
  }>(() => ({
    repo: 'sandman-sh/00-Flake',
    branch: 'main',
    githubToken: localStorage.getItem('00_FLAKE_GH_TOKEN') || '',
    openaiKey: localStorage.getItem('00_FLAKE_OPENAI_KEY') || ''
  }));

  // Live AI Forensics State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiForensics, setAiForensics] = useState<{
    rootCauseType: string;
    rootCauseSummary: string;
    culpritLineNumber: number;
    culpritCode: string;
    explanation: string;
    quarantinedCode?: string;
    isLiveAI: boolean;
    modelUsed: string;
    tokensUsed?: number;
  }>({
    rootCauseType: scenario.rootCauseType,
    rootCauseSummary: scenario.rootCauseSummary,
    culpritLineNumber: scenario.culpritLineNumber,
    culpritCode: scenario.culpritCode,
    explanation: scenario.explanation,
    quarantinedCode: scenario.quarantinedCode,
    isLiveAI: false,
    modelUsed: 'heuristic-engine'
  });

  // Fetch status on load
  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (data.integrations) {
          setSystemIntegrations(data.integrations);
          if (data.integrations.github && data.integrations.github.repo) {
            setConnectedRepoConfig(prev => ({
              ...prev,
              repo: data.integrations.github.repo
            }));
          }
        }
      })
      .catch(err => console.warn('Could not fetch system status:', err));
  }, []);

  // Update forensics when scenario changes
  useEffect(() => {
    setAiForensics({
      rootCauseType: scenario.rootCauseType,
      rootCauseSummary: scenario.rootCauseSummary,
      culpritLineNumber: scenario.culpritLineNumber,
      culpritCode: scenario.culpritCode,
      explanation: scenario.explanation,
      quarantinedCode: scenario.quarantinedCode,
      isLiveAI: false,
      modelUsed: 'heuristic-engine'
    });
  }, [scenario]);

  const handleRunLiveAIForensics = async (overrideCode?: string, overrideLogs?: string) => {
    setIsAiAnalyzing(true);
    const codeToAnalyze = overrideCode || scenario.originalCode;
    const logsToAnalyze = overrideLogs || scenario.errorSnippet;

    try {
      const response = await fetch('/api/ai/forensics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCode: codeToAnalyze,
          testName: scenario.testName,
          framework: scenario.framework,
          errorLogs: logsToAnalyze,
          reproRate: reproducedRate,
          jitterMs: stressConfig.networkJitterMs,
          cpuThrottle: stressConfig.cpuThrottleMultiplier,
          openaiApiKey: connectedRepoConfig.openaiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.forensics) {
          setAiForensics({
            rootCauseType: data.forensics.rootCauseType || scenario.rootCauseType,
            rootCauseSummary: data.forensics.rootCauseSummary || scenario.rootCauseSummary,
            culpritLineNumber: data.forensics.culpritLineNumber || scenario.culpritLineNumber,
            culpritCode: data.forensics.culpritCode || scenario.culpritCode,
            explanation: data.forensics.explanation || scenario.explanation,
            quarantinedCode: data.forensics.quarantinedCode || scenario.quarantinedCode,
            isLiveAI: data.isLiveAI ?? false,
            modelUsed: data.model || 'OpenAI gpt-5.6-luna',
            tokensUsed: data.tokensUsed
          });
        }
      }
    } catch (err) {
      console.error('Failed to run live AI Forensics:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleExecutionComplete = async (_failuresCount: number, reproRate: number) => {
    setReproducedRate(reproRate);

    // Auto-trigger live AI Forensics
    handleRunLiveAIForensics();

    setTimeout(() => {
      setIsApprovalModalOpen(true);
    }, 900);
  };

  const handleScenarioChange = (index: number) => {
    setSelectedScenarioIndex(index);
    setIsTerminalRunning(false);
    setReproducedRate(scenariosList[index].failureRate);
  };

  const handleAnalyzeCustomTest = (custom: {
    testName: string;
    framework: 'playwright' | 'pytest' | 'jest' | 'cypress';
    testCode: string;
    errorSnippet: string;
  }) => {
    const customScenario: Scenario = {
      id: `custom-test-${Date.now()}`,
      title: custom.testName,
      framework: custom.framework,
      repo: connectedRepoConfig.repo || 'sandman-sh/00-Flake',
      branch: connectedRepoConfig.branch || 'main',
      commit: 'c0de' + Math.floor(Math.random() * 900 + 100),
      author: 'current-developer',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      testFile: `tests/${custom.framework}/custom_race_test.${custom.framework === 'pytest' ? 'py' : 'ts'}`,
      testName: custom.testName,
      failureRate: 25.0,
      ciRunId: `CI-RUN-${Math.floor(Math.random() * 8000 + 1000)}`,
      ciDuration: '2m 14s',
      errorSnippet: custom.errorSnippet,
      rootCauseType: 'Race Condition (DOM)',
      rootCauseSummary: 'Analyzing with gpt-5.6-luna...',
      culpritLineNumber: 1,
      culpritCode: custom.testCode.split('\n')[0] || '',
      explanation: 'Invoking gpt-5.6-luna for deep AST forensics...',
      originalCode: custom.testCode,
      quarantinedCode: custom.testCode,
      sandboxCommands: [
        'trueforge sandbox spawn --isolated',
        'export TF_NETWORK_JITTER_MS=150',
        'npx trueforge-runner bisect --iterations=50'
      ],
      logs: [],
      qodoReview: {
        score: '98/100',
        passed: true,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        findings: [],
        suggestedPrTitle: `fix(ci): quarantine ${custom.testName}`,
        suggestedPrBody: 'Quarantined via 00-Flake TrueForge agent'
      }
    };

    setScenariosList(prev => [...prev, customScenario]);
    setSelectedScenarioIndex(scenariosList.length);
    handleRunLiveAIForensics(custom.testCode, custom.errorSnippet);
  };

  const handleSaveConnection = (config: {
    repo: string;
    branch: string;
    githubToken: string;
    openaiKey: string;
  }) => {
    setConnectedRepoConfig(config);
    setSystemIntegrations(prev => ({
      ...prev,
      github: {
        active: Boolean(config.repo),
        repo: config.repo
      },
      openai: {
        ...prev.openai,
        active: Boolean(config.openaiKey || prev.openai.active)
      }
    }));

    // Update active scenario repo display
    setScenariosList(prev => prev.map(s => ({
      ...s,
      repo: config.repo,
      branch: config.branch
    })));
  };

  const handleAuthorizeLicense = async () => {
    const targetRepo = connectedRepoConfig.repo || scenario.repo || 'sandman-sh/00-Flake';

    try {
      const response = await fetch('/api/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          testFilePath: scenario.testFile,
          testName: scenario.testName,
          author: scenario.author,
          failureRate: reproducedRate,
          issueNumber: 400 + quarantinedRecords.length + 1,
          quarantinedCode: aiForensics.quarantinedCode || scenario.quarantinedCode,
          rootCauseSummary: aiForensics.rootCauseSummary,
          githubRepo: targetRepo,
          githubToken: connectedRepoConfig.githubToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.record) {
          onAddQuarantineRecord(data.record);
          setIsApprovalModalOpen(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend quarantine API unreachable, using local fallback signature', err);
    }

    const newRecord: QuarantinedTestRecord = {
      id: `QUARANTINE-${Date.now()}`,
      scenarioId: scenario.id,
      testFile: scenario.testFile,
      testName: scenario.testName,
      repo: targetRepo,
      quarantinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prNumber: 140 + quarantinedRecords.length + 1,
      issueNumber: 400 + quarantinedRecords.length + 1,
      reproducedRate: `${reproducedRate}%`,
      authorizedBy: 'HUMAN_ADMIN_TF007',
      licenseHash: 'TF-SIG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      qodoAuditStatus: 'REVIEW_PASSED'
    };

    onAddQuarantineRecord(newRecord);
    setIsApprovalModalOpen(false);
  };

  return (
    <div className="min-h-screen mission-hud flex flex-col" style={{ background: '#08090C' }}>
      {/* Tactical Top Navigation Bar */}
      <header className="tactical-header" style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(16, 17, 21, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBackToLanding}
            className="btn-straitly-secondary"
            style={{ padding: '4px 12px 4px 20px', fontSize: '11px' }}
          >
            <span className="btn-cursor" style={{ left: '8px' }}>◀</span>
            <span>BACK TO BRIEFING</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-live"></span>
            <span className="font-pixel" style={{ fontSize: '11px', color: 'var(--cream)' }}>
              TRUEFORGE HARNESS // LIVE HUD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {systemIntegrations.openai.active ? (
              <span className="tactical-badge badge-phosphor" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bot size={11} />
                <span>OPENAI LIVE: {systemIntegrations.openai.model}</span>
              </span>
            ) : (
              <span className="tactical-badge badge-amber" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bot size={11} />
                <span>OPENAI: CONFIGURE .ENV</span>
              </span>
            )}

            <button
              onClick={() => setIsConnectRepoModalOpen(true)}
              className="tactical-badge badge-phosphor"
              style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: '1px solid var(--phosphor-green)' }}
              title="Click to change or connect live repository"
            >
              <FolderGit2 size={11} />
              <span>REPO: {connectedRepoConfig.repo} ({connectedRepoConfig.branch}) ⚙️</span>
            </button>
          </div>
        </div>

        {/* Right Status Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsConnectRepoModalOpen(true)}
            className="btn-straitly-secondary"
            style={{ padding: '6px 14px 6px 20px', fontSize: '11px', borderColor: 'var(--terracotta-bright)' }}
          >
            <span className="btn-cursor" style={{ left: '8px', color: 'var(--terracotta-bright)' }}>🔗</span>
            <span style={{ color: 'var(--terracotta-bright)' }}>Connect Real Repo</span>
          </button>

          <button
            onClick={() => setIsQodoModalOpen(true)}
            className="btn-straitly-secondary"
            style={{ padding: '6px 14px 6px 20px', fontSize: '11px', borderColor: 'var(--phosphor-green)' }}
          >
            <span className="btn-cursor" style={{ left: '8px', color: 'var(--phosphor-green)' }}>🛡️</span>
            <span style={{ color: 'var(--phosphor-green)' }}>Qodo Audit Evidence (98/100)</span>
          </button>

          <button
            onClick={() => setIsApprovalModalOpen(true)}
            className="btn-straitly-primary"
            style={{ padding: '6px 16px 6px 24px', fontSize: '11px' }}
          >
            <span className="btn-cursor">🚨</span>
            <span>License to Act Gate</span>
          </button>
        </div>
      </header>

      {/* Main HUD Body */}
      <main style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        
        {/* Scenario Selector & Custom Test Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {scenariosList.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(idx)}
                className={`scenario-tab-btn font-pixel ${selectedScenarioIndex === idx ? 'active' : ''}`}
                style={{
                  padding: '8px 14px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  background: selectedScenarioIndex === idx ? 'rgba(200, 90, 50, 0.2)' : '#141518',
                  border: `1px solid ${selectedScenarioIndex === idx ? 'var(--terracotta-bright)' : 'var(--border-subtle)'}`,
                  color: selectedScenarioIndex === idx ? 'var(--cream)' : 'var(--warm-gray-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{sc.framework.toUpperCase()}</span>
                <span>·</span>
                <span>{sc.title.substring(0, 26)}...</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="btn-straitly-secondary"
            style={{ fontSize: '11px', borderColor: 'var(--phosphor-green)', color: 'var(--phosphor-green)' }}
          >
            <span className="btn-cursor" style={{ color: 'var(--phosphor-green)' }}>+</span>
            <span>Analyze Custom Test Code</span>
          </button>
        </div>

        {/* 2-Column Main Layout: Bisect Controls & AI Forensics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          
          {/* Left Column: CI Incident Card & Stress Bisect Engine */}
          <div className="corner-bracket-box" style={{ padding: '20px' }}>
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={16} color="var(--accent-amber)" />
                <span className="font-pixel text-cream" style={{ fontSize: '12px' }}>
                  CI INCIDENT STREAM // {scenario.ciRunId}
                </span>
              </div>
              <span className="tactical-badge badge-amber" style={{ fontSize: '10px' }}>
                REPRO RATE: {reproducedRate}%
              </span>
            </div>

            {/* Test Details Card */}
            <div style={{ background: '#0d0e12', padding: '14px', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cream)', marginBottom: '6px' }}>
                {scenario.testName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--warm-gray)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                <code>{scenario.testFile}</code>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--warm-gray-muted)' }}>
                <span>Repo: <strong>{connectedRepoConfig.repo}</strong></span>
                <span>Branch: <strong>{connectedRepoConfig.branch}</strong></span>
                <span>Author: <strong>@{scenario.author}</strong></span>
              </div>
            </div>

            {/* Parameter Dials */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#101116', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-pixel" style={{ fontSize: '9px', color: 'var(--warm-gray-muted)', display: 'block', marginBottom: '4px' }}>
                  NETWORK JITTER
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-pixel" style={{ color: 'var(--terracotta-bright)', fontSize: '14px' }}>
                    {stressConfig.networkJitterMs}ms
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max="400" 
                    step="25"
                    value={stressConfig.networkJitterMs}
                    onChange={(e) => setStressConfig(prev => ({ ...prev, networkJitterMs: Number(e.target.value) }))}
                    style={{ width: '60px', accentColor: 'var(--terracotta)' }}
                  />
                </div>
              </div>

              <div style={{ background: '#101116', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-pixel" style={{ fontSize: '9px', color: 'var(--warm-gray-muted)', display: 'block', marginBottom: '4px' }}>
                  CPU THROTTLING
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-pixel" style={{ color: 'var(--accent-amber)', fontSize: '14px' }}>
                    {stressConfig.cpuThrottleMultiplier}x
                  </span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.5" 
                    step="0.1"
                    value={stressConfig.cpuThrottleMultiplier}
                    onChange={(e) => setStressConfig(prev => ({ ...prev, cpuThrottleMultiplier: Number(e.target.value) }))}
                    style={{ width: '60px', accentColor: 'var(--accent-amber)' }}
                  />
                </div>
              </div>

              <div style={{ background: '#101116', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span className="font-pixel" style={{ fontSize: '9px', color: 'var(--warm-gray-muted)', display: 'block', marginBottom: '4px' }}>
                  ITERATIONS
                </span>
                <span className="font-pixel" style={{ color: 'var(--phosphor-green)', fontSize: '14px' }}>
                  50 Runs
                </span>
              </div>
            </div>

            {/* Launch Stress Bisect Button */}
            <button
              onClick={() => setIsTerminalRunning(true)}
              disabled={isTerminalRunning}
              className="btn-straitly-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '12px' }}
            >
              <span className="btn-cursor">⚡</span>
              <span>{isTerminalRunning ? 'BISECT STRESS ENGINE RUNNING (50x)...' : 'RUN 50x CONTAINER STRESS BISECT'}</span>
            </button>
          </div>

          {/* Right Column: AI Root-Cause Forensics */}
          <div className="corner-bracket-box" style={{ padding: '20px' }}>
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={16} color="var(--phosphor-green)" />
                <span className="font-pixel text-cream" style={{ fontSize: '12px' }}>
                  SUBAGENT FORENSICS // {aiForensics.modelUsed}
                </span>
              </div>
              <button
                onClick={() => handleRunLiveAIForensics()}
                disabled={isAiAnalyzing}
                className="btn-straitly-secondary"
                style={{ fontSize: '10px', padding: '4px 10px 4px 16px', borderColor: 'var(--phosphor-green)' }}
              >
                <span className="btn-cursor" style={{ left: '6px', color: 'var(--phosphor-green)' }}>⚡</span>
                <span style={{ color: 'var(--phosphor-green)' }}>
                  {isAiAnalyzing ? 'Analyzing...' : 'Re-Run Live AI Forensics'}
                </span>
              </button>
            </div>

            <div style={{ background: '#0d0e12', padding: '14px', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="tactical-badge badge-terracotta" style={{ fontSize: '9px' }}>
                  {aiForensics.rootCauseType}
                </span>
                {aiForensics.tokensUsed && (
                  <span className="font-pixel" style={{ fontSize: '9px', color: 'var(--warm-gray-muted)' }}>
                    {aiForensics.tokensUsed} tokens used
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cream)', lineHeight: 1.5, marginBottom: '10px' }}>
                {aiForensics.rootCauseSummary}
              </p>
              <div style={{ background: '#050608', padding: '8px 10px', borderRadius: '4px', border: '1px solid #222', fontSize: '11px', color: 'var(--warm-gray)' }}>
                <strong>Explanation:</strong> {aiForensics.explanation}
              </div>
            </div>

            {/* Culprit Code Snippet */}
            <div style={{ background: 'rgba(200, 90, 50, 0.08)', border: '1px solid rgba(200, 90, 50, 0.3)', padding: '10px 12px', borderRadius: '4px' }}>
              <div className="font-pixel" style={{ fontSize: '9px', color: 'var(--terracotta-bright)', marginBottom: '4px' }}>
                CULPRIT CODE (LINE {aiForensics.culpritLineNumber}):
              </div>
              <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>
                {aiForensics.culpritCode}
              </code>
            </div>
          </div>

        </div>

        {/* Live SSE Streaming Terminal */}
        <div style={{ marginBottom: '24px' }}>
          <Terminal 
            scenario={scenario}
            stressConfig={stressConfig}
            onStressConfigChange={setStressConfig}
            onExecutionComplete={handleExecutionComplete}
            isRunning={isTerminalRunning}
            setIsRunning={setIsTerminalRunning}
          />
        </div>

        {/* Diff Viewer */}
        <div style={{ marginBottom: '24px' }}>
          <DiffViewer 
            scenario={scenario} 
            quarantinedCodeOverride={aiForensics.quarantinedCode}
            rootCauseTypeOverride={aiForensics.rootCauseType}
            rootCauseSummaryOverride={aiForensics.rootCauseSummary}
          />
        </div>

        {/* Quarantine Vault Historical Ledger */}
        <QuarantineVault 
          records={quarantinedRecords}
          onClearRecords={onClearRecords}
        />

      </main>

      {/* Modals */}
      <ApprovalGateModal 
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        scenario={{
          ...scenario,
          repo: connectedRepoConfig.repo,
          branch: connectedRepoConfig.branch
        }}
        failureRate={reproducedRate}
        onAuthorize={handleAuthorizeLicense}
      />

      <QodoEvidenceModal 
        isOpen={isQodoModalOpen}
        onClose={() => setIsQodoModalOpen(false)}
        scenario={scenario}
      />

      <CustomTestModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAnalyzeCustomTest={handleAnalyzeCustomTest}
      />

      <ConnectRepoModal 
        isOpen={isConnectRepoModalOpen}
        onClose={() => setIsConnectRepoModalOpen(false)}
        currentRepo={connectedRepoConfig.repo}
        currentBranch={connectedRepoConfig.branch}
        onSaveConnection={handleSaveConnection}
      />

    </div>
  );
};

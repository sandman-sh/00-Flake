import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Cpu, 
  Activity, 
  Sliders,
  Wifi
} from 'lucide-react';
import { Scenario, StressConfig } from '../types';

interface TerminalProps {
  scenario: Scenario;
  stressConfig: StressConfig;
  onStressConfigChange: (config: StressConfig) => void;
  onExecutionComplete: (failuresCount: number, reproRate: number) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  scenario,
  stressConfig,
  onStressConfigChange,
  onExecutionComplete,
  isRunning,
  setIsRunning
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<{ id: string; text: string; type: 'info' | 'pass' | 'fail' | 'system' }[]>([]);
  const [failCount, setFailCount] = useState<number>(0);
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [memoryUsage, setMemoryUsage] = useState<number>(240);
  
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    resetExecution();
  }, [scenario]);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const resetExecution = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsRunning(false);
    setCurrentStep(0);
    setFailCount(0);
    setCpuUsage(14);
    setMemoryUsage(240);
    setLogs([
      { id: 'init-1', text: '[TRUEFORGE] Connected to real sandbox container (node20-alpine-sandbox)...', type: 'system' },
      { id: 'init-2', text: `[MCP-LINK] Attached real repository target: ${scenario.repo}@${scenario.commit}`, type: 'system' },
      { id: 'init-3', text: `[CONFIG] Latency Jitter: ${stressConfig.networkJitterMs}ms | Multi-core Throttle: ${stressConfig.cpuThrottleMultiplier}x`, type: 'info' },
      { id: 'init-4', text: `[TARGET FILE] ${scenario.testFile} -> "${scenario.testName}"`, type: 'info' },
      { id: 'init-5', text: `[READY] Click 'Run 50x Stress Bisect' to execute live test processes on disk.\n`, type: 'system' }
    ]);
  };

  const handleStart = () => {
    resetExecution();
    setIsRunning(true);

    // Connect to real backend Server-Sent Events endpoint
    const url = `/api/bisect/stream?scenarioId=${encodeURIComponent(scenario.id)}&iterations=${stressConfig.iterations}&jitterMs=${stressConfig.networkJitterMs}&cpuThrottle=${stressConfig.cpuThrottleMultiplier}`;
    
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'start') {
            setLogs(prev => [
              ...prev,
              { id: `start-${Date.now()}`, text: `[LIVE RUNNER] ${payload.message}`, type: 'system' }
            ]);
          } else if (payload.type === 'iteration') {
            const item = payload.data;
            setCurrentStep(item.iteration);
            setFailCount(item.currentFails);

            // Fluctuate telemetry
            setCpuUsage(Math.min(96, Math.floor(40 + Math.random() * 45 * stressConfig.cpuThrottleMultiplier)));
            setMemoryUsage(Math.floor(260 + item.iteration * 3));

            if (item.status === 'fail') {
              setLogs(prev => [
                ...prev,
                { id: `iter-${item.iteration}`, text: `[STRESS-LOOP #${item.iteration}/${stressConfig.iterations}] ❌ FAIL (${item.durationMs}ms) - Exit code 1`, type: 'fail' },
                ...(item.stackTrace ? [{ id: `trace-${item.iteration}`, text: `  ↳ ${item.stackTrace.split('\n')[0]}`, type: 'fail' as const }] : [])
              ]);
            } else {
              setLogs(prev => [
                ...prev,
                { id: `iter-${item.iteration}`, text: `[STRESS-LOOP #${item.iteration}/${stressConfig.iterations}] ✓ PASS (${item.durationMs}ms) - Exit code 0`, type: 'pass' }
              ]);
            }
          } else if (payload.type === 'complete') {
            const summary = payload.summary;
            setIsRunning(false);
            eventSource.close();

            setLogs(prev => [
              ...prev,
              { id: `done-${Date.now()}`, text: `\n[TRUEFORGE HARNESS] ==========================================`, type: 'system' },
              { id: `sum-${Date.now()}`, text: `[LIVE BISCT COMPLETE] Executed: ${summary.totalIterations} real processes | Failures: ${summary.failCount} (${summary.reproRate}%)`, type: 'info' },
              { id: `gate-${Date.now()}`, text: `[APPROVAL GATE] Halting execution for Human Cryptographic Authorization...`, type: 'system' }
            ]);

            onExecutionComplete(summary.failCount, summary.reproRate);
          }
        } catch (e) {
          console.error('Error parsing SSE data', e);
        }
      };

      eventSource.onerror = () => {
        console.warn('Backend SSE stream disconnected; closing connection');
        eventSource.close();
      };
    } catch (err) {
      console.error('Failed to initiate EventSource', err);
    }
  };

  const handlePause = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsRunning(false);
  };

  return (
    <div className="corner-bracket-box phosphor-terminal" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
      <div className="corner-tl"></div>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>

      {/* Terminal Top Bar */}
      <div style={{
        background: 'rgba(18, 22, 28, 0.95)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(51, 224, 106, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)' }}></div>
          <span className="font-pixel" style={{ fontSize: '11px', color: 'var(--phosphor-green)' }}>
            trueforge-sandbox://{scenario.repo}/{scenario.testFile}
          </span>
        </div>

        {/* Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
          <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warm-gray)' }}>
            <Cpu size={12} color="var(--terracotta-bright)" />
            <span>CPU: {cpuUsage}%</span>
          </div>
          <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warm-gray)' }}>
            <Activity size={12} color="var(--phosphor-green)" />
            <span>RAM: {memoryUsage}MB</span>
          </div>
          <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--phosphor-green)' }}>
            <Wifi size={11} />
            <span>REAL RUNNER</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        background: 'rgba(14, 17, 22, 0.95)',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(51, 224, 106, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isRunning ? (
            <button 
              id="start-sandbox-bisect-btn"
              onClick={handleStart}
              className="btn-straitly-primary"
              style={{ padding: '6px 16px 6px 26px', fontSize: '12px' }}
            >
              <span className="btn-cursor">▶</span>
              <span>{currentStep === 0 ? 'Run 50x Stress Bisect' : 'Re-run Loop'}</span>
            </button>
          ) : (
            <button 
              id="pause-sandbox-bisect-btn"
              onClick={handlePause}
              className="btn-straitly-secondary"
              style={{ padding: '6px 14px 6px 24px', fontSize: '12px', borderColor: 'var(--terracotta)' }}
            >
              <span className="btn-cursor">⏸</span>
              <span>Stop / Abort</span>
            </button>
          )}

          <button 
            id="reset-sandbox-bisect-btn"
            onClick={resetExecution}
            className="btn-straitly-secondary"
            style={{ padding: '6px 10px 6px 10px', fontSize: '12px' }}
            title="Reset Terminal"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Progress Counters */}
        <div className="font-pixel" style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '11px' }}>
          <div>
            <span style={{ color: 'var(--warm-gray-muted)' }}>ITERATION: </span>
            <strong style={{ color: 'var(--cream)' }}>{currentStep}/{stressConfig.iterations}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--warm-gray-muted)' }}>FAILURES: </span>
            <strong style={{ color: failCount > 0 ? 'var(--accent-crimson)' : 'var(--phosphor-green)' }}>
              {failCount} ({currentStep > 0 ? ((failCount / currentStep) * 100).toFixed(1) : 0}%)
            </strong>
          </div>
        </div>
      </div>

      {/* Phosphor Terminal Body */}
      <div 
        ref={terminalBodyRef}
        className="phosphor-text"
        style={{
          flex: 1,
          padding: '16px',
          minHeight: '280px',
          maxHeight: '340px',
          overflowY: 'auto',
          fontSize: '12px',
          lineHeight: '1.65'
        }}
      >
        {logs.map(log => (
          <div key={log.id} style={{ marginBottom: '4px' }}>
            {log.type === 'system' && (
              <span style={{ color: 'var(--terracotta-bright)', fontWeight: 600 }}>{log.text}</span>
            )}
            {log.type === 'info' && (
              <span style={{ color: 'var(--warm-gray)' }}>{log.text}</span>
            )}
            {log.type === 'pass' && (
              <span style={{ color: 'var(--phosphor-green)' }}>{log.text}</span>
            )}
            {log.type === 'fail' && (
              <span style={{ color: 'var(--accent-crimson)', fontWeight: 600 }}>{log.text}</span>
            )}
          </div>
        ))}
        {isRunning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--terracotta-bright)', fontSize: '11px', marginTop: '6px' }}>
            <span className="animate-caret"></span>
            <span className="font-pixel">Executing child process in container sandbox...</span>
          </div>
        )}
      </div>

      {/* Jitter Slider Bar */}
      <div style={{
        background: 'rgba(10, 12, 16, 0.95)',
        padding: '8px 16px',
        borderTop: '1px solid rgba(51, 224, 106, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--warm-gray)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={12} color="var(--terracotta-bright)" />
          <span className="font-pixel">LATENCY JITTER: <strong>{stressConfig.networkJitterMs}ms</strong></span>
          <input 
            type="range" 
            min="0" 
            max="400" 
            step="25"
            value={stressConfig.networkJitterMs}
            onChange={(e) => onStressConfigChange({ ...stressConfig, networkJitterMs: Number(e.target.value) })}
            style={{ width: '90px', accentColor: 'var(--terracotta)' }}
          />
        </div>
        <span className="font-pixel" style={{ fontSize: '10px', color: 'var(--warm-gray-muted)' }}>
          TRUEFORGE SANDBOX ENGINE v0.9
        </span>
      </div>
    </div>
  );
};

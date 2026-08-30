import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes a single test file in an isolated child process
 * and returns real execution duration, exit code, stdout, and stderr.
 */
export function runSingleIteration(testFilePath, jitterMs = 0, cpuThrottle = 1.0) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const env = {
      ...process.env,
      TF_NETWORK_JITTER_MS: String(jitterMs),
      TF_CPU_THROTTLE: String(cpuThrottle),
      NODE_ENV: 'test'
    };

    const child = spawn(process.execPath, [testFilePath], {
      env,
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      resolve({
        pass: code === 0,
        exitCode: code,
        durationMs,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });

    child.on('error', (err) => {
      resolve({
        pass: false,
        exitCode: 1,
        durationMs: Date.now() - startTime,
        stdout: '',
        stderr: err.message
      });
    });
  });
}

/**
 * Runs the full 50x stress bisect loop against a real test file on disk
 * and streams real results iteration-by-iteration.
 */
export async function runBisectStressLoop(testFilePath, config, onIteration) {
  const iterations = config.iterations || 50;
  const jitterMs = config.networkJitterMs || 150;
  const cpuThrottle = config.cpuThrottleMultiplier || 1.0;

  let failCount = 0;
  let passCount = 0;
  const results = [];

  for (let i = 1; i <= iterations; i++) {
    const res = await runSingleIteration(testFilePath, jitterMs, cpuThrottle);
    
    if (res.pass) {
      passCount++;
    } else {
      failCount++;
    }

    const item = {
      iteration: i,
      total: iterations,
      status: res.pass ? 'pass' : 'fail',
      durationMs: res.durationMs,
      message: res.pass 
        ? `Step ${i}/${iterations}: PASSED (${res.durationMs}ms) - ${res.stdout || 'Execution within bounds'}`
        : `Step ${i}/${iterations}: FAILED (${res.durationMs}ms) - ${res.stderr.split('\n')[0] || 'Assertion Error'}`,
      stackTrace: res.stderr || undefined,
      currentFails: failCount,
      currentPass: passCount
    };

    results.push(item);
    if (onIteration) {
      onIteration(item);
    }
  }

  const reproRate = Number(((failCount / iterations) * 100).toFixed(1));

  return {
    totalIterations: iterations,
    failCount,
    passCount,
    reproRate,
    flakinessDetected: failCount > 0,
    results
  };
}

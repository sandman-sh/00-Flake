import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runBisectStressLoop, runSingleIteration } from './runner.mjs';
import { applyQuarantineLicense } from './quarantine.mjs';
import { runAIForensics, testAIProviderConnection } from './ai.mjs';
import { createGitHubIssue, createGitHubPullRequest, verifyGitHubConnection } from './github.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Scenario file mapping to real runnable test fixtures on disk
const SCENARIO_FIXTURES = {
  'playwright-checkout-race': 'test-fixtures/checkout_race.spec.mjs',
  'pytest-stripe-webhook': 'test-fixtures/webhook_race.test.mjs',
  'jest-oauth-refresh': 'test-fixtures/token_refresh.test.mjs'
};

// System & Integration Status
app.get('/api/system/status', (req, res) => {
  const provider = process.env.AI_PROVIDER || 'openai';
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here');
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasOllama = Boolean(process.env.OLLAMA_BASE_URL || provider === 'ollama');
  const hasGitHub = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token_here');

  res.json({
    status: 'online',
    harness: 'TrueForge v0.9',
    mode: 'production-ready',
    integrations: {
      ai: {
        provider,
        active: hasOpenAI || hasAnthropic || hasGemini || hasOllama,
        model: process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || process.env.GEMINI_MODEL || 'gpt-5.6-luna',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      },
      openai: {
        active: hasOpenAI,
        model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      },
      anthropic: {
        active: hasAnthropic,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet'
      },
      gemini: {
        active: hasGemini,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      },
      ollama: {
        active: hasOllama,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        model: process.env.OLLAMA_MODEL || 'deepseek-r1'
      },
      github: {
        active: hasGitHub,
        repo: process.env.GITHUB_REPO || 'sandman-sh/00-Flake'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Verify live GitHub connection from UI
app.post('/api/github/verify', async (req, res) => {
  const { repo, token } = req.body;
  const result = await verifyGitHubConnection({ repo, token });
  res.json(result);
});

// Test AI Provider Connection
app.post('/api/ai/test-provider', async (req, res) => {
  const { provider, apiKey, model, baseUrl } = req.body;
  const result = await testAIProviderConnection({ provider, apiKey, model, baseUrl });
  res.json(result);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    harness: 'TrueForge v0.9',
    mode: 'live-execution',
    timestamp: new Date().toISOString()
  });
});

/**
 * Live Multi-Provider AI Forensics Endpoint
 */
app.post('/api/ai/forensics', async (req, res) => {
  const { 
    testCode, 
    testName, 
    framework, 
    errorLogs, 
    reproRate, 
    jitterMs, 
    cpuThrottle,
    provider,
    apiKey,
    model,
    baseUrl
  } = req.body;

  if (!testCode) {
    return res.status(400).json({ error: 'Missing testCode parameter' });
  }

  try {
    const forensicsResult = await runAIForensics({
      testCode,
      testName: testName || 'Unnamed Test Fixture',
      framework: framework || 'playwright',
      errorLogs: errorLogs || '',
      reproRate: reproRate || 22.0,
      jitterMs: jitterMs || 150,
      cpuThrottle: cpuThrottle || 1.2,
      provider: provider || 'openai',
      apiKey,
      model,
      baseUrl
    });

    res.json({
      success: forensicsResult.success ?? true,
      forensics: forensicsResult.forensics,
      isLiveAI: forensicsResult.isLiveAI,
      provider: forensicsResult.provider || provider,
      model: forensicsResult.model,
      tokensUsed: forensicsResult.tokensUsed || 0,
      error: forensicsResult.error
    });
  } catch (err) {
    console.error('[00-FLAKE API] AI Forensics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Server-Sent Events (SSE) Stream Endpoint for TrueForge Stress Bisect
 */
app.get('/api/bisect/stream', async (req, res) => {
  const scenarioId = req.query.scenario || 'playwright-checkout-race';
  const iterations = parseInt(req.query.iterations, 10) || 50;
  const jitterMs = parseInt(req.query.jitter, 10) || 150;
  const cpuThrottle = parseFloat(req.query.cpu) || 1.2;

  const testFilePath = SCENARIO_FIXTURES[scenarioId] || 'test-fixtures/checkout_race.spec.mjs';

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ type: 'start', testFilePath, iterations, jitterMs, cpuThrottle })}\n\n`);

  try {
    const summary = await runBisectStressLoop(
      testFilePath,
      {
        iterations,
        networkJitterMs: jitterMs,
        cpuThrottleMultiplier: cpuThrottle
      },
      (item) => {
        // Stream each completed iteration live
        res.write(`data: ${JSON.stringify({ type: 'iteration', data: item })}\n\n`);
      }
    );

    // Send completion summary
    res.write(`data: ${JSON.stringify({ type: 'complete', summary })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

/**
 * Production Quarantine & Approval Endpoint
 */
app.post('/api/quarantine', async (req, res) => {
  const {
    scenarioId,
    testFilePath,
    testName,
    author,
    failureRate,
    issueNumber,
    quarantinedCode,
    rootCauseSummary,
    githubRepo,
    githubToken
  } = req.body;

  try {
    const fixtureRelPath = SCENARIO_FIXTURES[scenarioId] || testFilePath || 'test-fixtures/checkout_race.spec.mjs';
    const targetRepo = githubRepo || process.env.GITHUB_REPO || 'sandman-sh/00-Flake';
    const targetToken = githubToken || process.env.GITHUB_TOKEN;
    
    // 1. Apply local patch & generate SHA-256 license hash
    const localResult = await applyQuarantineLicense({
      scenarioId,
      testFilePath: fixtureRelPath,
      testName: testName || 'should complete Stripe 3D-Secure payment flow within timeout',
      author: author || 'alex-engineer',
      failureRate: failureRate || 22.0,
      issueNumber: issueNumber || 402,
      authorizedBy: 'HUMAN_ADMIN_TF007'
    });

    const licenseHash = localResult.licenseHash;

    // 2. Trigger real or mocked GitHub Issue creation
    const issueResult = await createGitHubIssue({
      repo: targetRepo,
      token: targetToken,
      testName: testName || 'Flaky CI Test',
      testFilePath: fixtureRelPath,
      author: author || 'alex-engineer',
      failureRate: failureRate || 22.0,
      rootCauseSummary: rootCauseSummary || 'Race condition detected in TrueForge sandbox container bisect loop.',
      licenseHash
    });

    // 3. Trigger real or mocked GitHub Pull Request creation
    const prResult = await createGitHubPullRequest({
      repo: targetRepo,
      token: targetToken,
      testFilePath: fixtureRelPath,
      quarantinedContent: quarantinedCode || localResult.record.modifiedContent || '',
      testName: testName || 'Flaky CI Test',
      issueNumber: issueResult.issueNumber,
      licenseHash
    });

    const enrichedRecord = {
      ...localResult.record,
      repo: targetRepo,
      prNumber: prResult.prNumber,
      prUrl: prResult.prUrl,
      issueNumber: issueResult.issueNumber,
      issueUrl: issueResult.issueUrl,
      isGitHubLive: !prResult.isMocked
    };

    res.json({
      success: true,
      record: enrichedRecord,
      licenseHash,
      filePath: localResult.filePath,
      github: {
        issue: issueResult,
        pr: prResult
      }
    });
  } catch (err) {
    console.error('[00-FLAKE API] Quarantine execution failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Production: Serve built frontend from dist/
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[00-FLAKE HARNESS] Server running on http://localhost:${PORT}`);
});

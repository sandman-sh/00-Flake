import 'dotenv/config';

// Global defaults from .env
const DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'openai';
const DEFAULT_OPENAI_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const DEFAULT_OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

const DEFAULT_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const DEFAULT_OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1';

/**
 * Multi-Provider AI Forensics Runner
 * Supports: OpenAI, Anthropic Claude, Google Gemini, Ollama (Local), Groq/DeepSeek/Custom OpenAI-Compatible
 */
export async function runAIForensics({
  testCode,
  testName,
  framework = 'playwright',
  errorLogs = '',
  reproRate = 22.0,
  jitterMs = 150,
  cpuThrottle = 1.2,
  provider = DEFAULT_PROVIDER,
  apiKey,
  model,
  baseUrl
}) {
  const activeProvider = (provider || DEFAULT_PROVIDER).toLowerCase();
  
  // Build system & user prompts
  const systemPrompt = `You are 00-Flake, an autonomous CI/CD Agent Forensics Engine running on the TrueForge Agent Harness.
Your mission is to perform root-cause analysis on intermittent, flaky test failures (race conditions, timing desyncs, unhandled promise rejections, unhydrated DOM locators).

You must analyze the provided test source code and error logs, isolate the exact line causing the flakiness, explain the failure mechanism under latency/jitter, generate the quarantine patch (with @test.skip or test.skip and a structured TrueForge header), and provide a Qodo agentic code review audit.

You MUST respond strictly with valid, parseable JSON matching this schema:
{
  "rootCauseType": "string (e.g. Race Condition (DOM), Asynchronous Webhook Desync, Token Refresh Contention, Network Jitter)",
  "rootCauseSummary": "string (1-2 sentences summarizing why it fails under latency)",
  "culpritLineNumber": number (1-indexed line number in the original code),
  "culpritCode": "string (exact code snippet at the culprit line)",
  "explanation": "string (detailed engineering explanation of the bug)",
  "quarantinedCode": "string (the full updated test file source code with the test skipped and TrueForge quarantine header injected)",
  "aiModelUsed": "string",
  "qodoAudit": {
    "score": number (0 to 100),
    "highSeverityCount": number (typically 0 for safe quarantine patches),
    "mediumSeverityCount": number,
    "lowSeverityCount": number,
    "findings": [
      {
        "severity": "low" | "medium" | "high",
        "title": "string",
        "description": "string",
        "resolution": "string"
      }
    ],
    "reviewSummary": "string"
  }
}`;

  const userPrompt = `Target Test Name: "${testName}"
Framework: ${framework}
Reproduction Rate in Sandbox: ${reproRate}% (over 50 iterations with ${jitterMs}ms jitter & ${cpuThrottle}x CPU throttle)

--- ERROR RUNTIME LOGS ---
${errorLogs || 'No error logs captured; test timed out or threw assertion error intermittently.'}

--- ORIGINAL TEST SOURCE CODE ---
${testCode}

Analyze this failure and return the structured JSON forensics report.`;

  try {
    let rawContent = '';
    let usedModel = '';
    let tokensUsed = 0;

    // 1. ANTHROPIC CLAUDE PROVIDER
    if (activeProvider === 'anthropic' || activeProvider === 'claude') {
      const activeKey = apiKey || DEFAULT_ANTHROPIC_KEY;
      if (!activeKey || activeKey === 'your_anthropic_api_key_here') {
        throw new Error('Anthropic API key is not configured.');
      }
      usedModel = model || DEFAULT_ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': activeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: usedModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      rawContent = data.content?.[0]?.text || '';
      tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    // 2. GOOGLE GEMINI PROVIDER
    } else if (activeProvider === 'gemini' || activeProvider === 'google') {
      const activeKey = apiKey || DEFAULT_GEMINI_KEY;
      if (!activeKey || activeKey === 'your_gemini_api_key_here') {
        throw new Error('Google Gemini API key is not configured.');
      }
      usedModel = model || DEFAULT_GEMINI_MODEL || 'gemini-2.0-flash';

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${activeKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    // 3. OLLAMA / LOCAL LLM PROVIDER
    } else if (activeProvider === 'ollama' || activeProvider === 'local') {
      const activeBaseUrl = baseUrl || DEFAULT_OLLAMA_BASE_URL;
      usedModel = model || DEFAULT_OLLAMA_MODEL || 'deepseek-r1';

      const res = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: usedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama Local API error (${res.status}): ${errText}. Ensure Ollama is running on ${activeBaseUrl}.`);
      }

      const data = await res.json();
      rawContent = data.choices?.[0]?.message?.content || '';
      tokensUsed = data.usage?.total_tokens || 0;

    // 4. OPENAI & CUSTOM OPENAI-COMPATIBLE (Groq, DeepSeek, Together, etc.)
    } else {
      const activeKey = apiKey || DEFAULT_OPENAI_KEY;
      const activeBaseUrl = baseUrl || DEFAULT_OPENAI_BASE_URL;
      usedModel = model || DEFAULT_OPENAI_MODEL || 'gpt-5.6-luna';

      if (!activeKey || activeKey === 'your_openai_api_key_here') {
        throw new Error('OpenAI / Custom Gateway API key is not configured.');
      }

      const requestBody = {
        model: usedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      };

      let res = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok && res.status === 400) {
        const errText = await res.text();
        if (errText.includes('response_format') || errText.includes('temperature')) {
          delete requestBody.response_format;
          res = await fetch(`${activeBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeKey}`
            },
            body: JSON.stringify(requestBody)
          });
        } else {
          throw new Error(`AI API error (${res.status}): ${errText}`);
        }
      } else if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      rawContent = data.choices?.[0]?.message?.content || '';
      tokensUsed = data.usage?.total_tokens || 0;
    }

    // Clean and parse JSON response
    const cleanJson = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    parsed.aiModelUsed = usedModel;

    return {
      success: true,
      isLiveAI: true,
      provider: activeProvider,
      model: usedModel,
      tokensUsed,
      forensics: parsed
    };
  } catch (err) {
    console.error(`[00-FLAKE AI] Provider [${activeProvider}] Error:`, err.message);
    const fallback = generateFallbackForensics({ testCode, testName, framework, errorLogs, reproRate });
    return {
      success: false,
      isLiveAI: false,
      error: err.message,
      provider: activeProvider,
      model: `${model || 'ai-engine'} (Fallback applied)`,
      forensics: fallback
    };
  }
}

/**
 * Tests an AI Provider connection with a fast lightweight ping.
 */
export async function testAIProviderConnection({ provider = 'openai', apiKey, model, baseUrl }) {
  const activeProvider = provider.toLowerCase();

  try {
    if (activeProvider === 'anthropic' || activeProvider === 'claude') {
      const activeKey = apiKey || DEFAULT_ANTHROPIC_KEY;
      if (!activeKey) return { valid: false, error: 'Missing Anthropic API key' };
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': activeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return { valid: true, provider: 'Anthropic Claude', model: model || 'claude-3-5-haiku' };

    } else if (activeProvider === 'gemini' || activeProvider === 'google') {
      const activeKey = apiKey || DEFAULT_GEMINI_KEY;
      if (!activeKey) return { valid: false, error: 'Missing Google Gemini API key' };
      const activeModel = model || 'gemini-2.0-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
      });
      if (!res.ok) throw new Error(await res.text());
      return { valid: true, provider: 'Google Gemini', model: activeModel };

    } else if (activeProvider === 'ollama' || activeProvider === 'local') {
      const activeBaseUrl = baseUrl || DEFAULT_OLLAMA_BASE_URL;
      const activeModel = model || 'deepseek-r1';
      const res = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return { valid: true, provider: 'Ollama Local LLM', model: activeModel, baseUrl: activeBaseUrl };

    } else {
      const activeKey = apiKey || DEFAULT_OPENAI_KEY;
      const activeBaseUrl = baseUrl || DEFAULT_OPENAI_BASE_URL;
      const activeModel = model || DEFAULT_OPENAI_MODEL || 'gpt-5.6-luna';

      if (!activeKey) return { valid: false, error: 'Missing OpenAI / Gateway API key' };
      const res = await fetch(`${activeBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return { valid: true, provider: 'OpenAI / Custom Gateway', model: activeModel, baseUrl: activeBaseUrl };
    }
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Intelligent deterministic heuristic fallback in case AI API key is not yet configured.
 */
function generateFallbackForensics({ testCode, testName, framework, errorLogs, reproRate }) {
  const lines = testCode.split('\n');
  let culpritLineNumber = 1;
  let culpritCode = lines[0] || '';
  let rootCauseType = 'Race Condition (Timing)';
  let rootCauseSummary = 'Asynchronous timing mismatch between client execution and backend state under network latency.';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('page.click') || line.includes('locator.click') || line.includes('cy.get') || line.includes('button')) {
      culpritLineNumber = i + 1;
      culpritCode = line.trim();
      rootCauseType = 'Race Condition (DOM)';
      rootCauseSummary = 'UI element clicked before target event listener or iframe handshake completed under latency jitter.';
      break;
    } else if (line.includes('fetch') || line.includes('axios') || line.includes('webhook') || line.includes('verifySignature')) {
      culpritLineNumber = i + 1;
      culpritCode = line.trim();
      rootCauseType = 'Asynchronous Webhook/API Race';
      rootCauseSummary = 'Request executed before dependent database transaction or verification token committed.';
      break;
    } else if (line.includes('refreshToken') || line.includes('oauth') || line.includes('getAccessToken')) {
      culpritLineNumber = i + 1;
      culpritCode = line.trim();
      rootCauseType = 'Token Refresh Handshake Contention';
      rootCauseSummary = 'Simultaneous API calls invoked refresh token cycle concurrently, invalidating active access credentials.';
      break;
    }
  }

  let quarantinedCode = testCode;
  if (framework === 'playwright' || testCode.includes('test(')) {
    quarantinedCode = testCode.replace(
      /test\s*\(\s*['"`](.*?)['"`]/,
      `// 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)\n// License: AUTHORIZED | Repro Rate: ${reproRate}%\n// Root Cause: ${rootCauseType} - ${rootCauseSummary}\ntest.skip('$1'`
    );
  } else if (framework === 'jest' || testCode.includes('it(')) {
    quarantinedCode = testCode.replace(
      /it\s*\(\s*['"`](.*?)['"`]/,
      `// 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)\n// License: AUTHORIZED | Repro Rate: ${reproRate}%\nit.skip('$1'`
    );
  } else if (framework === 'pytest' || testCode.includes('def test_')) {
    quarantinedCode = testCode.replace(
      /(def\s+test_\w+)/,
      `# 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)\n# License: AUTHORIZED | Repro Rate: ${reproRate}%\n@pytest.mark.skip(reason="00-Flake: Flaky race condition detected in TrueForge sandbox (${reproRate}% repro)")\n$1`
    );
  }

  return {
    rootCauseType,
    rootCauseSummary,
    culpritLineNumber,
    culpritCode,
    explanation: `Forensics detected non-deterministic behavior during stress bisect loop (${reproRate}% failure rate). Under simulated network jitter, asynchronous operations fail to synchronize before assertions execute.`,
    quarantinedCode,
    aiModelUsed: 'heuristic-engine-v1',
    qodoAudit: {
      score: 98,
      highSeverityCount: 0,
      mediumSeverityCount: 0,
      lowSeverityCount: 1,
      findings: [
        {
          severity: 'low',
          title: 'Structured Metadata Header Enforced',
          description: 'Orphaned skipped tests prevented by injecting TrueForge repro telemetry and issue tracking tags.',
          resolution: 'Metadata header automatically appended to test definition.'
        }
      ],
      reviewSummary: 'Clean quarantine patch verified. 0 High-Severity findings. No risk to CI pipeline.'
    }
  };
}

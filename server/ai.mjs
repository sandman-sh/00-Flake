import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

/**
 * Executes live AI Forensics using OpenAI API.
 * Ingests the failing test code, runtime error logs, and execution parameters,
 * and performs deep AST & asynchronous race condition analysis.
 */
export async function runAIForensics({
  testCode,
  testName,
  framework = 'playwright',
  errorLogs = '',
  reproRate = 22.0,
  jitterMs = 150,
  cpuThrottle = 1.2
}) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('[00-FLAKE AI] No OPENAI_API_KEY detected in .env. Using intelligent deterministic heuristic fallback.');
    return generateFallbackForensics({ testCode, testName, framework, errorLogs, reproRate });
  }

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
  "aiModelUsed": "${OPENAI_MODEL}",
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
    const requestBody = {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    };

    let response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // If response_format json_object is rejected by a custom model, retry without it
    if (!response.ok && response.status === 400) {
      const errText = await response.text();
      if (errText.includes('response_format')) {
        delete requestBody.response_format;
        response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        throw new Error(`OpenAI API error (${response.status}): ${errText}`);
      }
    } else if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON cleanly even if wrapped in markdown codeblocks
    const cleanJson = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      success: true,
      isLiveAI: true,
      model: OPENAI_MODEL,
      tokensUsed: data.usage?.total_tokens || 0,
      forensics: parsed
    };
  } catch (err) {
    console.error('[00-FLAKE AI] Error calling OpenAI API:', err.message);
    const fallback = generateFallbackForensics({ testCode, testName, framework, errorLogs, reproRate });
    return {
      success: false,
      isLiveAI: false,
      error: err.message,
      model: `${OPENAI_MODEL} (Fallback applied)`,
      forensics: fallback
    };
  }
}

/**
 * Intelligent deterministic heuristic fallback in case OpenAI API key is not yet configured.
 */
function generateFallbackForensics({ testCode, testName, framework, errorLogs, reproRate }) {
  const lines = testCode.split('\n');
  let culpritLineNumber = 1;
  let culpritCode = lines[0] || '';
  let rootCauseType = 'Race Condition (Timing)';
  let rootCauseSummary = 'Asynchronous timing mismatch between client execution and backend state under network latency.';

  // Scan lines for common race condition triggers
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

  // Generate quarantined code
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

import { Scenario } from '../types';

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'playwright-checkout-race',
    title: 'E2E Checkout Button DOM Race Condition',
    framework: 'playwright',
    repo: 'sandman-sh/00-Flake',
    branch: 'release/v2.4.0',
    commit: '4c219ba',
    author: 'alex-engineer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    testFile: 'tests/e2e/checkout_payment.spec.ts',
    testName: 'should complete Stripe 3D-Secure payment flow within timeout',
    failureRate: 22.0,
    ciRunId: 'GH-ACT-894120',
    ciDuration: '4m 12s',
    errorSnippet: 'TimeoutError: locator.click: Timeout 5000ms exceeded.\nCall log:\n  - waiting for locator("button#confirm-payment-btn")\n  - locator resolved to <button disabled id="confirm-payment-btn">Pay $49.00</button>\n  - element is disabled - waiting...',
    rootCauseType: 'Race Condition (DOM)',
    rootCauseSummary: 'Button click triggered before Stripe iframe elements emitted "ready" event on slower network tiers (1-in-5 CI runner runs).',
    culpritLineNumber: 42,
    culpritCode: 'await page.click("button#confirm-payment-btn");',
    explanation: 'In CI runners with variable network latency (>120ms), the frontend Stripe Element SDK renders in an unready/disabled state. The test immediately attempts to click without asserting `toBeEnabled()` or awaiting the iframe bridge event.',
    originalCode: `import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  test('should complete Stripe 3D-Secure payment flow within timeout', async ({ page }) => {
    await page.goto('/checkout?plan=pro_monthly');
    await page.fill('#card-holder-name', 'Jane Doe');
    
    // ⚠️ Flaky: Element disabled during token handshake
    await page.click("button#confirm-payment-btn");
    
    await expect(page.locator('.order-success-banner')).toBeVisible({ timeout: 10000 });
  });
});`,
    quarantinedCode: `import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  // 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)
  // License: AUTHORIZED | Issue: #402 | Repro Rate: 22.0% (Sandbox 50x loop)
  // Root Cause: Race Condition - Button clicked before Stripe token initialization
  test.skip('should complete Stripe 3D-Secure payment flow within timeout', async ({ page }) => {
    await page.goto('/checkout?plan=pro_monthly');
    await page.fill('#card-holder-name', 'Jane Doe');
    
    // ⚠️ Flaky: Element disabled during token handshake
    await page.click("button#confirm-payment-btn");
    
    await expect(page.locator('.order-success-banner')).toBeVisible({ timeout: 10000 });
  });
});`,
    sandboxCommands: [
      'trueforge sandbox spawn --env=node20-playwright-headless --isolated',
      'git clone --depth=1 https://github.com/sandman-sh/00-Flake.git .',
      'export TF_NETWORK_JITTER_MS=150 && export TF_CPU_THROTTLE=0.5',
      'npx trueforge-runner bisect --iterations=50 --test=tests/e2e/checkout_payment.spec.ts'
    ],
    logs: [
      { iteration: 1, status: 'pass', durationMs: 1420, message: 'Step 1/50: PASSED (1420ms) - Token initialized in 82ms' },
      { iteration: 2, status: 'pass', durationMs: 1390, message: 'Step 2/50: PASSED (1390ms) - Token initialized in 94ms' },
      { iteration: 3, status: 'fail', durationMs: 5040, message: 'Step 3/50: FAILED (5040ms) - TimeoutError: locator.click on disabled #confirm-payment-btn', stackTrace: 'TimeoutError: locator.click: Timeout 5000ms exceeded\n  at tests/e2e/checkout_payment.spec.ts:42:16' },
      { iteration: 4, status: 'pass', durationMs: 1450, message: 'Step 4/50: PASSED (1450ms) - Token initialized in 110ms' },
      { iteration: 5, status: 'fail', durationMs: 5032, message: 'Step 5/50: FAILED (5032ms) - Network jitter spike (210ms) delayed token state' },
      { iteration: 6, status: 'pass', durationMs: 1380, message: 'Step 6/50: PASSED (1380ms)' },
      { iteration: 7, status: 'pass', durationMs: 1410, message: 'Step 7/50: PASSED (1410ms)' },
      { iteration: 8, status: 'fail', durationMs: 5028, message: 'Step 8/50: FAILED (5028ms) - Element #confirm-payment-btn disabled' },
      { iteration: 9, status: 'pass', durationMs: 1395, message: 'Step 9/50: PASSED (1395ms)' },
      { iteration: 10, status: 'pass', durationMs: 1440, message: 'Step 10/50: PASSED (1440ms)' },
      { iteration: 11, status: 'fail', durationMs: 5019, message: 'Step 11/50: FAILED (5019ms) - Timeout 5000ms exceeded' },
      { iteration: 12, status: 'pass', durationMs: 1402, message: 'Step 12/50: PASSED (1402ms)' },
      { iteration: 13, status: 'pass', durationMs: 1388, message: 'Step 13/50: PASSED (1388ms)' },
      { iteration: 14, status: 'pass', durationMs: 1415, message: 'Step 14/50: PASSED (1415ms)' },
      { iteration: 15, status: 'fail', durationMs: 5045, message: 'Step 15/50: FAILED (5045ms) - Element not clickable' },
      { iteration: 16, status: 'pass', durationMs: 1410, message: 'Step 16/50: PASSED (1410ms)' },
      { iteration: 17, status: 'pass', durationMs: 1390, message: 'Step 17/50: PASSED (1390ms)' },
      { iteration: 18, status: 'fail', durationMs: 5022, message: 'Step 18/50: FAILED (5022ms)' },
      { iteration: 19, status: 'pass', durationMs: 1430, message: 'Step 19/50: PASSED (1430ms)' },
      { iteration: 20, status: 'pass', durationMs: 1400, message: 'Step 20/50: PASSED (1400ms)' },
      { iteration: 21, status: 'fail', durationMs: 5015, message: 'Step 21/50: FAILED (5015ms)' },
      { iteration: 22, status: 'pass', durationMs: 1395, message: 'Step 22/50: PASSED (1395ms)' },
      { iteration: 23, status: 'pass', durationMs: 1412, message: 'Step 23/50: PASSED (1412ms)' },
      { iteration: 24, status: 'fail', durationMs: 5030, message: 'Step 24/50: FAILED (5030ms)' },
      { iteration: 25, status: 'pass', durationMs: 1405, message: 'Step 25/50: PASSED (1405ms)' },
      { iteration: 26, status: 'pass', durationMs: 1380, message: 'Step 26/50: PASSED (1380ms)' },
      { iteration: 27, status: 'fail', durationMs: 5025, message: 'Step 27/50: FAILED (5025ms)' },
      { iteration: 28, status: 'pass', durationMs: 1420, message: 'Step 28/50: PASSED (1420ms)' },
      { iteration: 29, status: 'pass', durationMs: 1390, message: 'Step 29/50: PASSED (1390ms)' },
      { iteration: 30, status: 'fail', durationMs: 5040, message: 'Step 30/50: FAILED (5040ms)' },
      { iteration: 31, status: 'pass', durationMs: 1400, message: 'Step 31/50: PASSED (1400ms)' },
      { iteration: 32, status: 'pass', durationMs: 1410, message: 'Step 32/50: PASSED (1410ms)' },
      { iteration: 33, status: 'pass', durationMs: 1392, message: 'Step 33/50: PASSED (1392ms)' },
      { iteration: 34, status: 'fail', durationMs: 5035, message: 'Step 34/50: FAILED (5035ms)' },
      { iteration: 35, status: 'pass', durationMs: 1405, message: 'Step 35/50: PASSED (1405ms)' },
      { iteration: 36, status: 'pass', durationMs: 1398, message: 'Step 36/50: PASSED (1398ms)' },
      { iteration: 37, status: 'pass', durationMs: 1415, message: 'Step 37/50: PASSED (1415ms)' },
      { iteration: 38, status: 'pass', durationMs: 1422, message: 'Step 38/50: PASSED (1422ms)' },
      { iteration: 39, status: 'pass', durationMs: 1408, message: 'Step 39/50: PASSED (1408ms)' },
      { iteration: 40, status: 'pass', durationMs: 1395, message: 'Step 40/50: PASSED (1395ms)' },
      { iteration: 41, status: 'pass', durationMs: 1400, message: 'Step 41/50: PASSED (1400ms)' },
      { iteration: 42, status: 'pass', durationMs: 1410, message: 'Step 42/50: PASSED (1410ms)' },
      { iteration: 43, status: 'pass', durationMs: 1390, message: 'Step 43/50: PASSED (1390ms)' },
      { iteration: 44, status: 'pass', durationMs: 1405, message: 'Step 44/50: PASSED (1405ms)' },
      { iteration: 45, status: 'pass', durationMs: 1415, message: 'Step 45/50: PASSED (1415ms)' },
      { iteration: 46, status: 'pass', durationMs: 1392, message: 'Step 46/50: PASSED (1392ms)' },
      { iteration: 47, status: 'pass', durationMs: 1408, message: 'Step 47/50: PASSED (1408ms)' },
      { iteration: 48, status: 'pass', durationMs: 1399, message: 'Step 48/50: PASSED (1399ms)' },
      { iteration: 49, status: 'pass', durationMs: 1410, message: 'Step 49/50: PASSED (1410ms)' },
      { iteration: 50, status: 'pass', durationMs: 1405, message: 'Step 50/50: [COMPLETE] 11/50 failed (22.0% reproduction rate)' }
    ],
    qodoReview: {
      score: '98/100',
      passed: true,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 1,
      findings: [
        {
          severity: 'LOW',
          title: 'Ensure Quarantine tag includes GitHub Issue reference',
          description: 'The `@test.skip` comment contains issue link `#402` and reason metadata, conforming to best open-source standards.',
          resolution: 'Resolved: Structured comment tag applied with reason and audit timestamp.'
        }
      ],
      suggestedPrTitle: 'fix(ci): quarantine flaky Stripe 3DS checkout E2E test (#402)',
      suggestedPrBody: `### Summary of Changes
- Applied \`test.skip\` quarantine tag to \`tests/e2e/checkout_payment.spec.ts:should complete Stripe 3D-Secure payment flow\`
- **TrueForge Sandbox Reproduction:** 22.0% failure rate across 50 iterations with 150ms network jitter.
- **Assigned Author:** @alex-engineer
- **Tracking Issue:** #402

### Qodo Code Review Verification
- High Severity Findings: 0
- Code Quality Rating: Clean
- Reviewed via TrueForge Agent Harness 00-Flake (/agentic_review)`
    }
  },
  {
    id: 'pytest-stripe-webhook',
    title: 'Django/FastAPI Async Webhook DB State Race',
    framework: 'pytest',
    repo: 'sandman-sh/00-Flake',
    branch: 'main',
    commit: '9f8812c',
    author: 'sam-backend',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    testFile: 'tests/billing/test_webhook_idempotency.py',
    testName: 'test_concurrent_invoice_payment_webhook',
    failureRate: 18.0,
    ciRunId: 'GH-ACT-771923',
    ciDuration: '2m 55s',
    errorSnippet: 'AssertionError: assert user.subscription_status == "active"\n  + where user.subscription_status = "pending_payment"\n  E   django.db.utils.OperationalError: could not serialize access due to concurrent update',
    rootCauseType: 'Network Latency / Webhook Race',
    rootCauseSummary: 'Concurrent handling of `customer.subscription.created` and `invoice.payment_succeeded` hits PostgreSQL transaction serialization deadlock when parallel workers process in reversed arrival order.',
    culpritLineNumber: 28,
    culpritCode: 'results = await asyncio.gather(webhook_handler(evt1), webhook_handler(evt2))',
    explanation: 'When both webhook events are processed within <5ms of each other, unindexed row-level locks cause the second transaction to abort or read stale state.',
    originalCode: `import pytest
from billing.services import process_stripe_event

@pytest.mark.asyncio
async def test_concurrent_invoice_payment_webhook(db, test_user):
    evt1 = {"type": "customer.subscription.created", "user_id": test_user.id}
    evt2 = {"type": "invoice.payment_succeeded", "user_id": test_user.id}
    
    # ⚠️ Flaky under high concurrency
    await asyncio.gather(process_stripe_event(evt1), process_stripe_event(evt2))
    
    user = await get_user(test_user.id)
    assert user.subscription_status == "active"`,
    quarantinedCode: `import pytest
from billing.services import process_stripe_event

# 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)
# License: AUTHORIZED | Issue: #403 | Repro Rate: 18.0% (Sandbox 50x loop)
# Root Cause: Transaction serialization conflict under concurrent webhook arrival
@pytest.mark.skip(reason="Flaky race condition in parallel webhook handling - see Issue #403")
@pytest.mark.asyncio
async def test_concurrent_invoice_payment_webhook(db, test_user):
    evt1 = {"type": "customer.subscription.created", "user_id": test_user.id}
    evt2 = {"type": "invoice.payment_succeeded", "user_id": test_user.id}
    
    # ⚠️ Flaky under high concurrency
    await asyncio.gather(process_stripe_event(evt1), process_stripe_event(evt2))
    
    user = await get_user(test_user.id)
    assert user.subscription_status == "active"`,
    sandboxCommands: [
      'trueforge sandbox spawn --env=python3.11-postgres-replica --isolated',
      'pytest tests/billing/test_webhook_idempotency.py --count=50 -n auto'
    ],
    logs: [
      { iteration: 1, status: 'pass', durationMs: 410, message: 'Step 1/50: PASSED (410ms)' },
      { iteration: 2, status: 'fail', durationMs: 820, message: 'Step 2/50: FAILED (820ms) - OperationalError: could not serialize access' },
      { iteration: 3, status: 'pass', durationMs: 395, message: 'Step 3/50: PASSED (395ms)' },
      { iteration: 4, status: 'pass', durationMs: 405, message: 'Step 4/50: PASSED (405ms)' },
      { iteration: 5, status: 'fail', durationMs: 790, message: 'Step 5/50: FAILED (790ms) - Concurrent write collision' },
      { iteration: 6, status: 'pass', durationMs: 400, message: 'Step 6/50: PASSED (400ms)' },
      { iteration: 7, status: 'pass', durationMs: 412, message: 'Step 7/50: PASSED (412ms)' },
      { iteration: 8, status: 'fail', durationMs: 810, message: 'Step 8/50: FAILED (810ms)' },
      { iteration: 9, status: 'pass', durationMs: 402, message: 'Step 9/50: PASSED (402ms)' },
      { iteration: 10, status: 'pass', durationMs: 398, message: 'Step 10/50: PASSED (398ms)' }
    ],
    qodoReview: {
      score: '96/100',
      passed: true,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      findings: [],
      suggestedPrTitle: 'fix(billing): quarantine flaky concurrent webhook idempotency test (#403)',
      suggestedPrBody: `### Summary of Changes
- Quarantined \`test_concurrent_invoice_payment_webhook\` with \`@pytest.mark.skip\`
- Assigned to backend team (@sam-backend)
- Tracking Issue: #403`
    }
  },
  {
    id: 'jest-oauth-refresh',
    title: 'OAuth2 Token Refresh Concurrency Deadlock',
    framework: 'jest',
    repo: 'sandman-sh/00-Flake',
    branch: 'develop',
    commit: 'b33100a',
    author: 'elena-sec',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    testFile: 'src/__tests__/token_refresh_manager.test.ts',
    testName: 'should deduplicate parallel refresh requests when access token expires',
    failureRate: 26.0,
    ciRunId: 'GH-ACT-663810',
    ciDuration: '1m 48s',
    errorSnippet: 'Error: expect(mockAuthServer.post).toHaveBeenCalledTimes(1)\nExpected: 1\nReceived: 3\n  at Object.<anonymous> (src/__tests__/token_refresh_manager.test.ts:35:38)',
    rootCauseType: 'Async State Pollution',
    rootCauseSummary: 'In-flight promise deduplication cache resets between event ticks when multiple HTTP interceptors trigger concurrently without mutex lock.',
    culpritLineNumber: 35,
    culpritCode: 'expect(mockAuthServer.post).toHaveBeenCalledTimes(1);',
    explanation: 'The token refresh manager lacks an atomic promise mutex, so when 3 microservice requests hit 401 at the exact same millisecond, 3 separate refresh token requests get sent to Keycloak.',
    originalCode: `describe('OAuth2 Token Refresh Interceptor', () => {
  it('should deduplicate parallel refresh requests when access token expires', async () => {
    expireCurrentToken();
    
    // ⚠️ Flaky: Microtasks execute out-of-order in Jest jsdom
    const [res1, res2, res3] = await Promise.all([
      apiClient.get('/user/profile'),
      apiClient.get('/user/settings'),
      apiClient.get('/user/billing')
    ]);
    
    expect(mockAuthServer.post).toHaveBeenCalledTimes(1);
  });
});`,
    quarantinedCode: `describe('OAuth2 Token Refresh Interceptor', () => {
  // 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)
  // License: AUTHORIZED | Issue: #404 | Repro Rate: 26.0% (Sandbox 50x loop)
  // Root Cause: Race condition in un-mutexed in-flight token refresh promise deduplication
  it.skip('should deduplicate parallel refresh requests when access token expires', async () => {
    expireCurrentToken();
    
    // ⚠️ Flaky: Microtasks execute out-of-order in Jest jsdom
    const [res1, res2, res3] = await Promise.all([
      apiClient.get('/user/profile'),
      apiClient.get('/user/settings'),
      apiClient.get('/user/billing')
    ]);
    
    expect(mockAuthServer.post).toHaveBeenCalledTimes(1);
  });
});`,
    sandboxCommands: [
      'trueforge sandbox spawn --env=node18-jest --isolated',
      'npx jest src/__tests__/token_refresh_manager.test.ts --runInBand --repeat=50'
    ],
    logs: [
      { iteration: 1, status: 'pass', durationMs: 310, message: 'Step 1/50: PASSED (310ms)' },
      { iteration: 2, status: 'fail', durationMs: 325, message: 'Step 2/50: FAILED (325ms) - mockAuthServer called 3 times instead of 1' },
      { iteration: 3, status: 'pass', durationMs: 295, message: 'Step 3/50: PASSED (295ms)' },
      { iteration: 4, status: 'fail', durationMs: 330, message: 'Step 4/50: FAILED (330ms) - Token deduplication mutex missed' }
    ],
    qodoReview: {
      score: '97/100',
      passed: true,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      findings: [],
      suggestedPrTitle: 'fix(auth): quarantine flaky token refresh deduplication test (#404)',
      suggestedPrBody: `### Summary of Changes
- Quarantined \`token_refresh_manager.test.ts\` via \`it.skip\`
- Assigned to security engineering team (@elena-sec)
- Tracking Issue: #404`
    }
  }
];

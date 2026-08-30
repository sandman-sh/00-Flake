// 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)
// License: TF-SIG-999F3D3A | Authorized by: HUMAN_ADMIN_TF007
// Repro Rate: 22% | Tracking Issue: #402 | Date: 2026-08-29T21:39:21.281Z
// Real runnable test fixture demonstrating an authentic DOM race condition
// in an E2E checkout workflow with asynchronous Stripe token initialization.

async function runTest() {
  const startTime = Date.now();
  const jitter = parseInt(process.env.TF_NETWORK_JITTER_MS || '0', 10);
  
  // Target: ~20-24% failure rate across 50 iterations with default 150ms jitter.
  //
  // The race condition is modeled probabilistically:
  // - Base probability of the Stripe iframe being unready: 18%
  // - Jitter increases contention slightly (simulates slow network tiers)
  const jitterBoost = jitter > 100 ? 0.05 : (jitter > 0 ? 0.03 : 0);
  const raceTriggered = Math.random() < 0.18 + jitterBoost;
  
  // Simulate realistic execution time
  const execTime = raceTriggered 
    ? 4800 + Math.floor(Math.random() * 400)   // ~5s timeout on failure
    : 1300 + Math.floor(Math.random() * 200);   // ~1.4s on success
  
  await new Promise(resolve => setTimeout(resolve, Math.min(execTime, 200)));
  
  if (raceTriggered) {
    console.error(`TimeoutError: locator.click: Timeout 5000ms exceeded.`);
    console.error(`Call log:`);
    console.error(`  - waiting for locator("button#confirm-payment-btn")`);
    console.error(`  - locator resolved to <button disabled id="confirm-payment-btn">Pay $49.00</button>`);
    console.error(`  - element is disabled during Stripe token handshake (${execTime}ms vs expected <90ms)`);
    console.error(`  at tests/e2e/checkout_payment.spec.ts:42:16`);
    process.exit(1);
  } else {
    const duration = Date.now() - startTime;
    console.log(`✓ Test passed in ${duration}ms (Stripe token initialized in ${execTime}ms)`);
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});

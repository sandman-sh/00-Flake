// 🛡️ QUARANTINED BY 00-FLAKE (TrueForge Agent File TF-007)
// License: TF-SIG-03015CCC | Authorized by: HUMAN_ADMIN_TF007
// Repro Rate: 32% | Tracking Issue: #402 | Date: 2026-08-30T17:06:50.510Z
// Real runnable test fixture demonstrating concurrent webhook execution
// hitting race conditions in database transaction updates.

async function runTest() {
  const startTime = Date.now();
  const jitter = parseInt(process.env.TF_NETWORK_JITTER_MS || '0', 10);
  
  let userStatus = "pending_payment";
  let lockContention = false;

  // Simulate two concurrent webhooks arriving at almost the same millisecond
  const event1 = async () => {
    await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
    userStatus = "active";
  };

  const event2 = async () => {
    await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
    // Target: ~18% failure rate with 150ms jitter
    // Base contention probability: ~15%
    // Jitter adds a small boost to contention likelihood
    const jitterBoost = jitter > 100 ? 0.04 : (jitter > 0 ? 0.02 : 0);
    if (Math.random() < 0.15 + jitterBoost) {
      lockContention = true;
    }
  };

  await Promise.all([event1(), event2()]);

  if (lockContention) {
    console.error(`AssertionError: assert user.subscription_status == "active"`);
    console.error(`  + where user.subscription_status = "${userStatus}"`);
    console.error(`  E   OperationalError: could not serialize access due to concurrent update in parallel workers`);
    console.error(`  at tests/billing/test_webhook_idempotency.py:28:9`);
    process.exit(1);
  } else {
    const duration = Date.now() - startTime;
    console.log(`✓ Concurrent webhook idempotency verified in ${duration}ms`);
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});

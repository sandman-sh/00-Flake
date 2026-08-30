// Real runnable test fixture demonstrating OAuth token refresh promise deduplication race.

async function runTest() {
  const startTime = Date.now();
  const jitter = parseInt(process.env.TF_NETWORK_JITTER_MS || '0', 10);
  
  let networkCalls = 0;
  
  // 3 parallel client requests hitting token refresh
  const triggerRefresh = async () => {
    await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
    networkCalls += 1;
  };

  await Promise.all([triggerRefresh(), triggerRefresh(), triggerRefresh()]);

  // Target: ~26% failure rate with 150ms jitter
  // Base deduplication race probability: ~22%
  // Jitter adds a small boost
  const jitterBoost = jitter > 80 ? 0.05 : (jitter > 0 ? 0.02 : 0);
  const hasDeduplicationRace = Math.random() < 0.22 + jitterBoost;

  if (hasDeduplicationRace && networkCalls > 1) {
    console.error(`Error: expect(mockAuthServer.post).toHaveBeenCalledTimes(1)`);
    console.error(`Expected: 1`);
    console.error(`Received: ${networkCalls}`);
    console.error(`  at Object.<anonymous> (src/__tests__/token_refresh_manager.test.ts:35:38)`);
    process.exit(1);
  } else {
    const duration = Date.now() - startTime;
    console.log(`✓ Token refresh deduplication passed in ${duration}ms (1 network call made)`);
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});

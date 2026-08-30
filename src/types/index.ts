export interface Scenario {
  id: string;
  title: string;
  framework: 'playwright' | 'pytest' | 'jest' | 'cypress';
  repo: string;
  branch: string;
  commit: string;
  author: string;
  authorAvatar: string;
  testFile: string;
  testName: string;
  failureRate: number; // e.g. 24%
  ciRunId: string;
  ciDuration: string;
  errorSnippet: string;
  rootCauseType: 'Race Condition (DOM)' | 'Network Latency / Webhook Race' | 'Async State Pollution' | 'Resource Starvation';
  rootCauseSummary: string;
  culpritLineNumber: number;
  culpritCode: string;
  explanation: string;
  originalCode: string;
  quarantinedCode: string;
  sandboxCommands: string[];
  logs: {
    iteration: number;
    status: 'pass' | 'fail';
    durationMs: number;
    message: string;
    stackTrace?: string;
  }[];
  qodoReview: {
    score: string;
    passed: boolean;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    findings: {
      severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
      title: string;
      description: string;
      resolution: string;
      dismissed?: boolean;
    }[];
    suggestedPrTitle: string;
    suggestedPrBody: string;
  };
}

export interface QuarantinedTestRecord {
  id: string;
  scenarioId: string;
  testFile: string;
  testName: string;
  repo: string;
  quarantinedAt: string;
  prNumber: number;
  issueNumber: number;
  reproducedRate: string;
  authorizedBy: string;
  licenseHash: string;
  qodoAuditStatus: 'VERIFIED' | 'REVIEW_PASSED';
}

export interface StressConfig {
  iterations: number;
  networkJitterMs: number;
  cpuThrottleMultiplier: number;
  concurrencyWorkers: number;
}

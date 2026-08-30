import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { MissionControl } from './components/MissionControl';
import { QuarantinedTestRecord } from './types';
import './styles/cyber-noir.css';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'mission-control'>('landing');
  
  // Persistent Quarantine Vault records
  const [quarantinedRecords, setQuarantinedRecords] = useState<QuarantinedTestRecord[]>(() => {
    try {
      const saved = localStorage.getItem('00_FLAKE_QUARANTINE_RECORDS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load quarantine records from localStorage', e);
    }
    return [
      {
        id: 'QUARANTINE-INIT-1',
        scenarioId: 'playwright-checkout-race',
        testFile: 'tests/e2e/checkout_payment.spec.ts',
        testName: 'should complete Stripe 3D-Secure payment flow within timeout',
        repo: 'sandman-sh/00-Flake',
        quarantinedAt: '08:42 PM',
        prNumber: 142,
        issueNumber: 402,
        reproducedRate: '22.0%',
        authorizedBy: 'HUMAN_ADMIN_TF007',
        licenseHash: 'TF-SIG-98A12F',
        qodoAuditStatus: 'REVIEW_PASSED'
      }
    ];
  });

  // Save records to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('00_FLAKE_QUARANTINE_RECORDS', JSON.stringify(quarantinedRecords));
    } catch (e) {
      console.error('Failed to save quarantine records', e);
    }
  }, [quarantinedRecords]);

  const handleAddQuarantineRecord = (record: QuarantinedTestRecord) => {
    setQuarantinedRecords(prev => [record, ...prev]);
  };

  const handleClearRecords = () => {
    setQuarantinedRecords([]);
  };

  return (
    <div className="app-root">
      {/* Subtle Tactical Scanline Overlay */}
      <div className="scanline-overlay"></div>

      {currentView === 'landing' ? (
        <LandingPage 
          onLaunchApp={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentView('mission-control');
          }} 
        />
      ) : (
        <MissionControl 
          onBackToLanding={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentView('landing');
          }}
          quarantinedRecords={quarantinedRecords}
          onAddQuarantineRecord={handleAddQuarantineRecord}
          onClearRecords={handleClearRecords}
        />
      )}
    </div>
  );
};

export default App;

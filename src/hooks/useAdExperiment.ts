import { useMemo } from 'react';

const EXPERIMENT_KEY = 'wjl_ad_experiment';

interface ExperimentGroup {
  /** 'test' = ads enabled, 'control' = ads disabled */
  group: 'test' | 'control';
  /** Whether ads should be shown for this user */
  showAds: boolean;
}

/**
 * A/B experiment hook for ad display.
 *
 * On first visit, randomly assigns the user to a test (90%) or control (10%) group
 * and persists the assignment in localStorage so it stays consistent across sessions.
 *
 * @param testPercent – percentage of users who see ads (0-100, default 90)
 */
export function useAdExperiment(testPercent = 90): ExperimentGroup {
  return useMemo(() => {
    const stored = localStorage.getItem(EXPERIMENT_KEY);

    if (stored === 'test' || stored === 'control') {
      return { group: stored, showAds: stored === 'test' };
    }

    // Assign new user to a group
    const group = Math.random() * 100 < testPercent ? 'test' : 'control';
    localStorage.setItem(EXPERIMENT_KEY, group);

    return { group, showAds: group === 'test' };
  }, [testPercent]);
}

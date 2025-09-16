'use client';

import { useState, useEffect } from 'react';
import {
  BenchmarkState,
  BenchmarkConfig,
} from '@/types/benchmark';
import { performanceBenchmark } from '@/lib/performance/benchmark';
import { exportResults } from '@/lib/benchmark/utils';

const initialState: BenchmarkState = {
  results: [],
  suites: [],
  isRunning: false,
  currentSuite: '',
  config: {
    iterations: 10,
    warmup: 3,
    timeout: 30000,
  },
  summary: null,
  showConfig: false,
  selectedTab: 'overview',
};

export function useBenchmark() {
  const [state, setState] = useState<BenchmarkState>(initialState);

  useEffect(() => {
    loadSuites();
    loadResults();
  }, []);

  const loadSuites = () => {
    const suites = performanceBenchmark.getSuites() as any[];
    setState({
      results: state.results,
      suites,
      isRunning: state.isRunning,
      currentSuite: state.currentSuite,
      config: state.config,
      summary: state.summary,
      showConfig: state.showConfig,
      selectedTab: state.selectedTab,
    });
  };

  const loadResults = () => {
    const results = performanceBenchmark.getResults() as any[];
    const summary = performanceBenchmark.getSummary() as any;
    setState({
      results: results as any,
      suites: state.suites,
      isRunning: state.isRunning,
      currentSuite: state.currentSuite,
      config: state.config,
      summary: summary as any,
      showConfig: state.showConfig,
      selectedTab: state.selectedTab,
    });
  };

  const runBenchmark = async (suiteId?: string) => {
    if (state.isRunning) return;

    setState((prev: BenchmarkState) => ({
      ...prev,
      isRunning: true,
      currentSuite: suiteId || 'all',
    }));

    try {
      const newResults = await performanceBenchmark.runBenchmark(suiteId);
      const summary = performanceBenchmark.getSummary();
      setState({
        results: newResults as any,
        suites: state.suites,
        isRunning: false,
        currentSuite: state.currentSuite,
        config: state.config,
        summary: summary as any,
        showConfig: state.showConfig,
        selectedTab: state.selectedTab,
      });
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setState((prev: BenchmarkState) => ({
        ...prev,
        isRunning: false,
        currentSuite: '',
      }));
    }
  };

  const runAllBenchmarks = () => runBenchmark();
  const runSpecificSuite = (suiteId: string) => runBenchmark(suiteId);

  const clearResults = () => {
    performanceBenchmark.clearResults();
    setState((prev: BenchmarkState) => ({
      ...prev,
      results: [],
      summary: null,
    }));
  };

  const exportResultsData = () => {
    const data = performanceBenchmark.exportResults();
    exportResults(data);
  };

  const updateConfig = (newConfig: Partial<BenchmarkConfig>) => {
    const updatedConfig = { ...state.config, ...newConfig };
    setState((prev: BenchmarkState) => ({ ...prev, config: updatedConfig }));
    performanceBenchmark.updateConfig(updatedConfig);
  };

  const updateState = (updates: Partial<BenchmarkState>) => {
    setState((prev: BenchmarkState) => ({ ...prev, ...updates }));
  };

  return {
    ...state,
    runAllBenchmarks,
    runSpecificSuite,
    clearResults,
    exportResults: exportResultsData,
    updateConfig,
    updateState,
  };
}

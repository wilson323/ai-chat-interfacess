'use client';

import { useState, useEffect } from 'react';
import {
  OptimizationState,
  OptimizationFilters,
} from '@/types/optimization';
import { enhancedMonitor } from '@/lib/performance/enhanced-monitor';
import {
  performOptimizationAnalysis,
  calculateCategoryBreakdown,
  filterOptimizations,
} from '@/lib/optimization/utils';

const initialState: OptimizationState = {
  optimizations: [],
  analysis: null,
  categories: [],
  currentSummary: null,
  filters: {
    category: 'all',
    impact: 'all',
    difficulty: 'all',
  },
  isAnalyzing: false,
  selectedTab: 'overview',
};

export function useOptimization() {
  const [state, setState] = useState<OptimizationState>(initialState);

  useEffect(() => {
    loadOptimizations();
    loadCurrentSummary();
  }, []);

  const loadOptimizations = async () => {
    setState((prev: OptimizationState) => ({ ...prev, isAnalyzing: true }));

    try {
      const allOptimizations = enhancedMonitor.getOptimizations();
      const analysis = performOptimizationAnalysis(allOptimizations);
      const categories = calculateCategoryBreakdown(allOptimizations);

      setState((prev: OptimizationState) => ({
        ...prev,
        optimizations: allOptimizations,
        analysis,
        categories,
        isAnalyzing: false,
      }));
    } catch (error) {
      console.error('Failed to load optimizations:', error);
      setState((prev: OptimizationState) => ({ ...prev, isAnalyzing: false }));
    }
  };

  const loadCurrentSummary = async () => {
    try {
      const summary = enhancedMonitor.getEnhancedSummary();
      setState({
        optimizations: state.optimizations,
        analysis: state.analysis,
        categories: state.categories,
        currentSummary: summary as any,
        filters: state.filters,
        isAnalyzing: state.isAnalyzing,
        selectedTab: state.selectedTab,
      });
    } catch (error) {
      console.error('Failed to load current summary:', error);
    }
  };

  const updateFilters = (newFilters: Partial<OptimizationFilters>) => {
    setState({
      optimizations: state.optimizations,
      analysis: state.analysis,
      categories: state.categories,
      currentSummary: state.currentSummary,
      filters: { ...state.filters, ...newFilters },
      isAnalyzing: state.isAnalyzing,
      selectedTab: state.selectedTab,
    });
  };

  const applyOptimization = async (id: string) => {
    try {
      // 这里可以添加应用优化的逻辑
      console.log('Applying optimization:', id);
      // 可以调用API来应用优化
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    }
  };

  const viewDetails = (id: string) => {
    // 这里可以添加查看详情的逻辑
    console.log('Viewing details for optimization:', id);
  };

  const updateState = (updates: Partial<OptimizationState>) => {
    setState((prev: OptimizationState) => ({ ...prev, ...updates }));
  };

  // 获取过滤后的优化建议
  const filteredOptimizations = filterOptimizations(
    state.optimizations,
    state.filters
  );

  return {
    ...state,
    filteredOptimizations,
    updateFilters,
    applyOptimization,
    viewDetails,
    updateState,
    loadOptimizations,
  };
}

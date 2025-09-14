/**
 * 语音配置管理 Hook
 * 处理配置的读取、保存和验证
 */

import { useState, useEffect, useCallback } from 'react';
import { VoiceConfig, UseVoiceConfigReturn } from '@/types/voice';
import {
  getVoiceConfig,
  saveVoiceConfig,
  resetVoiceConfig,
  validateVoiceConfig,
  getConfigStatus,
  mergeConfigs,
  getEnvConfig,
} from '@/lib/voice/config';

/**
 * 语音配置管理 Hook
 */
export function useVoiceConfig(): UseVoiceConfigReturn {
  const [config, setConfig] = useState<VoiceConfig>(() => getVoiceConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newConfig };

      // 验证配置
      const validationErrors = validateVoiceConfig(updatedConfig);
      setErrors(validationErrors);

      // 保存到本地存储
      try {
        saveVoiceConfig(newConfig);
      } catch (error) {
        console.warn('Failed to save voice config:', error);
      }

      return updatedConfig;
    });
  }, []);

  /**
   * 重置配置
   */
  const resetConfig = useCallback(() => {
    try {
      resetVoiceConfig();
      const defaultConfig = getVoiceConfig();
      setConfig(defaultConfig);
      setErrors([]);
    } catch (error) {
      console.warn('Failed to reset voice config:', error);
    }
  }, []);

  /**
   * 从服务器获取配置
   */
  const fetchServerConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/voice/config');
      if (response.ok) {
        const serverConfig = await response.json();
        updateConfig(serverConfig);
      }
    } catch (error) {
      console.warn('Failed to fetch server config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateConfig]);

  /**
   * 保存配置到服务器
   */
  const saveToServer = useCallback(
    async (configToSave?: Partial<VoiceConfig>) => {
      const dataToSave = configToSave || config;
      setIsLoading(true);

      try {
        const response = await fetch('/api/voice/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error(`Failed to save config: ${response.statusText}`);
        }

        return true;
      } catch (error) {
        console.error('Failed to save config to server:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  /**
   * 测试配置
   */
  const testConfig = useCallback(
    async (testConfig?: Partial<VoiceConfig>) => {
      const configToTest = testConfig
        ? mergeConfigs(config, testConfig)
        : config;

      try {
        const response = await fetch('/api/voice/health', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiUrl: configToTest.apiUrl,
            apiKey: configToTest.apiKey,
          }),
        });

        return response.ok;
      } catch (error) {
        console.warn('Config test failed:', error);
        return false;
      }
    },
    [config]
  );

  /**
   * 初始化配置
   */
  useEffect(() => {
    const initializeConfig = () => {
      try {
        // 合并环境变量配置
        const envConfig = getEnvConfig();
        const localConfig = getVoiceConfig();
        const mergedConfig = mergeConfigs(localConfig, envConfig);

        setConfig(mergedConfig);

        // 验证配置
        const validationErrors = validateVoiceConfig(mergedConfig);
        setErrors(validationErrors);
      } catch (error) {
        console.warn('Failed to initialize voice config:', error);
      }
    };

    initializeConfig();
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    isLoading,
    errors,
    fetchServerConfig,
    saveToServer,
    testConfig,
  };
}

/**
 * 配置状态 Hook
 */
export function useVoiceConfigStatus() {
  const { config } = useVoiceConfig();

  const status = getConfigStatus(config);

  return {
    ...status,
    config,
  };
}

/**
 * 配置验证 Hook
 */
export function useVoiceConfigValidation(config: Partial<VoiceConfig>) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validationErrors = validateVoiceConfig(config);
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
  }, [config]);

  return {
    errors,
    isValid,
  };
}

/**
 * 配置预设 Hook
 */
export function useVoiceConfigPresets() {
  const { updateConfig } = useVoiceConfig();

  const presets = {
    // 高质量配置
    highQuality: {
      maxDuration: 120,
      sampleRate: 48000,
      language: 'zh',
    },

    // 快速配置
    fast: {
      maxDuration: 30,
      sampleRate: 16000,
      language: 'zh',
    },

    // 移动端优化配置
    mobile: {
      maxDuration: 60,
      sampleRate: 22050,
      language: 'zh',
    },

    // 开发测试配置
    development: {
      maxDuration: 10,
      sampleRate: 16000,
      language: 'zh',
      apiUrl: 'http://localhost:3000/api/voice/transcribe',
    },
  };

  const applyPreset = useCallback(
    (presetName: keyof typeof presets) => {
      const preset = presets[presetName];
      if (preset) {
        updateConfig(preset);
      }
    },
    [updateConfig]
  );

  return {
    presets,
    applyPreset,
  };
}

/**
 * 配置导入导出 Hook
 */
export function useVoiceConfigImportExport() {
  const { config, updateConfig } = useVoiceConfig();

  const exportConfig = useCallback(() => {
    const exportData = {
      ...config,
      // 移除敏感信息
      apiKey: config.apiKey ? '***' : '',
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }, [config]);

  const importConfig = useCallback(
    (file: File) => {
      return new Promise<boolean>(resolve => {
        const reader = new FileReader();

        reader.onload = event => {
          try {
            const content = event.target?.result as string;
            const importedConfig = JSON.parse(content);

            // 验证配置
            const errors = validateVoiceConfig(importedConfig);
            if (errors.length > 0) {
              console.error('Invalid config:', errors);
              resolve(false);
              return;
            }

            // 移除元数据
            const { exportedAt, version, ...configData } = importedConfig;
            updateConfig(configData);
            resolve(true);
          } catch (error) {
            console.error('Failed to import config:', error);
            resolve(false);
          }
        };

        reader.onerror = () => {
          console.error('Failed to read config file');
          resolve(false);
        };

        reader.readAsText(file);
      });
    },
    [updateConfig]
  );

  return {
    exportConfig,
    importConfig,
  };
}

/**
 * 配置同步 Hook
 * 在多个标签页之间同步配置
 */
export function useVoiceConfigSync() {
  const { config, updateConfig } = useVoiceConfig();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'voice-config' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          updateConfig(newConfig);
        } catch (error) {
          console.warn('Failed to sync config from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateConfig]);

  return config;
}

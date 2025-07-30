/**
 * Analysis Configuration Management
 * This module handles configuration for the analysis engine,
 * allowing easy expansion and customization of analysis capabilities
 */

export interface AnalysisConfiguration {
  // Core settings
  enabled: boolean;
  version: string;
  mode: 'standard' | 'advanced' | 'custom';
  
  // Module configuration
  modules: {
    player: ModuleConfig;
    tactical: ModuleConfig;
    statistical: ModuleConfig;
    transition: ModuleConfig;
    faceoff: ModuleConfig;
    // Add new modules here as the system grows
  };
  
  // AI settings
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
    multiPass: boolean;
    passCount: number;
  };
  
  // Performance settings
  performance: {
    maxConcurrentAnalyses: number;
    timeoutSeconds: number;
    retryAttempts: number;
  };
  
  // Output preferences
  output: {
    detailLevel: 'minimal' | 'standard' | 'comprehensive' | 'maximum';
    includeConfidenceScores: boolean;
    includeTimestamps: boolean;
    includeRecommendations: boolean;
  };
}

export interface ModuleConfig {
  enabled: boolean;
  priority: number; // 1-10, higher = more important
  customPrompts?: string[];
  focusAreas?: string[];
  outputFormat?: 'detailed' | 'summary';
}

// Default configuration
export const defaultAnalysisConfig: AnalysisConfiguration = {
  enabled: true,
  version: '1.0.0',
  mode: 'advanced',
  
  modules: {
    player: {
      enabled: true,
      priority: 9,
      focusAreas: ['biomechanics', 'technique', 'decision-making'],
      outputFormat: 'detailed'
    },
    tactical: {
      enabled: true,
      priority: 8,
      focusAreas: ['formations', 'plays', 'coordination'],
      outputFormat: 'detailed'
    },
    statistical: {
      enabled: true,
      priority: 7,
      focusAreas: ['goals', 'assists', 'turnovers', 'faceoffs'],
      outputFormat: 'summary'
    },
    transition: {
      enabled: true,
      priority: 6,
      focusAreas: ['clears', 'rides', 'fast-breaks'],
      outputFormat: 'detailed'
    },
    faceoff: {
      enabled: true,
      priority: 8,
      focusAreas: ['technique', 'wing-play', 'exits'],
      outputFormat: 'detailed'
    }
  },
  
  ai: {
    model: 'gemini-2.5-pro',
    temperature: 0.7,
    maxTokens: 8000,
    multiPass: true,
    passCount: 3
  },
  
  performance: {
    maxConcurrentAnalyses: 3,
    timeoutSeconds: 300,
    retryAttempts: 2
  },
  
  output: {
    detailLevel: 'comprehensive',
    includeConfidenceScores: true,
    includeTimestamps: true,
    includeRecommendations: true
  }
};

// Configuration manager class
export class AnalysisConfigManager {
  private static config: AnalysisConfiguration = defaultAnalysisConfig;
  
  static getConfig(): AnalysisConfiguration {
    return { ...this.config };
  }
  
  static updateConfig(updates: Partial<AnalysisConfiguration>): void {
    this.config = { ...this.config, ...updates };
    console.log('Analysis configuration updated:', this.config);
  }
  
  static getModuleConfig(moduleName: keyof AnalysisConfiguration['modules']): ModuleConfig {
    return this.config.modules[moduleName];
  }
  
  static isModuleEnabled(moduleName: keyof AnalysisConfiguration['modules']): boolean {
    return this.config.modules[moduleName]?.enabled || false;
  }
  
  static getEnabledModules(): string[] {
    return Object.entries(this.config.modules)
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => b[1].priority - a[1].priority)
      .map(([name]) => name);
  }
  
  static getAISettings() {
    return this.config.ai;
  }
  
  static getOutputSettings() {
    return this.config.output;
  }
  
  // Preset configurations for different use cases
  static applyPreset(preset: 'quick' | 'standard' | 'comprehensive' | 'recruiting' | 'coaching'): void {
    switch (preset) {
      case 'quick':
        this.updateConfig({
          mode: 'standard',
          ai: { ...this.config.ai, multiPass: false, passCount: 1 },
          output: { ...this.config.output, detailLevel: 'minimal' }
        });
        break;
        
      case 'comprehensive':
        this.updateConfig({
          mode: 'advanced',
          ai: { ...this.config.ai, multiPass: true, passCount: 5 },
          output: { ...this.config.output, detailLevel: 'maximum' }
        });
        break;
        
      case 'recruiting':
        this.updateConfig({
          modules: {
            ...this.config.modules,
            player: { ...this.config.modules.player, priority: 10 },
            statistical: { ...this.config.modules.statistical, priority: 9 }
          }
        });
        break;
        
      case 'coaching':
        this.updateConfig({
          modules: {
            ...this.config.modules,
            tactical: { ...this.config.modules.tactical, priority: 10 },
            transition: { ...this.config.modules.transition, priority: 9 }
          }
        });
        break;
    }
  }
}

// Export for use in other modules
export function getAnalysisConfig(): AnalysisConfiguration {
  return AnalysisConfigManager.getConfig();
}

export function updateAnalysisConfig(updates: Partial<AnalysisConfiguration>): void {
  AnalysisConfigManager.updateConfig(updates);
}
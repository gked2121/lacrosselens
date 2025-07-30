/**
 * Analysis Module Registry
 * Central registry for all analysis modules
 * Allows dynamic loading and configuration of modules
 */

import { AnalysisModule } from './baseAnalysisModule';
import { PlayerAnalysisModule } from './playerAnalysisModule';
import { TacticalAnalysisModule } from './tacticalAnalysisModule';
import { StatisticalAnalysisModule } from './statisticalAnalysisModule';
import { TransitionAnalysisModule } from './transitionAnalysisModule';
import { FaceoffAnalysisModule } from './faceoffAnalysisModule';

export class AnalysisRegistry {
  private static modules: Map<string, AnalysisModule> = new Map();
  private static initialized = false;
  
  static initialize(): void {
    if (this.initialized) return;
    
    // Register core modules
    this.registerModule(new PlayerAnalysisModule());
    this.registerModule(new TacticalAnalysisModule());
    this.registerModule(new StatisticalAnalysisModule());
    this.registerModule(new TransitionAnalysisModule());
    this.registerModule(new FaceoffAnalysisModule());
    
    this.initialized = true;
    console.log(`Analysis Registry initialized with ${this.modules.size} modules`);
  }
  
  static registerModule(module: AnalysisModule): void {
    if (this.modules.has(module.name)) {
      console.warn(`Module ${module.name} already registered, replacing...`);
    }
    
    this.modules.set(module.name, module);
    console.log(`Registered analysis module: ${module.name} v${module.version}`);
  }
  
  static getModule(name: string): AnalysisModule | undefined {
    return this.modules.get(name);
  }
  
  static getAllModules(): AnalysisModule[] {
    return Array.from(this.modules.values());
  }
  
  static getEnabledModules(): AnalysisModule[] {
    return this.getAllModules().filter(module => module.isEnabled());
  }
  
  static getModulesByCategory(category: string): AnalysisModule[] {
    // Categories could be: player, team, statistical, tactical, etc.
    return this.getAllModules().filter(module => 
      module.name.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  static unregisterModule(name: string): boolean {
    return this.modules.delete(name);
  }
  
  static getModuleInfo(): Array<{name: string, version: string, description: string, enabled: boolean}> {
    return this.getAllModules().map(module => ({
      name: module.name,
      version: module.version,
      description: module.description,
      enabled: module.isEnabled()
    }));
  }
}

// Initialize registry on import
AnalysisRegistry.initialize();

// Export for use in other parts of the system
export function getAnalysisModules(): AnalysisModule[] {
  return AnalysisRegistry.getEnabledModules();
}

export function getAnalysisModule(name: string): AnalysisModule | undefined {
  return AnalysisRegistry.getModule(name);
}

export function registerCustomModule(module: AnalysisModule): void {
  AnalysisRegistry.registerModule(module);
}
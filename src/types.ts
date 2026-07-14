export interface ScriptConfig {
  delayMs: number;
  autoClose: boolean;
  onlyInTabletMode: boolean;
  useAdvancedUIA: boolean;
  debugMode: boolean;
  soundOnTrigger: boolean;
  tabtipPath: string;
  whitelist: string[];
  blacklist: string[];
}

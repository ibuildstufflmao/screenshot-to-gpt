export interface AppConfig {
  apiKey: string;
  defaultPrompt: string;
  copyToClipboard: boolean;
  startWithWindows: boolean;
  showNotifications: boolean;
  displayMode: 'notification' | 'window';
  hotkey: string;
  lastResult: string;
  selectedPrompt: string;
}

export interface PromptConfig {
  default: string;
  summarize: string;
  explain: string;
  extractText: string;
  identify: string;
  debug: string;
  translate: string;
  custom: (context?: any) => string;
}

export interface AppSettings {
  app: {
    name: string;
    version: string;
    defaultHotkey: string;
    copyToClipboard: boolean;
    startWithWindows: boolean;
    showNotifications: boolean;
    displayMode: 'notification' | 'window';
  };
  openai: {
    model: string;
  };
  prompts: PromptConfig;
  notifications: {
    title: string;
    showDuration: number;
    maxBodyLength: number;
  };
  customWindow: {
    displayDuration: number;
    fontSize: number;
    maxWidth: number;
    opacity: number;
    theme: 'dark' | 'light';
  };
  screenshot: {
    quality: number;
    maxWidth: number;
    maxHeight: number;
  };
  development: {
    logLevel: string;
    enableDebugMode: boolean;
  };
}

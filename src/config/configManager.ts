import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AppConfig, AppSettings } from '../types/config';

export class ConfigManager {
  private configPath: string;
  private config: AppConfig;
  private settings: AppSettings;
  private apiKey: string;

  constructor() {
    // Load environment variables
    dotenv.config();
    
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'user-config.json');
    
    // Load settings from config.js
    this.settings = this.loadSettings();
    
    // Load user preferences
    this.config = this.loadConfig();
    
    // Get API key from environment
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  private loadSettings(): AppSettings {
    try {
      const configPath = path.join(__dirname, '../../config.js');
      delete require.cache[require.resolve(configPath)];
      return require(configPath);
    } catch (error) {
      console.error('Error loading settings from config.js:', error);
      // Return default settings if config.js fails to load
      return {
        app: {
          name: 'Screenshot To GPT',
          version: '1.0.0',
          defaultHotkey: 'Ctrl+Shift+Space',
          copyToClipboard: true,
          startWithWindows: true,
          showNotifications: true,
          displayMode: 'notification' as 'notification' | 'window'
        },
        openai: {
          model: 'gpt-5',
        },
        prompts: {
          default: 'Analyze this screenshot and provide a brief summary of what you see.',
          summarize: 'Summarize the main content and key information visible in this screenshot.',
          explain: 'Explain what is happening in this screenshot in simple terms.',
          extractText: 'Extract and list all visible text from this screenshot.',
          identify: 'Identify the application, website, or interface shown in this screenshot.',
          debug: 'Help debug any issues visible in this screenshot. What might be wrong?',
          translate: 'Translate any visible text in this screenshot to English.',
          custom: () => 'Analyze this screenshot.'
        },
        notifications: {
          title: 'AI Result',
          showDuration: 5000,
          maxBodyLength: 100
        },
        customWindow: {
          displayDuration: 5000,
          fontSize: 14,
          maxWidth: 400,
          opacity: 0.85,
          theme: 'dark' as 'dark' | 'light'
        },
        screenshot: {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080
        },
        development: {
          logLevel: 'info',
          enableDebugMode: false
        }
      };
    }
  }

  private loadConfig(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = JSON.parse(data);
        return {
          apiKey: this.apiKey,
          defaultPrompt: this.settings.prompts.default,
          copyToClipboard: this.settings.app.copyToClipboard,
          startWithWindows: this.settings.app.startWithWindows,
          showNotifications: this.settings.app.showNotifications,
          displayMode: this.settings.app.displayMode,
          hotkey: this.settings.app.defaultHotkey,
          lastResult: '',
          selectedPrompt: 'default',
          ...loadedConfig
        };
      }
    } catch (error) {
      console.error('Error loading user config:', error);
    }
    
    return {
      apiKey: this.apiKey,
      defaultPrompt: this.settings.prompts.default,
      copyToClipboard: this.settings.app.copyToClipboard,
      startWithWindows: this.settings.app.startWithWindows,
      showNotifications: this.settings.app.showNotifications,
      displayMode: this.settings.app.displayMode,
      hotkey: this.settings.app.defaultHotkey,
      lastResult: '',
      selectedPrompt: 'default'
    };
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Only save user preferences, not the API key or settings
      const userConfig = {
        copyToClipboard: this.config.copyToClipboard,
        startWithWindows: this.config.startWithWindows,
        showNotifications: this.config.showNotifications,
        displayMode: this.config.displayMode,
        hotkey: this.config.hotkey,
        lastResult: this.config.lastResult,
        selectedPrompt: this.config.selectedPrompt
      };
      
      fs.writeFileSync(this.configPath, JSON.stringify(userConfig, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public getDefaultPrompt(): string {
    const selectedPrompt = this.config.selectedPrompt;
    if (selectedPrompt === 'custom') {
      return this.settings.prompts.custom();
    }
    const prompt = this.settings.prompts[selectedPrompt as keyof typeof this.settings.prompts];
    if (typeof prompt === 'string') {
      return prompt;
    }
    return this.settings.prompts.default;
  }

  public setSelectedPrompt(promptType: string): void {
    this.updateConfig({ selectedPrompt: promptType });
  }

  public getSelectedPrompt(): string {
    return this.config.selectedPrompt;
  }

  public getAvailablePrompts(): string[] {
    return Object.keys(this.settings.prompts).filter(key => key !== 'custom');
  }

  public isCopyToClipboard(): boolean {
    return this.config.copyToClipboard;
  }

  public setCopyToClipboard(enabled: boolean): void {
    this.updateConfig({ copyToClipboard: enabled });
  }

  public isStartWithWindows(): boolean {
    return this.config.startWithWindows;
  }

  public setStartWithWindows(enabled: boolean): void {
    this.updateConfig({ startWithWindows: enabled });
  }

  public isShowNotifications(): boolean {
    return this.config.showNotifications;
  }

  public setShowNotifications(enabled: boolean): void {
    this.updateConfig({ showNotifications: enabled });
  }

  public getDisplayMode(): 'notification' | 'window' {
    return this.config.displayMode;
  }

  public setDisplayMode(mode: 'notification' | 'window'): void {
    this.updateConfig({ displayMode: mode });
  }

  public getHotkey(): string {
    return this.config.hotkey;
  }

  public setHotkey(hotkey: string): void {
    this.updateConfig({ hotkey });
  }

  public getLastResult(): string {
    return this.config.lastResult;
  }

  public setLastResult(result: string): void {
    this.updateConfig({ lastResult: result });
  }

  public getOpenAISettings() {
    return this.settings.openai;
  }

  public getNotificationSettings() {
    return this.settings.notifications;
  }

  public getScreenshotSettings() {
    return this.settings.screenshot;
  }

  public getCustomWindowSettings() {
    return this.settings.customWindow;
  }

  public toggleCustomWindowTheme(): void {
    const currentTheme = this.settings.customWindow.theme;
    this.settings.customWindow.theme = currentTheme === 'dark' ? 'light' : 'dark';
    console.log(`[CONFIG] Custom window theme changed to: ${this.settings.customWindow.theme}`);
  }
}

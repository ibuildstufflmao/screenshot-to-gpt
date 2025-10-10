import { app, BrowserWindow } from 'electron';
import { ConfigManager } from './config/configManager';
import { OpenAIService } from './services/openaiService';
import { ScreenshotService } from './services/screenshotService';
import { NotificationService } from './services/notificationService';
import { CustomWindowService } from './services/customWindowService';
import { HotkeyService } from './services/hotkeyService';
import { TrayManager } from './tray/trayManager';

class ScreenShotToGPTApp {
  private configManager: ConfigManager;
  private openaiService: OpenAIService;
  private screenshotService: ScreenshotService;
  private notificationService: NotificationService;
  private customWindowService: CustomWindowService;
  private hotkeyService: HotkeyService;
  private trayManager: TrayManager;
  private isProcessing: boolean = false;

  constructor() {
    this.configManager = new ConfigManager();
    this.openaiService = new OpenAIService(this.configManager);
    this.screenshotService = new ScreenshotService();
    this.notificationService = new NotificationService(this.configManager);
    this.customWindowService = new CustomWindowService(this.configManager);
    this.hotkeyService = new HotkeyService(this.configManager);
    this.trayManager = new TrayManager(this.configManager);
  }

  public async initialize(): Promise<void> {
    // Create tray
    this.trayManager.createTray();
    this.setupTrayCallbacks();

    // Setup hotkeys
    this.hotkeyService.setHotkeyCallback(() => this.handleHotkeyPress());
    this.hotkeyService.setShowLastResultCallback(() => this.showLastResult());
    this.hotkeyService.registerHotkey();

    // Check if API key is configured
    if (!this.openaiService.isConfigured()) {
      this.notificationService.showError('⚠️ OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file');
    }
  }

  private setupTrayCallbacks(): void {
    this.trayManager.setToggleStartWithWindowsCallback(() => {
      const current = this.configManager.isStartWithWindows();
      this.configManager.setStartWithWindows(!current);
      this.trayManager.updateMenu();
    });

    this.trayManager.setToggleCopyToClipboardCallback(() => {
      const current = this.configManager.isCopyToClipboard();
      this.configManager.setCopyToClipboard(!current);
      this.trayManager.updateMenu();
    });

    this.trayManager.setToggleShowNotificationsCallback(() => {
      const current = this.configManager.isShowNotifications();
      this.configManager.setShowNotifications(!current);
      this.trayManager.updateMenu();
    });

    this.trayManager.setShowLastResultCallback(() => {
      const lastResult = this.configManager.getLastResult();
      if (lastResult) {
        this.notificationService.showResult(lastResult);
      } else {
        this.notificationService.showError('No previous result available');
      }
    });

    this.trayManager.setQuitCallback(() => {
      app.quit();
    });
  }

  private async handleHotkeyPress(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    console.log('[HOTKEY] Triggered');
    this.isProcessing = true;

    // Set tray icon to processing state (blue)
    this.trayManager.setIconState('processing');

    try {
      // Check if API key is configured
      if (!this.openaiService.isConfigured()) {
        this.notificationService.showError('⚠️ Couldn\'t get result. Try again.');
        this.trayManager.setIconState('error', true);
        return;
      }

      // Capture screenshot
      const imageBuffer = await this.screenshotService.captureFullScreen();
      
      // Analyze with OpenAI
      const result = await this.openaiService.analyzeScreenshot(imageBuffer);
      
      // Display result based on settings
      if (this.configManager.isShowNotifications()) {
        const displayMode = this.configManager.getDisplayMode();
        
        if (displayMode === 'window') {
          // Show in custom floating window
          this.customWindowService.showResult(result);
        } else {
          // Show as system notification
          this.notificationService.showResult(result);
        }
      } else {
        // Notifications disabled - still copy to clipboard if that setting is enabled
        if (this.configManager.isCopyToClipboard()) {
          this.notificationService.copyToClipboard(result);
        }
        console.log('[MAIN] Result ready. Use Ctrl+Shift+R to view.');
      }
      
      // Set tray icon to success state (green) with auto-reset
      this.trayManager.setIconState('success', true);
      
    } catch (error) {
      console.error('[ERROR] Processing failed:', error);
      this.notificationService.showError('⚠️ Couldn\'t get result. Try again.');
      
      // Set tray icon to error state (red) with auto-reset
      this.trayManager.setIconState('error', true);
    } finally {
      this.isProcessing = false;
    }
  }

  private showLastResult(): void {
    const lastResult = this.configManager.getLastResult();
    if (lastResult) {
      console.log('[HOTKEY] Showing last result');
      const displayMode = this.configManager.getDisplayMode();
      
      if (displayMode === 'window') {
        this.customWindowService.showResult(lastResult);
      } else {
        this.notificationService.showResult(lastResult);
      }
    } else {
      console.log('[HOTKEY] No previous result available');
      this.notificationService.showError('No previous result available');
    }
  }
}

// App initialization
const screenShotApp = new ScreenShotToGPTApp();

app.whenReady().then(async () => {
  await screenShotApp.initialize();
});

app.on('window-all-closed', () => {
  // Keep the app running even when all windows are closed (tray app)
});

app.on('activate', () => {
  // macOS specific - not needed for Windows
});

app.on('before-quit', () => {
  // Cleanup
  screenShotApp['hotkeyService'].unregisterHotkey();
  screenShotApp['customWindowService'].destroy();
  screenShotApp['trayManager'].destroy();
});

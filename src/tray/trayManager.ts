import { Tray, Menu, nativeImage, app, NativeImage } from 'electron';
import * as path from 'path';
import { ConfigManager } from '../config/configManager';

export type TrayIconState = 'idle' | 'processing' | 'success' | 'error';

export class TrayManager {
  private tray: Tray | null = null;
  private configManager: ConfigManager;
  private onToggleStartWithWindows: (() => void) | null = null;
  private onToggleCopyToClipboard: (() => void) | null = null;
  private onToggleShowNotifications: (() => void) | null = null;
  private onToggleDisplayMode: (() => void) | null = null;
  private onShowLastResult: (() => void) | null = null;
  private onQuit: (() => void) | null = null;
  
  // Icon state management
  private currentState: TrayIconState = 'idle';
  private iconPaths: Record<TrayIconState, string>;
  private stateResetTimer: NodeJS.Timeout | null = null;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    
    // Initialize icon paths
    this.iconPaths = {
      idle: path.join(__dirname, '../../assets/icon.png'),
      processing: path.join(__dirname, '../../assets/icon_blue.png'),
      success: path.join(__dirname, '../../assets/icon_green.png'),
      error: path.join(__dirname, '../../assets/icon_red.png')
    };
  }

  public createTray(): void {
    // Create tray with idle icon
    const icon = this.loadIcon('idle');
    this.tray = new Tray(icon);
    this.updateMenu();
  }

  private loadIcon(state: TrayIconState): NativeImage {
    const iconPath = this.iconPaths[state];
    const icon = nativeImage.createFromPath(iconPath);
    
    if (icon.isEmpty()) {
      console.warn(`[TRAY] Failed to load ${state} icon from ${iconPath}, using fallback`);
      // Create a simple colored square as fallback
      const fallback = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      return fallback;
    }
    
    return icon;
  }

  public setIconState(state: TrayIconState, autoReset: boolean = false): void {
    if (!this.tray) {
      console.warn('[TRAY] Cannot set icon state: tray not initialized');
      return;
    }

    // Clear any existing reset timer
    if (this.stateResetTimer) {
      clearTimeout(this.stateResetTimer);
      this.stateResetTimer = null;
    }

    // Update icon
    this.currentState = state;
    const icon = this.loadIcon(state);
    this.tray.setImage(icon);

    // Update tooltip based on state
    const tooltips: Record<TrayIconState, string> = {
      idle: 'Screenshot To GPT',
      processing: 'Screenshot To GPT - Processing...',
      success: 'Screenshot To GPT - Success!',
      error: 'Screenshot To GPT - Error'
    };
    this.tray.setToolTip(tooltips[state]);

    console.log(`[TRAY] Icon state changed to: ${state}`);

    // Auto-reset to idle state after delay
    if (autoReset && (state === 'success' || state === 'error')) {
      const resetDelay = state === 'success' ? 2000 : 3000; // 2s for success, 3s for error
      this.stateResetTimer = setTimeout(() => {
        this.setIconState('idle');
      }, resetDelay);
    }
  }

  public getCurrentState(): TrayIconState {
    return this.currentState;
  }

  public updateMenu(): void {
    if (!this.tray) return;

    const availablePrompts = this.configManager.getAvailablePrompts();
    const currentPrompt = this.configManager.getSelectedPrompt();
    
    const promptSubmenu: Electron.MenuItemConstructorOptions[] = availablePrompts.map(prompt => ({
      label: prompt.charAt(0).toUpperCase() + prompt.slice(1),
      type: 'radio',
      checked: prompt === currentPrompt,
      click: () => {
        this.configManager.setSelectedPrompt(prompt);
        this.updateMenu();
      }
    }));

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Start with Windows',
        type: 'checkbox',
        checked: this.configManager.isStartWithWindows(),
        click: () => {
          if (this.onToggleStartWithWindows) {
            this.onToggleStartWithWindows();
          }
        }
      },
      {
        label: 'Copy results to clipboard',
        type: 'checkbox',
        checked: this.configManager.isCopyToClipboard(),
        click: () => {
          if (this.onToggleCopyToClipboard) {
            this.onToggleCopyToClipboard();
          }
        }
      },
      {
        label: 'Show notifications on completion',
        type: 'checkbox',
        checked: this.configManager.isShowNotifications(),
        click: () => {
          if (this.onToggleShowNotifications) {
            this.onToggleShowNotifications();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Display Mode',
        submenu: [
          {
            label: 'Notification',
            type: 'radio',
            checked: this.configManager.getDisplayMode() === 'notification',
            click: () => {
              this.configManager.setDisplayMode('notification');
              this.updateMenu();
            }
          },
          {
            label: 'Floating Window',
            type: 'radio',
            checked: this.configManager.getDisplayMode() === 'window',
            click: () => {
              this.configManager.setDisplayMode('window');
              this.updateMenu();
            }
          }
        ]
      },
      {
        label: 'Window Theme',
        submenu: [
          {
            label: 'Dark',
            type: 'radio',
            checked: this.configManager.getCustomWindowSettings().theme === 'dark',
            click: () => {
              if (this.configManager.getCustomWindowSettings().theme !== 'dark') {
                this.configManager.toggleCustomWindowTheme();
                this.updateMenu();
              }
            }
          },
          {
            label: 'Light',
            type: 'radio',
            checked: this.configManager.getCustomWindowSettings().theme === 'light',
            click: () => {
              if (this.configManager.getCustomWindowSettings().theme !== 'light') {
                this.configManager.toggleCustomWindowTheme();
                this.updateMenu();
              }
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Prompt Type',
        submenu: promptSubmenu
      },
      { type: 'separator' },
      {
        label: 'Show last result',
        click: () => {
          if (this.onShowLastResult) {
            this.onShowLastResult();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          if (this.onQuit) {
            this.onQuit();
          }
        }
      }
    ];

    const contextMenu = Menu.buildFromTemplate(template);
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Screenshot To GPT');
  }

  public setToggleStartWithWindowsCallback(callback: () => void): void {
    this.onToggleStartWithWindows = callback;
  }

  public setToggleCopyToClipboardCallback(callback: () => void): void {
    this.onToggleCopyToClipboard = callback;
  }

  public setToggleShowNotificationsCallback(callback: () => void): void {
    this.onToggleShowNotifications = callback;
  }

  public setToggleDisplayModeCallback(callback: () => void): void {
    this.onToggleDisplayMode = callback;
  }

  public setShowLastResultCallback(callback: () => void): void {
    this.onShowLastResult = callback;
  }

  public setQuitCallback(callback: () => void): void {
    this.onQuit = callback;
  }

  public destroy(): void {
    // Clear any pending reset timer
    if (this.stateResetTimer) {
      clearTimeout(this.stateResetTimer);
      this.stateResetTimer = null;
    }
    
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

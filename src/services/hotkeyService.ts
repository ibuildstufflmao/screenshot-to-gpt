import { globalShortcut, app } from 'electron';
import { ConfigManager } from '../config/configManager';

export class HotkeyService {
  private configManager: ConfigManager;
  private currentHotkey: string | null = null;
  private onHotkeyPressed: (() => void) | null = null;
  private onShowLastResult: (() => void) | null = null;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public setHotkeyCallback(callback: () => void): void {
    this.onHotkeyPressed = callback;
  }

  public setShowLastResultCallback(callback: () => void): void {
    this.onShowLastResult = callback;
  }

  public registerHotkey(): boolean {
    // Unregister existing hotkeys first
    this.unregisterHotkey();

    const hotkey = this.configManager.getHotkey();
    const accelerator = this.parseHotkey(hotkey);
    const showResultAccelerator = 'CommandOrControl+Shift+R';

    try {
      // Register main hotkey
      const mainSuccess = globalShortcut.register(accelerator, () => {
        if (this.onHotkeyPressed) {
          this.onHotkeyPressed();
        }
      });

      // Register show last result hotkey
      const showResultSuccess = globalShortcut.register(showResultAccelerator, () => {
        if (this.onShowLastResult) {
          this.onShowLastResult();
        }
      });

      if (mainSuccess && showResultSuccess) {
        this.currentHotkey = accelerator;
        console.log(`[HOTKEY] Main hotkey registered: ${accelerator}`);
        console.log(`[HOTKEY] Show result hotkey registered: ${showResultAccelerator}`);
        return true;
      } else {
        console.error(`[HOTKEY] Failed to register hotkeys`);
        return false;
      }
    } catch (error) {
      console.error('[HOTKEY] Error registering hotkeys:', error);
      return false;
    }
  }

  public unregisterHotkey(): void {
    if (this.currentHotkey) {
      globalShortcut.unregister(this.currentHotkey);
      this.currentHotkey = null;
    }
    // Also unregister the show result hotkey
    globalShortcut.unregister('CommandOrControl+Shift+R');
  }

  public updateHotkey(newHotkey: string): void {
    this.configManager.setHotkey(newHotkey);
    this.registerHotkey();
  }

  private parseHotkey(hotkey: string): string {
    // Convert "Ctrl+Shift+Space" to "CommandOrControl+Shift+Space"
    return hotkey.replace(/Ctrl/g, 'CommandOrControl');
  }

  public isRegistered(): boolean {
    return this.currentHotkey !== null;
  }

  public getCurrentHotkey(): string | null {
    return this.currentHotkey;
  }
}

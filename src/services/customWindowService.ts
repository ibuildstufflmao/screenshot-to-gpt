import { BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
import { ConfigManager } from '../config/configManager';

export class CustomWindowService {
  private window: BrowserWindow | null = null;
  private configManager: ConfigManager;
  private hideTimer: NodeJS.Timeout | null = null;
  private escapeShortcutRegistered: boolean = false;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public showResult(result: string): void {
    const settings = this.configManager.getCustomWindowSettings();
    
    // Close any existing window
    this.closeWindow();

    // Get screen dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Create window
    this.window = new BrowserWindow({
      width: settings.maxWidth,
      height: 200, // Will auto-adjust based on content
      x: screenWidth - settings.maxWidth - 20, // 20px from right edge
      y: screenHeight - 220, // 220px from bottom
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // Make window completely pass-through (non-intrusive)
    this.window.setIgnoreMouseEvents(true);

    // Load the HTML content
    const htmlContent = this.generateHTML(result, settings);
    this.window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Show window
    this.window.show();

    // Register Escape key to manually close if needed
    this.registerEscapeKey();

    // Set auto-hide timer - this is the primary close mechanism
    console.log(`[CUSTOM WINDOW] Setting timer for ${settings.displayDuration}ms`);
    this.hideTimer = setTimeout(() => {
      console.log('[CUSTOM WINDOW] Timer expired, closing window');
      this.closeWindow();
    }, settings.displayDuration);

    console.log('[CUSTOM WINDOW] Displayed result, window ID:', this.window.id);
  }

  private registerEscapeKey(): void {
    // Register Escape key as a manual override to close the window
    if (!this.escapeShortcutRegistered) {
      try {
        const success = globalShortcut.register('Escape', () => {
          console.log('[CUSTOM WINDOW] Escape key pressed, closing');
          this.closeWindow();
        });
        this.escapeShortcutRegistered = success;
        if (success) {
          console.log('[CUSTOM WINDOW] Escape key registered');
        }
      } catch (error) {
        console.warn('[CUSTOM WINDOW] Could not register Escape key:', error);
      }
    }
  }

  private unregisterEscapeKey(): void {
    if (this.escapeShortcutRegistered) {
      try {
        globalShortcut.unregister('Escape');
        this.escapeShortcutRegistered = false;
        console.log('[CUSTOM WINDOW] Escape key unregistered');
      } catch (error) {
        console.warn('[CUSTOM WINDOW] Error unregistering Escape key:', error);
      }
    }
  }

  private generateHTML(result: string, settings: any): string {
    const escapedResult = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');

    // Theme-based styling
    const isDark = settings.theme === 'dark';
    const bgColor = isDark 
      ? `rgba(0, 0, 0, ${settings.opacity})` 
      : `rgba(255, 255, 255, ${settings.opacity})`;
    const textColor = isDark 
      ? 'rgba(255, 255, 255, 0.95)' 
      : 'rgba(0, 0, 0, 0.9)';
    const borderColor = isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.15)';
    const shadowColor = isDark 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.15)';
    const codeBgColor = isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            background: transparent;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            -webkit-app-region: no-drag;
          }

          .container {
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            min-height: 100vh;
            padding: 20px;
          }

          .text-container {
            background: ${bgColor};
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: ${textColor};
            padding: 16px 20px;
            border-radius: 8px;
            max-width: ${settings.maxWidth - 40}px;
            font-size: ${settings.fontSize}px;
            line-height: 1.6;
            text-align: left;
            box-shadow: 0 4px 20px ${shadowColor};
            border: 1px solid ${borderColor};
            word-wrap: break-word;
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Styling for formatted text */
          .text-container strong {
            color: ${textColor};
            opacity: 1;
          }

          .text-container code {
            background: ${codeBgColor};
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: ${settings.fontSize - 1}px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="text-container">
            ${escapedResult}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public closeWindow(): void {
    console.log('[CUSTOM WINDOW] closeWindow called');
    
    // Clear timer first
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
      console.log('[CUSTOM WINDOW] Timer cleared');
    }

    // Unregister Escape key
    this.unregisterEscapeKey();

    // Close and destroy window
    if (this.window) {
      try {
        if (!this.window.isDestroyed()) {
          console.log('[CUSTOM WINDOW] Destroying window ID:', this.window.id);
          this.window.destroy();
          console.log('[CUSTOM WINDOW] Window destroyed successfully');
        } else {
          console.log('[CUSTOM WINDOW] Window already destroyed');
        }
      } catch (error) {
        console.error('[CUSTOM WINDOW] Error destroying window:', error);
      } finally {
        this.window = null;
      }
    } else {
      console.log('[CUSTOM WINDOW] No window to close');
    }
  }

  public destroy(): void {
    this.closeWindow();
  }
}


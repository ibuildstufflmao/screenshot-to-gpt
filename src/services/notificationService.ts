import { Notification, clipboard } from 'electron';
import { ConfigManager } from '../config/configManager';

export class NotificationService {
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public showResult(result: string): void {
    // Copy to clipboard if enabled
    if (this.configManager.isCopyToClipboard()) {
      clipboard.writeText(result);
    }

    // Get notification settings
    const notificationSettings = this.configManager.getNotificationSettings();
    
    // Show notification
    const notification = new Notification({
      title: notificationSettings.title,
      body: result.length > notificationSettings.maxBodyLength 
        ? result.substring(0, notificationSettings.maxBodyLength) + '...' 
        : result,
      icon: undefined // Use default system icon
    });

    notification.show();
  }

  public showError(message: string): void {
    const notification = new Notification({
      title: 'Error',
      body: message,
      icon: undefined
    });

    notification.show();
  }

  public copyToClipboard(text: string): void {
    clipboard.writeText(text);
  }

  public getClipboardText(): string {
    return clipboard.readText();
  }
}

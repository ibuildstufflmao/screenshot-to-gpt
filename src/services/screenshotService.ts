import { desktopCapturer, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class ScreenshotService {
  public async captureFullScreen(): Promise<Buffer> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      // Get the primary display
      const primaryDisplay = screen.getPrimaryDisplay();
      const source = sources.find(s => s.display_id === primaryDisplay.id.toString()) || sources[0];

      if (!source.thumbnail) {
        throw new Error('Failed to capture screenshot');
      }

      // Convert the thumbnail to buffer
      const imageBuffer = source.thumbnail.toPNG();
      return imageBuffer;
    } catch (error) {
      console.error('Screenshot capture error:', error);
      throw new Error('Failed to capture screenshot');
    }
  }

  public async captureAndSave(): Promise<string> {
    const imageBuffer = await this.captureFullScreen();
    const tempDir = os.tmpdir();
    const filename = `screenshot_${Date.now()}.png`;
    const filepath = path.join(tempDir, filename);
    
    fs.writeFileSync(filepath, imageBuffer);
    return filepath;
  }
}

import OpenAI from 'openai';
import { ConfigManager } from '../config/configManager';

export class OpenAIService {
  private openai: OpenAI | null = null;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    const apiKey = this.configManager.getApiKey();
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
    }
  }

  public updateApiKey(apiKey: string): void {
    // API key is now loaded from environment variables
    // This method is kept for compatibility but doesn't modify the config
    console.log('API key is loaded from environment variables (.env file)');
    this.initializeOpenAI();
  }

  public async analyzeScreenshot(imageBuffer: Buffer): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('[AI] Analyzing...');
    
    try {
      const prompt = this.configManager.getDefaultPrompt();
      const openaiSettings = this.configManager.getOpenAISettings();
      
      const response = await this.openai.responses.create({
        model: openaiSettings.model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt
              },
              {
                type: "input_image",
                image_url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
                detail: "auto"
              }
            ]
          }
        ],
      });

      // Extract the text content from the new response format
      let result = 'No response received';
      
      // Try to get text from output_text field first (newer API format)
      if (response.output_text) {
        result = response.output_text;
      } else {
        // Fallback to nested structure
        const outputItem = response.output?.[0];
        if (outputItem && 'content' in outputItem && outputItem.content) {
          const contentItem = outputItem.content[0];
          if (contentItem && 'text' in contentItem) {
            result = contentItem.text;
          }
        }
      }
      
      console.log(`[AI] Complete - ${result.length} chars`);
      
      this.configManager.setLastResult(result);
      return result;
    } catch (error) {
      console.error('[AI] Error:', error);
      throw new Error('Failed to analyze screenshot');
    }
  }

  public isConfigured(): boolean {
    return this.openai !== null;
  }
}

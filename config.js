/**
 * Screenshot To GPT Configuration
 * 
 * This file contains all application settings and prompt configurations.
 * The API key is loaded from .env file for security.
 */

module.exports = {
  // Application Settings
  app: {
    name: 'Screenshot To GPT',
    version: '1.0.0',
    defaultHotkey: 'Ctrl+Shift+Space',
    copyToClipboard: true,
    startWithWindows: false,
    showNotifications: true,
    displayMode: 'window' // 'notification' or 'window' 
  },

  // OpenAI Configuration
  openai: {
    model: 'gpt-5',
  },

  // Prompt Templates
  prompts: {
    // Default prompt for general screenshot analysis
    default: `You are analyzing a screenshot. 
Your job: find all questions or problems and answer them as briefly as possible. 
Output answers ONLY in the numbered format shown. 
Do not explain or repeat the questions.

---

Example 1

INPUT:
1) What is the capital of France?

2) The Earth revolves around the Sun. (True/False)

3) What is 3 + 2?
   a) 4   b) 5   c) 6

OUTPUT:
1) Paris
2) True
3) b

---

Example 2

INPUT:
1) Which gas do humans need to breathe?
   a) Oxygen   b) Carbon Dioxide   c) Nitrogen

2) Who wrote the play Hamlet?

3) The speed of sound is about 343 m/s at sea level. (True/False)

OUTPUT:
1) a
2) Shakespeare
3) True

---

Example 3

INPUT:
1) The chemical symbol for Gold is Au. (True/False)

2) What is 15 ÷ 3?
   a) 3   b) 5   c) 7   d) 9

3) Name one planet in our solar system that has rings.

OUTPUT:
1) True
2) b
3) Saturn
`,
    
    // Specialized prompts for different use cases
    summarize: 'Summarize the main content and key information visible in this screenshot.',
    
    explain: 'Explain what is happening in this screenshot in simple terms.',
    
    extractText: 'Extract and list all visible text from this screenshot.',
    
    identify: 'Identify the application, website, or interface shown in this screenshot.',
    
    debug: 'Help debug any issues visible in this screenshot. What might be wrong?',
    
    translate: 'Translate any visible text in this screenshot to English.',
    
    // Custom prompt function for dynamic prompts
    custom: (context) => {
      // You can create dynamic prompts based on context
      // For example, time-based prompts, application-specific prompts, etc.
      const hour = new Date().getHours();
      if (hour < 12) {
        return 'Good morning! Analyze this screenshot and tell me what you see.';
      } else if (hour < 18) {
        return 'Good afternoon! What\'s happening in this screenshot?';
      } else {
        return 'Good evening! Please analyze this screenshot for me.';
      }
    }
  },

  // Notification Settings
  notifications: {
    title: 'AI Result',
    showDuration: 5000, // 5 seconds
    maxBodyLength: 100
  },

  // Custom Window Settings (for floating display mode)
  customWindow: {
    displayDuration: 5000, // 5 seconds
    fontSize: 14,
    maxWidth: 400,
    opacity: 0.3, // 0.0 to 1.0
    theme: 'light' // 'dark' or 'light' - toggle with Ctrl+Shift+T
  },

  // Screenshot Settings
  screenshot: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  },

  // Development Settings
  development: {
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enableDebugMode: false
  }
};

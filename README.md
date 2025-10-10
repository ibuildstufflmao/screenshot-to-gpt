# Screenshot To GPT

AI-powered screenshot analysis with global hotkey for Windows.

## Features

- **System Tray Application**: Lives in Windows system tray only
- **Global Hotkey**: Default Ctrl+Shift+Space (configurable)
- **Screenshot Capture**: Full screen capture with AI analysis
- **OpenAI Vision Integration**: Analyzes screenshots using GPT-4 Vision
- **Windows Notifications**: Shows results as system toasts
- **Clipboard Integration**: Automatically copies results to clipboard
- **Configurable Settings**: JSON-based configuration

## Installation

1. Download the latest release from the releases page
2. Run the installer
3. The app will appear in your system tray

## Configuration

The app uses a flexible configuration system with two main files:

### 1. Environment Variables (.env)
Create a `.env` file in the project root for sensitive data:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Custom model (default: gpt-4.1)
# OPENAI_MODEL=gpt-4.1
```

### 2. Application Settings (config.js)
The `config.js` file contains all application settings and prompt templates:

```javascript
module.exports = {
  // Application Settings
  app: {
    name: 'Screenshot To GPT',
    version: '1.0.0',
    defaultHotkey: 'Ctrl+Shift+Space',
    copyToClipboard: true,
    startWithWindows: true
  },

  // Prompt Templates
  prompts: {
    default: 'Analyze this screenshot and provide a brief summary of what you see.',
    summarize: 'Summarize the main content and key information visible in this screenshot.',
    explain: 'Explain what is happening in this screenshot in simple terms.',
    extractText: 'Extract and list all visible text from this screenshot.',
    identify: 'Identify the application, website, or interface shown in this screenshot.',
    debug: 'Help debug any issues visible in this screenshot. What might be wrong?',
    translate: 'Translate any visible text in this screenshot to English.',
    custom: (context) => {
      // Dynamic prompts based on context
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning! Analyze this screenshot...';
      else if (hour < 18) return 'Good afternoon! What\'s happening...';
      else return 'Good evening! Please analyze this screenshot...';
    }
  }
};
```

### Required Setup

1. **API Key**: Get your OpenAI API key from https://platform.openai.com/api-keys
2. **Create .env file**: Copy `env.example` to `.env` and add your API key
3. **Customize prompts**: Edit `config.js` to modify prompts and settings
4. **Restart the app**: The app will pick up the new configuration

## Usage

1. **Press the hotkey** (Ctrl+Shift+Space by default) from any application
2. **Wait for processing** (usually 2-5 seconds)
3. **View the result** in the Windows notification
4. **Result is automatically copied** to your clipboard (if enabled)

## Tray Menu Options

Right-click the tray icon to access:

- **Start with Windows**: Toggle auto-start on Windows boot
- **Copy results to clipboard**: Toggle automatic clipboard copying
- **Prompt Type**: Select from different analysis prompts:
  - **Default**: General screenshot analysis
  - **Summarize**: Extract key information
  - **Explain**: Simple explanation of what's happening
  - **Extract Text**: Get all visible text
  - **Identify**: Identify applications/interfaces
  - **Debug**: Help with troubleshooting
  - **Translate**: Translate visible text to English
- **Show last result**: Display the most recent analysis
- **Quit**: Exit the application

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Package

```bash
npm run dist
```

## Technical Details

- **Framework**: Electron with TypeScript
- **AI Service**: OpenAI GPT-4 Vision API
- **Screenshot**: Electron's desktopCapturer
- **Global Hotkeys**: Electron's globalShortcut
- **Notifications**: Electron's Notification API
- **Packaging**: electron-builder for Windows EXE

## Troubleshooting

### "Couldn't get result. Try again."

- Check your OpenAI API key in config.json
- Ensure you have sufficient API credits
- Check your internet connection

### Hotkey not working

- Make sure no other application is using the same hotkey
- Try changing the hotkey in config.json
- Restart the application

### App not starting with Windows

- Check the "Start with Windows" option in the tray menu
- Ensure the app is in your startup folder

## License

MIT License

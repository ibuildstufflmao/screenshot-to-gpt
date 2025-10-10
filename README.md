# Screenshot To GPT

AI-powered screenshot analysis with global hotkey for Windows. Analyze any screen content with GPT-4 Vision in seconds.

## Features

- **System Tray Application**: Runs discreetly in Windows system tray
- **Visual Status Indicators**: Tray icon changes color based on state (idle, processing, success, error)
- **Global Hotkeys**: 
  - `Ctrl+Shift+Space` - Capture and analyze screenshot
  - `Ctrl+Shift+R` - Show last result
- **Dual Display Modes**:
  - **System Notifications**: Traditional Windows toast notifications
  - **Floating Window**: Stealthy transparent overlay in bottom-right corner
- **Smart Auto-Hide**: Floating window dismisses after 5 seconds or on any keyboard/mouse input
- **Theme Support**: Dark and light themes for floating window to blend with any background
- **OpenAI Vision Integration**: Powered by GPT-4 Vision API
- **Clipboard Integration**: Automatically copies results to clipboard (optional)
- **Multiple Prompt Templates**: Pre-configured prompts for different analysis types
- **Highly Configurable**: Customize via `config.js` and `.env` files

## Installation

Not supported yet :)

## Configuration

### Required Setup

1. **Get OpenAI API Key**: Sign up at https://platform.openai.com/api-keys
2. **Create .env file**: Copy `env.example` to `.env` and add your API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```
3. **Start the app**: Launch and configure via tray menu

### Advanced Configuration (config.js)

The `config.js` file allows you to customize:

- **Application Settings**: Default hotkey, auto-start, clipboard behavior, display mode
- **OpenAI Settings**: Model selection (default: gpt-5)
- **Prompt Templates**: Pre-built prompts for different analysis types (summarize, explain, extract text, debug, translate)
- **Custom Prompts**: Create dynamic prompts based on context
- **Notification Settings**: Duration, title, message length
- **Floating Window Settings**: Display duration, font size, width, opacity, theme
- **Screenshot Settings**: Quality, resolution limits

Edit `config.js` and restart the app to apply changes.

## Usage

### Basic Workflow

1. **Capture & Analyze**: Press `Ctrl+Shift+Space` from any application
2. **Visual Feedback**: Tray icon turns blue (processing) → green (success) or red (error)
3. **View Results**: 
   - **Notification Mode**: Windows toast appears with the result
   - **Floating Window Mode**: Semi-transparent overlay in bottom-right corner
4. **Auto-Copy**: Result is copied to clipboard automatically (if enabled)
5. **Recall**: Press `Ctrl+Shift+R` to show the last result again

### Display Modes

**System Notification** (Default)
- Traditional Windows notification toast
- Shows for 5 seconds
- Good for casual use

**Floating Window** (Stealth Mode)
- Semi-transparent overlay in bottom-right corner
- Auto-dismisses after 5 seconds OR on any keyboard/mouse input
- Dark/Light theme options to blend with background
- Perfect for exams, presentations, or screen sharing

## Tray Menu

Right-click the tray icon for settings:

```
├─ Start with Windows            ☐/☑ Auto-start on boot
├─ Copy results to clipboard     ☐/☑ Auto-copy to clipboard
├─ Show notifications on completion  ☐/☑ Display results automatically
├─ ─────────────────────────────
├─ Display Mode
│  ├─ ● Notification             System toast notifications
│  └─ ○ Floating Window          Transparent overlay (stealth)
├─ Window Theme
│  ├─ ● Dark                     Black background, white text
│  └─ ○ Light                    White background, black text
├─ ─────────────────────────────
├─ Prompt Type
│  ├─ ● Default                  General analysis
│  ├─ ○ Summarize                Extract key information
│  ├─ ○ Explain                  Simple explanation
│  ├─ ○ Extract Text             OCR all visible text
│  ├─ ○ Identify                 Recognize apps/websites
│  ├─ ○ Debug                    Help troubleshoot issues
│  └─ ○ Translate                Translate to English
├─ ─────────────────────────────
├─ Show last result              Re-display previous result
├─ ─────────────────────────────
└─ Quit                          Exit application
```

### Tray Icon Status Colors

- **Gray** (Default): Idle, ready to capture
- **Blue**: Processing screenshot with AI
- **Green**: Analysis successful (briefly, then returns to gray)
- **Red**: Error occurred (briefly, then returns to gray)

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

## Tips & Tricks

- **Stealthy Mode**: Use Floating Window + Dark/Light theme to match your background
- **Silent Mode**: Disable "Show notifications on completion" to work completely silently
- **Quick Recall**: Press `Ctrl+Shift+R` to re-display the last result
- **Manual Dismiss**: Press `Escape` to manually close floating window
- **Custom Prompts**: Edit `config.js` to create specialized analysis prompts

## Troubleshooting

### Red tray icon / "Couldn't get result"

- Verify OpenAI API key in `.env` file
- Check API credits at https://platform.openai.com/account/usage
- Ensure internet connection is active
- Check console logs with `npm run dev`

### Hotkey not responding

- Confirm no other app is using `Ctrl+Shift+Space`
- Try changing hotkey in `config.js`
- Restart the application

### Floating window won't disappear

- Press `Escape` to manually close
- Check console logs for errors
- Window should auto-close after 5 seconds

### App not auto-starting

- Enable "Start with Windows" in tray menu
- Check Task Manager > Startup tab
- Verify app is in Windows startup folder

## License

MIT License

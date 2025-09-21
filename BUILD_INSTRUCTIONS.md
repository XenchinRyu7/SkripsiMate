# SkripsiMate Build Instructions

## Prerequisites

### Required Software:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Platform-Specific Requirements:

#### Windows:
- **Visual Studio Build Tools** (for native modules)
- **Windows 10/11** (recommended)

#### macOS:
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 10.15+** (for building)
- **Code signing certificate** (for distribution)

#### Linux:
- **build-essential**: `sudo apt-get install build-essential`
- **libnss3-dev**: `sudo apt-get install libnss3-dev`
- **libatk-bridge2.0-dev**: `sudo apt-get install libatk-bridge2.0-dev`

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/XenchinRyu7/SkripsiMate.git
   cd SkripsiMate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Development

### Start Development Server:
```bash
npm run electron-dev
```
This will start both React dev server and Electron app.

### Build React App Only:
```bash
npm run build
```

## Building Executables

### Build for Current Platform:
```bash
npm run dist
```

### Build for Specific Platforms:

#### Windows (from any platform):
```bash
npm run dist-win
```

#### macOS (from macOS only):
```bash
npm run dist-mac
```

#### Linux (from any platform):
```bash
npm run dist-linux
```

### Build All Platforms (from macOS):
```bash
npm run dist
```

## Output Files

### Windows:
- **NSIS Installer**: `dist/SkripsiMate Setup 1.0.0.exe`
- **Portable**: `dist/SkripsiMate 1.0.0.exe`

### macOS:
- **DMG**: `dist/SkripsiMate-1.0.0.dmg`
- **ZIP**: `dist/SkripsiMate-1.0.0-mac.zip`

### Linux:
- **AppImage**: `dist/SkripsiMate-1.0.0.AppImage`
- **DEB**: `dist/skripsimate_1.0.0_amd64.deb`
- **RPM**: `dist/skripsimate-1.0.0.x86_64.rpm`

## Distribution

### Code Signing (Optional but Recommended):

#### Windows:
1. Get a **Code Signing Certificate**
2. Add to `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.p12",
     "certificatePassword": "password"
   }
   ```

#### macOS:
1. Get an **Apple Developer Certificate**
2. Add to `package.json`:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name"
   }
   ```

### Auto-Updater (Optional):
```bash
npm install electron-updater
```

## Troubleshooting

### Common Issues:

#### "Module not found" errors:
```bash
npm install
npm run build
```

#### Build fails on Windows:
- Install Visual Studio Build Tools
- Run as Administrator

#### Build fails on macOS:
- Install Xcode Command Line Tools
- Check code signing settings

#### Build fails on Linux:
- Install required system packages
- Check Node.js version

### Performance Tips:

1. **Use .gitignore** to exclude build files
2. **Clean build** before distribution:
   ```bash
   rm -rf dist/
   npm run dist
   ```
3. **Test on target platforms** before release

## Release Process

1. **Update version** in `package.json`
2. **Build for all platforms**:
   ```bash
   npm run dist
   ```
3. **Test executables** on target platforms
4. **Upload to GitHub Releases**
5. **Update documentation**

## File Structure

```
SkripsiMate/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js           # Preload script
│   └── index.html           # HTML template
├── src/                     # React source code
├── assets/                  # Icons and images
├── dist/                    # Built executables
├── package.json             # Dependencies and scripts
└── BUILD_INSTRUCTIONS.md    # This file
```

## iOS Compatibility

**❌ iOS is NOT supported** because:

1. **Electron doesn't run on iOS** - it's a desktop framework
2. **iOS restrictions** - Apple doesn't allow third-party browsers/engines
3. **Different architecture** - iOS uses different app structure

### Alternatives for Mobile:

#### Web Version:
- Create a **responsive web app** using the same React code
- Deploy to **Vercel/Netlify**
- Users can access via mobile browser

#### React Native:
- **Separate mobile app** using React Native
- Share business logic with desktop version
- Different UI for mobile experience

#### Progressive Web App (PWA):
- **Web app** with mobile-optimized interface
- **Offline support** with service workers
- **App-like experience** on mobile devices

### Recommended Approach:
1. **Desktop**: Electron app (current)
2. **Mobile**: Responsive web version or PWA
3. **Sync**: Cloud storage for project synchronization

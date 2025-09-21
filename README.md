# SkripsiMate

A modern Electron desktop application for thesis planning with AI assistance. Built with React, TypeScript, and TailwindCSS.

## Features

- 🤖 **AI-Powered Planning**: Generate structured thesis steps using Google's Gemini API
- 📋 **Visual Flow Management**: Drag-and-drop interface for organizing thesis steps
- 📝 **Notes & Annotations**: Keep track of your thoughts and progress
- 💾 **Project Management**: Save, load, and export your thesis plans
- 🎨 **Modern UI**: Clean, VSCode-inspired interface with dark/light mode support
- 📊 **Progress Tracking**: Visual progress indicators and statistics
- 🔧 **Customizable**: Flexible settings and preferences

## Screenshots

*Coming soon - the app features a clean, modern interface with:*
- Top toolbar with file operations and settings
- AI prompt input for generating thesis steps
- Draggable cards showing thesis steps with priorities and timelines
- Notes panel with project statistics
- Settings dialog for API configuration

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkripsiMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Getting Started

1. **Configure API Key**: Open Settings and enter your Gemini API key
2. **Create Project**: Click "New" to create a new thesis project
3. **Generate Steps**: Enter your thesis topic in the prompt area and click "Generate Steps"
4. **Organize**: Drag and drop steps to reorder them, mark as completed, or edit details
5. **Take Notes**: Use the notes panel to add your thoughts and track progress
6. **Export**: Save your work or export to PDF/Markdown/JSON formats

### Features Overview

#### AI Thesis Planning
- Enter a description of your thesis topic
- AI generates structured steps with priorities and timelines
- Customize generated steps or add your own

#### Visual Management
- Drag-and-drop interface for organizing steps
- Priority indicators (High/Medium/Low)
- Progress tracking with completion percentages
- Time estimates for each step

#### Project Management
- Save projects locally or to files
- Export to multiple formats (PDF, Markdown, JSON)
- Auto-save functionality
- Project statistics and progress tracking

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Toolbar.tsx     # Main application toolbar
│   ├── PromptInput.tsx # AI prompt input component
│   ├── FlowVisualizer.tsx # Thesis steps visualization
│   ├── NotesPanel.tsx  # Notes and statistics panel
│   └── SettingsDialog.tsx # Settings configuration
├── contexts/           # React contexts
│   ├── ThemeContext.tsx    # Theme management
│   ├── SettingsContext.tsx # App settings
│   └── ProjectContext.tsx  # Project state management
├── lib/                # Utility functions
│   ├── utils.ts        # General utilities
│   └── gemini.ts       # Gemini API integration
└── hooks/              # Custom React hooks
    └── use-toast.ts    # Toast notifications
```

### Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Desktop**: Electron
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Build Tool**: Vite
- **State Management**: React Context API
- **Drag & Drop**: react-dnd
- **API**: Google Gemini API

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run electron` - Run Electron app
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Configuration

### Environment Variables

No environment variables are required. API keys are stored securely in the app's settings.

### Settings

Access settings through the toolbar or menu:
- **API Configuration**: Set your Gemini API key
- **General Settings**: Auto-save, theme preferences
- **App Information**: Version and build details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Electron](https://www.electronjs.org/) for desktop app framework

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your OS, Node.js version, and error messages

---

**Happy thesis planning! 🎓**

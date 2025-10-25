# Changelog

All notable changes to SkripsiMate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-25

### 🎉 Initial Release

First stable release of SkripsiMate - AI-powered thesis planning platform!

### ✨ Features

#### AI Agents System
- 🤖 Intelligent chat powered by Gemini 2.5 Pro
- 🧠 RAG (Retrieval-Augmented Generation) for context-aware responses
- 💬 Natural language commands for roadmap manipulation
- 🎯 Smart suggestions and gap detection
- 📚 Resource recommendations

#### Visual Roadmap Canvas
- 🎨 Figma-like drag & drop interface
- 📊 Hierarchical node structure (Phase → Step → Substep)
- 🔗 Auto-connecting edges with smart routing
- 🖱️ Multi-select and bulk operations
- 📐 Auto-format layout button
- 🗺️ Minimap navigation
- ⌨️ Keyboard shortcuts support

#### AI Generation
- ⚡ Generate complete roadmap in < 30 seconds
- 🎓 Academic standards compliant
- 🔄 Generate fresh or merge with existing nodes
- 📝 Detailed descriptions and priorities
- ⏱️ Realistic timeline estimation

#### Node Management
- ✅ Interactive checkbox for substeps
- 📊 Real-time progress tracking
- 🔄 Cascade status updates (child → parent)
- 🎭 Custom styling and colors
- 💾 Auto-save positions
- 🗑️ Delete with cascade (remove children)

#### Edge Management
- 🎨 Edge Style Toolbar (curved, straight, elbowed)
- 🎯 Custom start/end markers (arrow, dot, none)
- 🎨 Auto-coloring based on connection type
- 🔗 Manual connect/disconnect
- 💾 Persist deleted auto-generated edges

#### Export & Sharing
- 📥 Export as JSON (machine-readable)
- 📄 Export as Markdown (documentation)
- 💾 Auto-save all changes
- 🔄 Real-time sync with database

#### Authentication & Database
- 🔐 Firebase Authentication
- 🗄️ Supabase PostgreSQL with pgvector
- 🔒 Row Level Security (RLS) policies
- ☁️ Real-time data sync

### 🛠️ Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Glassmorphism design
- **Canvas**: React Flow
- **AI**: Gemini 2.5 Pro + Embeddings
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Firebase Authentication
- **Deployment**: Vercel

### 📚 Documentation

- Comprehensive setup instructions
- API documentation
- Self-hosting guide
- Contributing guidelines
- Security policy

### 🐛 Known Issues

- AI chat may experience rate limiting on free-tier Gemini API
- Large roadmaps (>100 nodes) may have performance issues on mobile
- Export to PDF not yet implemented

### 🔜 Coming Soon

- Team collaboration features
- Real-time multi-user editing
- Mobile app (React Native)
- PDF export
- Integration with Notion, Google Drive
- Advanced analytics dashboard
- Custom AI model fine-tuning

---

## [Unreleased]

### Planned Features
- 👥 Team collaboration
- 📱 Mobile app
- 📊 Analytics dashboard
- 🔔 Deadline notifications
- 🌐 Multi-language support (full i18n)
- 🎨 Custom themes
- 📦 Template library
- 🔌 Webhook support

---

## Version History

- **1.0.0** (2024-12-25) - Initial Release
  - Core features: AI Agents, Canvas, Generation, Export
  - Production-ready self-hosted version
  - Open source release

---

## How to Update

### For Self-Hosted Users

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run database migrations (if any)
npm run migrate

# Restart server
npm run build
npm run start
```

### For Cloud Users

Updates are deployed automatically. Check the app for new features!

---

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/XenchinRyu7/SkripsiMate/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/XenchinRyu7/SkripsiMate/discussions)
- 💬 **Community**: [Discord](https://discord.gg/skripsimate) (coming soon)
- 📧 **Email**: saefulrohman@example.com

---

**Thank you for using SkripsiMate! 🎓✨**


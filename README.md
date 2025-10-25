<div align="center">

# 📚 SkripsiMate

### AI-Powered Thesis Planning Platform

*Plan your thesis journey with intelligent AI agents and visual roadmaps*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Pro-orange)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Made in Indonesia](https://img.shields.io/badge/Made%20in-Indonesia%20🇮🇩-red)](https://github.com/XenchinRyu7)

[Features](#-features) •
[Demo](#-demo) •
[Installation](#-quick-start) •
[Documentation](#-documentation) •
[Contributing](#-contributing) •
[Support](#-support)

</div>

---

## 📹 Demo

> **Live Demo:** [Coming Soon]  
> **Screenshots:** [See below](#-screenshots)

<div align="center">
  <i>🎥 Demo video and screenshots coming soon!</i>
</div>

---

## 🌟 Features

### 🤖 **AI Agents System** (BETA)
- Generate comprehensive thesis roadmaps automatically
- Break down complex tasks into actionable steps
- Refine and improve node descriptions
- Context-aware chat assistance

### 🎨 **Visual Canvas Editor**
- Figma-like drag & drop experience
- Interactive node board with React Flow
- Beautiful glassmorphism UI design
- Zoom, pan, and multi-select nodes

### 🧠 **RAG Context Understanding**
- Vector embeddings with Gemini AI
- Similarity search across your project
- AI understands your entire thesis structure
- Smart suggestions based on context

### 📊 **Project Management**
- Dashboard with project overview
- Progress tracking and stats
- Priority levels and dependencies
- Time estimates and milestones

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account (free)
- Supabase account (free)
- Gemini API key (free)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd skripsimate

# Install dependencies
npm install

# Setup environment variables
cp .env .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Setup Guide

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup steps.

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Custom (Glassmorphism) |
| **Graph Library** | React Flow |
| **Authentication** | Firebase Auth |
| **Database** | Supabase (PostgreSQL) |
| **Vector DB** | pgvector (Supabase) |
| **AI Model** | Gemini 2.5 Pro |
| **Embeddings** | Gemini text-embedding-004 |
| **Deployment** | Vercel |

## 📁 Project Structure

```
skripsimate/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages
│   ├── dashboard/           # Dashboard page
│   ├── project/[id]/        # Canvas editor
│   └── api/                 # API routes
│       ├── agent/           # AI agent endpoints
│       └── embeddings/      # Vector embeddings
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base components
│   │   ├── auth/           # Auth components
│   │   ├── dashboard/      # Dashboard components
│   │   └── canvas/         # Canvas components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # External services
│   │   ├── firebase.ts     # Firebase config
│   │   ├── supabase.ts     # Supabase client
│   │   └── gemini.ts       # Gemini AI client
│   └── core/               # Clean architecture
│       ├── domain/         # Entities
│       ├── application/    # Use cases
│       ├── infrastructure/ # External APIs
│       └── shared/         # Utils, types
├── docs/                   # Documentation
│   ├── database-schema.sql # Supabase schema
│   ├── PROGRESS.md         # Build progress
│   └── SETUP_GUIDE.md      # Setup guide
└── public/                 # Static assets
```

## 🎯 Core Features Detail

### Authentication
- ✅ Email/Password sign up & login
- ✅ Google OAuth integration
- ✅ Protected routes with middleware
- ✅ Session management

### Dashboard
- ✅ Project list with cards
- ✅ Stats overview (projects, tasks, progress)
- ✅ Create new project modal
- ✅ Empty state UI

### Canvas Editor
- ✅ React Flow integration
- ✅ Custom node types (Phase, Step, Substep)
- ✅ Drag & drop positioning
- ✅ Zoom, pan, fit view
- ✅ Minimap and controls
- ✅ Multi-select nodes

### AI Agent
- ✅ Generate roadmap API (`/api/agent/generate`)
- ✅ Chat with AI (`/api/agent/chat`)
- ✅ Refine node (`/api/agent/refine`)
- ✅ Break down task (`/api/agent/breakdown`)

### RAG System
- ✅ Generate embeddings (`/api/embeddings/generate`)
- ✅ Vector similarity search (`/api/embeddings/search`)
- ✅ Batch embedding (`/api/embeddings/batch`)
- ✅ pgvector integration

## 💾 Database Schema

### Tables
- `projects` - User projects
- `nodes` - Roadmap nodes (Phase, Step, Substep)
- `edges` - Node connections
- `node_embeddings` - Vector embeddings (1536 dim)
- `chat_messages` - AI chat history

### Security
- Row Level Security (RLS) enabled
- User data isolation
- Firebase UID as user_id

## 🤖 AI Capabilities

### Generate Roadmap
```typescript
POST /api/agent/generate
{
  "projectId": "uuid",
  "title": "Stock Prediction ML",
  "jurusan": "Teknik Informatika",
  "timeline": "6 months"
}
```

Returns: 5-8 phases with 3-5 steps each, including:
- Detailed descriptions
- Time estimates
- Priority levels
- Substeps and checklists

### Chat with AI
```typescript
POST /api/agent/chat
{
  "projectId": "uuid",
  "message": "Help me with literature review"
}
```

Returns: Context-aware AI response

### RAG Search
```typescript
POST /api/embeddings/search
{
  "projectId": "uuid",
  "query": "data collection methods",
  "matchCount": 5
}
```

Returns: Similar nodes based on semantic search

## 🎨 UI Design

### Glassmorphism Theme
- Frosted glass effect with backdrop blur
- Blue-white gradient background
- Smooth animations and transitions
- Modern, aesthetic, professional

### Color Palette
- **Primary**: Blue gradient (#2563EB → #3B82F6)
- **Background**: White mesh gradient
- **Glass**: rgba(255, 255, 255, 0.7)
- **Accents**: Soft blue-gray tones

## 📊 Performance

### Optimization
- Edge runtime for API routes
- Client-side caching
- Incremental data loading
- Debounced search
- Lazy loading components

### Limits (Free Tier)
- **Firebase Auth**: Unlimited users ✅
- **Supabase**: 500MB database ✅
- **Gemini API**: 2 req/min (Pro), 10 req/min (Flash) ✅
- **Vercel**: 100GB bandwidth ✅

## 🚧 Roadmap

### Phase 1 - MVP ✅ (COMPLETED)
- [x] Authentication (Email + Google OAuth)
- [x] Dashboard with project management
- [x] Canvas Editor (Figma-like experience)
- [x] AI Generation (Gemini 2.5 Pro)
- [x] RAG System (Vector search with embeddings)

### Phase 2 - Enhancement ✅ (COMPLETED)
- [x] Export (JSON, Markdown)
- [x] Advanced node editing (drag, connect, style)
- [x] Edge Style Toolbar (curved, straight, elbowed)
- [x] Manual node creation (Phase, Step, Substep)
- [x] Auto-format layout
- [x] Progress tracking with cascade updates
- [x] Settings & preferences modal

### Phase 3 - Collaboration (PLANNED)
- [ ] Real-time multi-user editing
- [ ] Comments & discussions on nodes
- [ ] Share project with mentor/team
- [ ] Version history & rollback
- [ ] @mentions in chat

### Phase 4 - Advanced Features (PLANNED)
- [ ] Export to PDF with styling
- [ ] Template library (by major/field)
- [ ] Guideline upload (PDF RAG for thesis requirements)
- [ ] Mobile app (React Native)
- [ ] Integration with Notion, Google Drive, Obsidian
- [ ] Advanced analytics dashboard
- [ ] Deadline alerts & notifications
- [ ] Custom AI model fine-tuning

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

**Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.**

Quick steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Good First Issues:** Look for issues tagged `good first issue` or `help wanted`

## 💖 Support

If you find SkripsiMate helpful, consider supporting the project:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** and suggest features via [Issues](https://github.com/XenchinRyu7/SkripsiMate/issues)
- 📣 **Share** SkripsiMate with fellow students
- ☕ **Buy me a coffee** via [Trakteer](https://trakteer.id/saefulrohman) or [Saweria](https://saweria.co/saefulrohman)
- 💻 **Contribute code** via Pull Requests
- 📚 **Improve documentation**

Every contribution, big or small, is valuable! 🙏

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this software freely, even for commercial purposes. Just include the original license and copyright notice.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React Flow](https://reactflow.dev) - Node editor
- [Firebase](https://firebase.google.com) - Authentication
- [Supabase](https://supabase.com) - Database
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model

## 👥 Contributors

Thanks to all contributors who have helped make SkripsiMate better!

<!-- readme: contributors -start -->
<a href="https://github.com/XenchinRyu7/SkripsiMate/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XenchinRyu7/SkripsiMate" />
</a>
<!-- readme: contributors -end -->

*Want to see your name here? [Contribute!](CONTRIBUTING.md)*

## 📞 Contact & Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/XenchinRyu7/SkripsiMate/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/XenchinRyu7/SkripsiMate/discussions)
- 💬 **Community Chat:** [Discord](https://discord.gg/skripsimate) *(coming soon)*
- 📧 **Email:** [Contact Developer](mailto:saefulrohman@example.com)
- 🐦 **Twitter:** [@YourTwitter](https://twitter.com/yourhandle) *(optional)*
- 💼 **LinkedIn:** [Saeful Rohman](https://linkedin.com/in/yourprofile) *(optional)*

## 📚 Documentation

- 📖 [Setup Instructions](SETUP_INSTRUCTIONS.md) - How to install and configure
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to production
- 🗄️ [Database Setup](docs/SUPABASE_SETUP.md) - Supabase configuration
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute
- 🔒 [Security Policy](SECURITY.md) - Report vulnerabilities
- 📝 [Changelog](CHANGELOG.md) - Version history
- ⚖️ [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines

---

<div align="center">

**Built with ❤️ by [Saeful Rohman](https://github.com/XenchinRyu7)**

*Helping Indonesian students complete their thesis with AI assistance!*

### ⭐ Star us on GitHub — it motivates us a lot!

[Report Bug](https://github.com/XenchinRyu7/SkripsiMate/issues) •
[Request Feature](https://github.com/XenchinRyu7/SkripsiMate/discussions) •
[Join Community](https://discord.gg/skripsimate)

</div>

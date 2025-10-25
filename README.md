# 📚 SkripsiMate - AI-Powered Thesis Planner

> Plan your thesis journey with interactive AI assistance and visual roadmaps

![SkripsiMate](https://img.shields.io/badge/Status-MVP-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🌟 Features

### 🤖 **Interactive AI Agent**
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

### Phase 1 - MVP ✅
- [x] Authentication
- [x] Dashboard
- [x] Canvas Editor
- [x] AI Generation
- [x] RAG System

### Phase 2 - Enhancement
- [ ] Export (JSON, Markdown, PDF)
- [ ] Advanced node editing
- [ ] Template library
- [ ] Guideline upload (PDF RAG)

### Phase 3 - Collaboration
- [ ] Real-time collaboration
- [ ] Comments & discussions
- [ ] Share project with mentor
- [ ] Version history

### Phase 4 - Analytics
- [ ] Progress analytics
- [ ] Time tracking
- [ ] Deadline alerts
- [ ] Productivity insights

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React Flow](https://reactflow.dev) - Node editor
- [Firebase](https://firebase.google.com) - Authentication
- [Supabase](https://supabase.com) - Database
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model

## 💬 Contact

For questions or support, please open an issue.

---

**Built with ❤️ for Indonesian students**

*Bantu mahasiswa Indonesia menyelesaikan skripsi dengan AI assistance!* 🚀

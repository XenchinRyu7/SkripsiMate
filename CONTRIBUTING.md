# Contributing to SkripsiMate 🎉

First off, thank you for considering contributing to SkripsiMate! It's people like you that make SkripsiMate such a great tool for students worldwide.

## 🌟 Ways to Contribute

There are many ways you can contribute to SkripsiMate:

- 🐛 **Report Bugs**: Found a bug? Let us know!
- 💡 **Suggest Features**: Have an idea? We'd love to hear it!
- 📝 **Improve Documentation**: Help others understand SkripsiMate better
- 💻 **Write Code**: Fix bugs or implement new features
- 🎨 **Design**: Improve UI/UX or create illustrations
- 🌍 **Translate**: Help make SkripsiMate accessible to more students
- 📣 **Spread the Word**: Share SkripsiMate with others!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account
- API Keys (Firebase, Supabase, Gemini) - see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

### Setup Development Environment

1. **Fork the Repository**
   - Click the "Fork" button at the top right of this page

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkripsiMate.git
   cd SkripsiMate
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/XenchinRyu7/SkripsiMate.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Fill in your API keys in .env
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

7. **Open in Browser**
   - Navigate to `http://localhost:3000`

## 🔧 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features (e.g., `feature/add-pdf-export`)
- `fix/` - Bug fixes (e.g., `fix/node-deletion-bug`)
- `docs/` - Documentation updates (e.g., `docs/update-setup-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/canvas-component`)
- `style/` - UI/styling changes (e.g., `style/improve-glassmorphism`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "type(scope): description"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(canvas): add pdf export functionality"
git commit -m "fix(ai): resolve gemini api timeout issue"
git commit -m "docs(readme): update installation steps"
```

### 4. Push to Your Fork

```bash
git push origin your-branch-name
```

### 5. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template with:
   - Description of changes
   - Related issue number (if any)
   - Screenshots (for UI changes)
   - Testing steps
4. Wait for review!

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your own code
- [ ] Commented complex code sections
- [ ] No console.log() or debugging statements left
- [ ] Updated documentation if needed
- [ ] Tested locally and works as expected
- [ ] No merge conflicts with main branch

### PR Description Should Include

```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Screenshots (if applicable)
[Add screenshots here]

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have tested my changes
- [ ] I have updated the documentation
```

## 🐛 Reporting Bugs

Found a bug? Help us fix it by:

1. **Check Existing Issues** - Maybe it's already reported
2. **Create a New Issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)
   - Error messages/console logs

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Node Version: [e.g. 18.17.0]

**Additional context**
Any other context about the problem.
```

## 💡 Suggesting Features

Have an idea? We'd love to hear it!

1. **Check Existing Issues** - Maybe someone already suggested it
2. **Create a Feature Request** with:
   - Clear, descriptive title
   - Problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Mockups/examples (if applicable)

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for type safety
- Use functional components with hooks
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for complex functions

```typescript
/**
 * Generates a roadmap from thesis details using AI
 * @param title - Thesis title
 * @param major - Student's major
 * @returns Generated nodes array
 */
export async function generateRoadmap(title: string, major: string): Promise<Node[]> {
  // Implementation
}
```

### React Components

- One component per file
- Use named exports
- Props interface defined above component
- Destructure props

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow glassmorphism design system
- Maintain consistent spacing (4px grid)
- Use design tokens from globals.css

## 🧪 Testing

Before submitting:

```bash
# Build test
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 📚 Documentation

When adding features:

- Update README.md if needed
- Add JSDoc comments to functions
- Update SETUP_INSTRUCTIONS.md for setup changes
- Create/update docs/ files for major features

## 🌍 Translation

Want to translate SkripsiMate?

1. Copy `locales/en.json` to `locales/YOUR_LANG.json`
2. Translate all strings
3. Add language to `i18n.config.ts`
4. Submit PR!

## 💰 Financial Contributions

If you'd like to support SkripsiMate financially:

- ☕ [Buy me a coffee](https://trakteer.id/saefulrohman)
- 💳 Sponsor on GitHub (coming soon)

## 🏆 Recognition

Contributors will be:

- Listed in README.md
- Mentioned in release notes
- Credited in the app (for major contributions)

## 📞 Need Help?

- 💬 [Discord Community](https://discord.gg/skripsimate) (coming soon)
- 📧 Email: saefulrohman@example.com
- 🐛 [GitHub Issues](https://github.com/XenchinRyu7/SkripsiMate/issues)

## 📜 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## 🎯 Good First Issues

New to open source? Look for issues tagged with:
- `good first issue` - Easy issues for beginners
- `help wanted` - We need help with these!
- `documentation` - Documentation improvements

## 🚦 Review Process

1. **Automatic Checks** - GitHub Actions will run tests
2. **Code Review** - Maintainer will review your code
3. **Changes Requested** - Address feedback if needed
4. **Approval** - Once approved, we'll merge!
5. **Release** - Your contribution will be in the next release!

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Thank you for helping make SkripsiMate better for students everywhere!

**Happy Coding! 🚀**

---

Made with ❤️ by [Saeful Rohman](https://github.com/XenchinRyu7) and [contributors](https://github.com/XenchinRyu7/SkripsiMate/graphs/contributors)


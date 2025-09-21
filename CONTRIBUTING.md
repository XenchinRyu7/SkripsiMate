# Contributing to SkripsiMate

Thank you for your interest in contributing to SkripsiMate! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this commitment.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/SkripsiMate.git
   cd SkripsiMate
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## How to Contribute

### Types of Contributions

- **Bug fixes**: Fix issues in the codebase
- **Feature additions**: Add new functionality
- **Documentation**: Improve or add documentation
- **UI/UX improvements**: Enhance the user interface
- **Performance optimizations**: Improve app performance
- **Testing**: Add or improve tests

### Contribution Process

1. **Check existing issues**: Look for existing issues or create a new one
2. **Create a branch**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes**: Implement your changes following our coding standards
4. **Test your changes**: Ensure your changes work correctly
5. **Commit your changes**: Use clear, descriptive commit messages
6. **Push to your fork**: Push your branch to your fork
7. **Create a Pull Request**: Submit a PR with a clear description

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Self-review of your code has been performed
- [ ] Code has been tested locally
- [ ] Documentation has been updated if necessary
- [ ] No new warnings or errors are introduced

### Pull Request Template

When creating a PR, please include:

- **Description**: What changes were made and why
- **Type of change**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Screenshots**: If applicable, include screenshots of UI changes
- **Breaking changes**: List any breaking changes

## Coding Standards

### General Guidelines

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components over class components
- Implement proper error handling
- Write clean, readable, and maintainable code

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API and external service integrations
└── styles/             # Global styles and themes
```

### Component Guidelines

- Use PascalCase for component names
- Export components as default exports
- Use props interfaces for component props
- Implement proper prop validation
- Use CSS modules or styled-components for styling

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots**: If applicable, include screenshots

### Feature Requests

For feature requests, please include:

- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Proposed solution**: How you think it should work
- **Alternatives**: Any alternative solutions you've considered

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Package for distribution
npm run dist
```

## Getting Help

- Check existing issues and discussions
- Join our community discussions
- Contact maintainers for urgent issues

## License

By contributing to SkripsiMate, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SkripsiMate! 🚀

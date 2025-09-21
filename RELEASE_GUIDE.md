# SkripsiMate Release Guide

## GitHub Actions Setup

The project now has automated builds for all platforms using GitHub Actions:

### Workflows:

1. **`build.yml`** - Production builds and releases
2. **`test.yml`** - Testing and linting
3. **`dev-build.yml`** - Development builds

## How to Release

### 1. Create a Release Tag

```bash
# Update version in package.json
npm version patch  # or minor, major

# Push the tag
git push origin main --tags
```

### 2. GitHub Actions will automatically:

- ✅ **Build for Windows** (NSIS installer + portable)
- ✅ **Build for macOS** (DMG + ZIP)
- ✅ **Build for Linux** (AppImage + DEB + RPM)
- ✅ **Create GitHub Release** with all files
- ✅ **Generate release notes**

### 3. Release Files Created:

#### Windows:
- `SkripsiMate Setup 1.0.0.exe` (Installer)
- `SkripsiMate 1.0.0.exe` (Portable)

#### macOS:
- `SkripsiMate-1.0.0.dmg` (Disk image)
- `SkripsiMate-1.0.0-mac.zip` (Archive)

#### Linux:
- `SkripsiMate-1.0.0.AppImage` (Portable)
- `skripsimate_1.0.0_amd64.deb` (Debian package)
- `skripsimate-1.0.0.x86_64.rpm` (RPM package)

## Development Workflow

### Feature Development:
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

### Pull Request:
- GitHub Actions will run tests and dev builds
- Review and merge to `main` branch

### Release:
```bash
# Merge to main
git checkout main
git merge feature/new-feature

# Create release tag
npm version patch
git push origin main --tags
```

## Manual Build (Local)

### Windows:
```bash
npm run dist-win
```

### macOS (requires macOS):
```bash
npm run dist-mac
```

### Linux (requires Linux/WSL):
```bash
npm run dist-linux
```

## Build Status

Check build status at: `https://github.com/XenchinRyu7/SkripsiMate/actions`

## Release History

- **v1.0.0** - Initial release with basic AI thesis planning
- **v1.0.1** - Bug fixes and improvements
- **v1.1.0** - New features and UI enhancements

## Troubleshooting

### Build Fails:
1. Check GitHub Actions logs
2. Ensure all dependencies are in `package.json`
3. Verify build scripts are correct

### Release Fails:
1. Check if tag was pushed correctly
2. Verify GitHub token permissions
3. Check artifact uploads

### Platform-Specific Issues:
- **Windows**: Usually works fine
- **macOS**: May need code signing for distribution
- **Linux**: AppImage should work on most distributions

## Next Steps

1. **Set up code signing** for macOS (optional)
2. **Add auto-updater** for seamless updates
3. **Create installer icons** for better branding
4. **Set up beta releases** for testing

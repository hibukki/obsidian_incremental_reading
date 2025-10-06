# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal Obsidian plugin template that provides a starting point for building Obsidian plugins with TypeScript.

## Development Commands

- `npm run dev` - Start development build with watch mode
- `npm run build` - Production build with TypeScript checking and esbuild bundling
- `npm run lint` - Run ESLint on TypeScript files
- `npm run format` - Format code with Prettier
- `npm run dev:link --vault=/path/to/vault` - Create symbolic link to develop in vault

## Architecture

### Core Components

- **Main Plugin (`main.ts`)**: The primary plugin class that manages initialization, settings, and the plugin lifecycle
- **TemplateView**: Custom Obsidian ItemView that renders a simple sidebar panel
- **TemplateSettings**: Interface for plugin settings with persistence

### File Structure

- `main.ts` - Main plugin file with core logic
- `manifest.json` - Plugin manifest with metadata
- `package.json` - NPM dependencies and scripts
- `esbuild.config.mjs` - Build configuration
- `tsconfig.json` - TypeScript configuration

### Build System

Uses esbuild for bundling with:

- TypeScript compilation
- External dependencies (Obsidian API)
- Development watch mode and production minification

### Settings and Configuration

- Settings are persisted using Obsidian's data storage
- Define settings in the `TemplateSettings` interface
- Load settings with `loadSettings()` on plugin load
- Save settings with `saveSettings()` when modified

### Plugin Installation for Development

Use the npm script to create a symbolic link:

```sh
npm run dev:link --vault=/path/to/your/vault
```

This creates a symlink at `/path/to/your/vault/.obsidian/plugins/plugin-template`

### Customization Guide

1. **Update Plugin Identity**:
   - Change `id`, `name`, `description` in `manifest.json`
   - Update `name`, `description` in `package.json`
   - Update the symlink path in package.json `dev:link` script

2. **Modify View**:
   - Change `getDisplayText()` for sidebar title
   - Change `getIcon()` for ribbon icon
   - Modify `onOpen()` to customize the view content

3. **Add Settings**:
   - Define settings interface in `TemplateSettings`
   - Add default values in `DEFAULT_SETTINGS`
   - Optionally create a settings tab (see Obsidian API docs)

4. **Add Features**:
   - Register commands with `addCommand()`
   - Register events with `registerEvent()`
   - Add ribbon icons with `addRibbonIcon()`

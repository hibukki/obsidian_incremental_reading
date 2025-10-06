# Obsidian Plugin Template

A minimal template for building Obsidian plugins with TypeScript.

## Features

- TypeScript support with type checking
- Hot reload during development
- ESLint and Prettier configured
- Simple sidebar view example
- Settings persistence

## Getting Started

### Install dependencies

```sh
npm install
```

### Development

Watch for changes and compile automatically:

```sh
npm run dev
```

### Link to your Obsidian vault

Create a symbolic link to develop the plugin in your vault:

```sh
npm run dev:link --vault=/path/to/your/vault
```

This will create a symlink at `/path/to/your/vault/.obsidian/plugins/plugin-template`

### Build for production

```sh
npm run build
```

## Customization

1. Update `manifest.json` with your plugin details (id, name, description, author)
2. Update `package.json` with your plugin name and details
3. Modify `main.ts` to implement your plugin functionality
4. Update the plugin icon in `main.ts` (currently `layout-template`)
5. Add settings in the `TemplateSettings` interface if needed

## Project Structure

- `main.ts` - Main plugin file with core logic
- `manifest.json` - Plugin manifest
- `package.json` - NPM dependencies and scripts
- `esbuild.config.mjs` - Build configuration
- `tsconfig.json` - TypeScript configuration

## Commands

- `npm run dev` - Development build with watch mode
- `npm run dev:link --vault=<path>` - Create symlink to vault
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

MIT

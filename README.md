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

## License

MIT

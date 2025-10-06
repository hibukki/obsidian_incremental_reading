# Incremental Reading Obsidian Plugin

## Screenshot

<img width="1126" height="467" alt="image" src="https://github.com/user-attachments/assets/3f416409-0e9b-4ef3-b52e-cff57c0d9ded" />

(The screenshot might not be up to date)

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

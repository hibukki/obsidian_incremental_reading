# Incremental Reading Obsidian Plugin

Any Obsidian note can be added to the Incremental Reading queue. A sidebar helps add/read notes.

## Screenshot

<img width="1121" height="585" alt="image" src="https://github.com/user-attachments/assets/ffba8260-ccdf-43be-89c5-95b0b75c9706" />

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

### Build for production

```sh
npm run build
```

### Test

```sh
npm run test
```

### Lint

```sh
npm run lint
```

## Philosophy

Try to use features from [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) when possible, including using their recommendations and defaults. It is a well respected library, so if we can conform to their standards, let's do it.

## License

MIT

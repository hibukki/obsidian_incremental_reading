# Incremental Reading Obsidian Plugin

Any Obsidian note can be added to the Incremental Reading queue. A sidebar helps add/read notes.

## Screenshots

<img width="1124" height="347" alt="image" src="https://github.com/user-attachments/assets/135c5ede-729d-4984-9175-ee4898aa7bb5" />

<img width="1118" height="204" alt="image" src="https://github.com/user-attachments/assets/19fa2f74-209a-499c-ba15-95e326d3579d" />


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

### Performance

TL;DR: Maintainability is more important than performance.

Specifically, we assume for now:

1. Not too many notes (so it's ok to go over all of them to look for the next high priority one. Simpler than e.g a heap)
2. The obsidian notes are local files, access is very fast (so we can use them as the source of truth and not rely on cache)

## License

MIT

# Obsidian Claude Copilot

## Original template

This is a fork of the [Obsidian Plugin Template](https://github.com/obsidianmd/obsidian-sample-plugin).

## How to use

-   Clone this repo.
-   Make sure your NodeJS is at least v16 (`node --version`).
-   `npm i` or `yarn` to install dependencies.
-   `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

```sh
ln -s "/PATH/TO/CURRENT/FOLDER" "/PATH/TO/OBSIDIAN/VAULT/.obsidian/plugins/OBSIDIAN-PLUGIN-NAME"
```

## Improve code quality with eslint (optional)

-   [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
-   To use eslint with this project, make sure to install eslint from terminal:
    -   `npm install -g eslint`
-   To use eslint to analyze this project use this command:
    -   `eslint main.ts`
    -   eslint will then create a report with suggestions for code improvement by file and line number.
-   If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
    -   `eslint .\src\`

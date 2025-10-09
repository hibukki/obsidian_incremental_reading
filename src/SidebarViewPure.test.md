# SidebarViewPure Tests

This file contains snapshot tests for the `SidebarViewPure` component.

## Setup

Before running tests, install dependencies:

```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Update snapshots (if component UI changes are intentional):
```bash
npm test -- -u
```

## Test Scenarios

The test file includes snapshots for:

1. **User reviewing a note** - Shows due notes with difficulty rating buttons visible
2. **No notes to review** - Shows completed state with happy message
3. **Notes due later today** - Shows notes scheduled but not yet due
4. **After rating a note** - Shows status message after user rated a note

## Architecture

- `SidebarViewPure.tsx` - Pure presentational component (no side effects, all data via props)
- `SidebarView.tsx` - Container component that manages state and connects to the Obsidian plugin
- `SidebarViewPure.test.tsx` - Snapshot tests for the pure component

This separation makes the UI easy to test without mocking the Obsidian API extensively.

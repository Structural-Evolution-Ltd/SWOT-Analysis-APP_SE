# SWOT Analysis App

A React + TypeScript web application for creating and managing SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses.

## Features

- **Four SWOT quadrants** — Strengths 💪, Weaknesses ⚠️, Opportunities 🚀, and Threats 🛡️
- **Add, edit, delete items** in each quadrant
- **Editable analysis title** — click on the title to rename your analysis
- **Automatic persistence** — data is saved automatically to `localStorage`
- **Export to JSON** — download your SWOT data as a JSON file
- **Import from JSON** — load a previously exported SWOT file
- **Clear all** — reset all items with a confirmation prompt
- **Responsive design** — works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── SwotQuadrant.tsx   # Individual SWOT quadrant component
│   └── SwotQuadrant.css   # Quadrant styles
├── test/
│   ├── setup.ts           # Vitest setup (jest-dom)
│   ├── types.test.ts      # Unit tests for types utilities
│   ├── storage.test.ts    # Unit tests for localStorage persistence
│   ├── SwotQuadrant.test.tsx  # Component tests for SwotQuadrant
│   └── App.test.tsx       # Integration tests for the App
├── App.tsx                # Main App component
├── App.css                # App-level styles
├── index.css              # Base/reset styles
├── main.tsx               # React entry point
├── storage.ts             # localStorage persistence & JSON import/export
└── types.ts               # TypeScript types and data utilities
```

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool
- [Vitest](https://vitest.dev/) — test runner
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) — component testing

# AGENTS.md

This file contains information for AI agents working on this project.

## Project Overview
Sets Tracker - A React app for tracking gym exercises, sets, and reps with local storage persistence.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with watch mode)
npm run dev

# Build for production
npm run build
```

## Project Structure
- `content.jsx` - Main React application component
- `index.html` - HTML entry point
- `src/styles.css` - Tailwind CSS input file
- `dist/` - Build output directory (gitignored)
- `package.json` - Dependencies and scripts

## Tech Stack
- React 18 with JSX
- Tailwind CSS for styling
- esbuild for bundling and development server
- Local Storage for data persistence

## Key Features
- Add and track exercises
- Record sets and reps
- View workout history grouped by date
- Responsive design
- Modal-based form interface

## Notes
- No backend - uses localStorage for persistence
- Development server runs on port 8000
- Build outputs to `dist/` directory
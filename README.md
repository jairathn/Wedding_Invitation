# Shriya & Neil — Wedding Invitation

An interactive wedding invitation web app built with React + Vite, featuring an animated envelope opening experience, guest list verification, and a full guest portal with photo/video uploads, schedule, and directory.

## Features

- Animated envelope opening with personalized greeting
- Guest list verification with fuzzy name matching
- Photo and video uploads to a shared gallery
- Event schedule and guest directory
- Personalized messages for invited guests

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

- `src/` — React app source
- `src/wedding-app/` — Guest portal app (post-invitation)
- `src/components/` — Invitation envelope and shared components
- `src/data/guests.json` — Master guest list (used at build time)
- `public/data/guests.json` — Public guest list (fetched at runtime by the envelope)
- `api/` — Vercel serverless API routes

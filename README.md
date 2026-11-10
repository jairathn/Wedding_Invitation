# Shriya & Neil — Wedding Site

React + Vite site for Shriya & Neil's wedding (Barcelona, September 9–11, 2026).

- **`/`** — the thank-you card. Guests tap the wax seal, enter their name, watch the
  first-dance clip inside the envelope, then read their personal letter and browse the photos.
- **`/invitation`** — the original invitation, unchanged, for guests who want to see it again.
- **`/app`**, **`/admin`** — the wedding-weekend guest app and its dashboard.
- **`/public`**, **`/privacy`**, **`/sms-terms`** — SMS opt-in and policy pages.

Only guests who attended can open either card (`src/data/attendees.json`). A guest's
device remembers them for 60 days, so a return visit opens straight to their card.

## Common edits

| To change… | Edit |
| --- | --- |
| A guest's letter or salutation | `src/thank-you/data/letters.json` (keep the wording exactly as written) |
| Who can open a card / alternate names | `src/data/attendees.json` (`aliases` = other names a guest may type, `greet` = the name you call them by) |
| Vogue article link, song, card video, dates | `src/thank-you/config.js` (`vogueUrl`, `musicSrc`, `cardVimeoId`, …) |
| The clip inside the envelope | `public/video/thank-you-dance.mp4` (see `source-media/README.md`) |
| Gallery order, chapters, captions | `src/thank-you/data/photos.json` (`seq`, `chapter`, `alt`) |

## Photos

Photos for the gallery go in `source-media/photos/`: full-size originals, or the
zip files made by the photo packer. Never put them in `public/`, which is
published exactly as it is. Then:

```bash
npm run photos
```

This writes web sizes to `public/photos/` (`-sm` for film strips, `-md` for the grid,
`-lg` for the lightbox) and refreshes `src/thank-you/data/photos.json`. Zips are
unpacked automatically, and when the same photo is there twice the larger one is used.
Re-running keeps what's set in `photos.json`: each photo's place (`seq`), its
`chapter` and caption (`alt`), and the `excluded` list of files to leave out (the
sneak-peek repeats). New photos without a `seq` go at the end, by capture time where
the camera recorded it (film scans don't count), otherwise by file name.
`npm run photos:hero` rebuilds the background images from `source-media/photos/shriyaneil_wedding0594.jpg`.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project structure

- `src/thank-you/` — thank-you experience (page, components, config, letters, photo manifest)
- `src/pages/InvitationPage.jsx`, `src/components/` — the original invitation
- `src/lib/guests.js` — name matching shared by both cards (aliases, typos, maiden names)
- `src/wedding-app/` — guest portal app (`/app`)
- `scripts/process-photos.mjs` — image pipeline
- `source-media/` — full-size originals (kept for re-processing, never deployed)
- `api/` — Vercel serverless API routes for the guest app

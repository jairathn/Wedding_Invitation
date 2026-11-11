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
| The clip inside the envelope | `public/video/first-dance.mp4` (see `source-media/README.md`) |
| Gallery chapters, highlights, order, captions | `src/thank-you/data/photos.json` (`chapter`, `featured`, `seq`, `alt`) |

## Photos

The gallery holds Ruben's full set, 1,127 photos. It opens on the highlights (the
photos marked `"featured": true`, which also run along the film strips), then has a
tab for each chapter: Haldi, Sangeet, The Wedding and On Film. Photos load only as
they come into view.

The full set of full-size photos is not in this repository (it would add over
500 MB); it is in Google Drive ("Ruben Photos"). `source-media/photos/` keeps the
originals of the photos first chosen for the site. To add or re-make photos, put
them in a folder (full-size originals, or zips made by the photo packer) and run:

```bash
node scripts/process-photos.mjs gallery <folder> [more folders or zips]
```

`npm run photos` does the same for `source-media/photos/`. This writes web sizes to
`public/photos/` (`-sm` for the film strips and small tiles, `-md` for the grid,
`-lg` for the full-screen viewer) and adds the photos to
`src/thank-you/data/photos.json`. Zips are unpacked automatically, and when the same
photo is there twice the larger one is used. Photos already in the gallery stay, so
you can add a few at a time.

`photos.json` has one photo per line, in gallery order, and is safe to edit by hand;
re-running keeps the edits:

- `chapter`: the tab a photo sits in. New photos get one from their file name
  (`haldi`, `sangeet`, `wedding`, or a film scan's date-style name).
- `featured`: `true` puts a photo in the highlights.
- `seq`: a number moves a photo ahead within its chapter; the rest follow the
  photographer's file order (their files are numbered in shooting order).
- `alt`: a caption.
- `excluded` (at the top): file names to leave out. Ruben's `preview` files are
  always left out, since they repeat photos from the wedding set.

To take a photo out, add its file name to `excluded`, delete its line, and delete its
three files in `public/photos/`.
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

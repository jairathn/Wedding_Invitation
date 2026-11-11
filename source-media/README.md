# Source media (not deployed)

Full-size originals live here so they can be re-processed, but nothing in this
folder is served by the website (only `public/` is).

- `photos/` — the gallery's photos by Ruben Larruy: the photo packer's zips of the
  photos chosen for the site, plus a few full-size originals (the film scans and the
  background photo). `npm run photos` turns them into web sizes; zips are unpacked
  automatically.
- `Shriya Neil Dance.mp4` — the first-dance clip played inside the envelope. Its web
  version is `public/video/first-dance.mp4`: the black bands cropped off
  (720×1080), scaled to 540×810, H.264, no sound, with `first-dance-poster.jpg`
  as its first frame. Give a new version a new file name (browsers cache /video
  for a day) and update `ENVELOPE_CLIP` in `src/thank-you/config.js`.

# Source media (not deployed)

Full-size originals live here so they can be re-processed, but nothing in this
folder is served by the website (only `public/` is).

- `photos/` — originals of the gallery's highlights by Ruben Larruy: the photo
  packer's zips of the photos first chosen for the site, plus a few full-size
  originals (film scans and the background photo). The rest of Ruben's 1,127 photos
  are not kept here (over 500 MB); they are in Google Drive ("Ruben Photos"). See
  "Photos" in the main README for how photos become web sizes.
- `photos-rps/` — notes on RPS Films' behind-the-scenes photos (see its readme).
- `Shriya Neil Dance.mp4` — the first-dance clip played inside the envelope. Its web
  version is `public/video/first-dance.mp4`: the black bands cropped off
  (720×1080), scaled to 540×810, H.264, no sound, with `first-dance-poster.jpg`
  as its first frame. Give a new version a new file name (browsers cache /video
  for a day) and update `ENVELOPE_CLIP` in `src/thank-you/config.js`.

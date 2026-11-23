# Source media (not deployed)

Full-size originals live here so they can be re-processed, but nothing in this
folder is served by the website (only `public/` is).

- `photos/` — originals of the gallery's highlights by Ruben Larruy: the photo
  packer's zips of the photos first chosen for the site, plus a few full-size
  originals (film scans and the background photo). The rest of Ruben's 1,127 photos
  are not kept here (over 500 MB); they are in Google Drive ("Ruben Photos"). See
  "Photos" in the main README for how photos become web sizes.
- `photos-rps/` — notes on RPS Films' behind-the-scenes photos (see its readme).
- `envelope-dance.gif` — the clip played inside the envelope: RPS Films' shot of
  the dance with sparklers, fading to their logo (640×360, 10 frames a second,
  5 seconds). Its web version is `public/video/envelope-dance.mp4`, made with:

  ```bash
  ffmpeg -i source-media/envelope-dance.gif -vf "fps=10,format=yuv420p" -c:v libx264 -profile:v high -level 3.1 -preset veryslow -crf 17 -tune film -movflags +faststart -an public/video/envelope-dance.mp4
  ffmpeg -i public/video/envelope-dance.mp4 -frames:v 1 -q:v 2 public/video/envelope-dance-poster.jpg
  ```

  The poster is its first frame, shown while the clip loads. Give a new version
  a new file name (browsers cache /video for a day) and update `ENVELOPE_CLIP`
  in `src/thank-you/config.js`; for a wide clip keep `focus` on the middle of
  the frame, since the envelope's window is tall.
- `Shriya Neil Dance.mp4` — the earlier envelope clip, the first dance under the
  flowers. Its web version was 540×810 (the black bands cropped off), H.264, no
  sound.

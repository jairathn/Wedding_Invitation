# Source media (not deployed)

Full-size originals live here so they can be re-processed, but nothing in this
folder is served by the website (only `public/` is).

- `photos/` — originals of the gallery's highlights by Ruben Larruy: the photo
  packer's zips of the photos first chosen for the site, plus a few full-size
  originals (film scans and the background photo). The rest of Ruben's 1,127 photos
  are not kept here (over 500 MB); they are in Google Drive ("Ruben Photos"). See
  "Photos" in the main README for how photos become web sizes.
- `photos-rps/` — notes on RPS Films' behind-the-scenes photos (see its readme).
- `envelope-dance.mp4` — the clip played inside the envelope: RPS Films' shot of
  the dance with sparklers, fading to their logo (1920×1080, 30 frames a second,
  4.9 seconds). Its web version is `public/video/envelope-dance-hd.mp4`: the
  middle of the frame (972×1080, where the dancers and the logo are; the
  envelope's window is tall and shows no more than that), scaled to 720×800,
  H.264, no sound. Made with:

  ```bash
  ffmpeg -i source-media/envelope-dance.mp4 -vf "crop=972:1080:474:0,scale=720:800:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v high -level 3.1 -preset veryslow -crf 21 -movflags +faststart -an public/video/envelope-dance-hd.mp4
  ffmpeg -i public/video/envelope-dance-hd.mp4 -frames:v 1 -q:v 2 public/video/envelope-dance-hd-poster.jpg
  ```

  The poster is its first frame, shown while the clip loads. Give a new version
  a new file name (browsers cache /video for a day) and update `ENVELOPE_CLIP`
  in `src/thank-you/config.js`.
- `Shriya Neil Dance.mp4` — the earlier envelope clip, the first dance under the
  flowers. Its web version was 540×810 (the black bands cropped off), H.264, no
  sound.

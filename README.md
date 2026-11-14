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
| RPS Films' tab: name, heading, invitation, preview photos | `src/thank-you/config.js` (`photoSets`) |
| Who is in which photo (each guest's Your Photos tab) | `src/thank-you/data/people.json` (see [Your Photos](#your-photos)) |

## Photos

The gallery holds Ruben's full set, 1,127 photos. It opens on the guest's own photos
when they have any (see [Your Photos](#your-photos)), then the highlights (the
photos marked `"featured": true`, which also run along the film strips), then a
tab for each chapter: Haldi, Sangeet, The Wedding and On Film. After Ruben's
chapters comes RPS Films' tab: 715 behind-the-scenes photos from the whole week
(Barcelona, Mehndi, Haldi, Sangeet, The Wedding), with an invitation to it ("Want
more photos?") at the end of the highlights and of the last chapter. Photos load
only where the guest is looking.

The full-size photos are not in this repository (they would add well over 500 MB).
Ruben's are in Google Drive ("Ruben Photos"); RPS Films' came as two zips.
`source-media/photos/` keeps the originals of the photos first chosen for the site.
To add or re-make photos, put them in a folder (full-size originals, or zips made by
the photo packer) and run:

```bash
node scripts/process-photos.mjs gallery <folder> [more folders or zips]
```

`npm run photos` does the same for `source-media/photos/`. This writes web sizes to
`public/photos/` (`-sm` for the film strips and small tiles, `-md` for the grid,
`-lg` for the full-screen viewer) and adds the photos to
`src/thank-you/data/photos.json`. Folders are read at any depth and zips are unpacked
automatically; when the same photo is there twice the larger one is used. Photos
already in the gallery stay, so you can add a few at a time.

Photos by another photographer go in as a set of their own, with the chapter to put
them in:

```bash
node scripts/process-photos.mjs gallery --set rps --chapter "Mehndi" <folder>
```

The set's name in the tab, its heading, the invitation's wording and its preview
photos are under `photoSets` in `src/thank-you/config.js`.

`photos.json` has one photo per line, in gallery order, and is safe to edit by hand;
re-running keeps the edits:

- `chapter`: the tab (or, in a set, the section) a photo sits in. New photos get one
  from their file name (`haldi`, `sangeet`, `wedding`, or a film scan's date-style
  name) unless `--chapter` says otherwise.
- `featured`: `true` puts a photo in the highlights.
- `seq`: a number moves a photo ahead within its chapter; the rest follow the
  photographer's file order (their files are numbered in shooting order). RPS
  Films' photos all have one, since their cameras' numbers don't follow the week.
- `alt`: a caption.
- `set`: whose photos these are, when not Ruben's (`rps`).
- `excluded` (at the top): file names to leave out, such as copies. Ruben's
  `preview` files are always left out, since they repeat photos from the wedding set.

`npm run build` checks `photos.json` first (`npm run check:photos` on its own): a
slip such as a missing comma, or a photo whose web files are missing, stops the build
with a message saying where, and the live site keeps its last good version.

To take a photo out, add its file name to `excluded`, delete its line, and delete its
three files in `public/photos/`.
`npm run photos:hero` rebuilds the background images from `source-media/photos/shriyaneil_wedding0594.jpg`.

## Your Photos

A guest who is in at least one photo gets a Your Photos tab, first in the gallery:
the photos their household is in (theirs and their family's), from both
photographers, by event. A guest who is in none gets no tab, even when their
family has photos. A film-strip frame still opens among the highlights.

Nothing is matched automatically. Faces in the web photos were found and grouped by
likeness (InsightFace's `buffalo_l` models, with strict grouping), giving 293 groups of
faces seen in two or more photos. On a private page on claude.ai ("Who's Who"), the
couple names each group: a guest, Shriya or Neil, not a guest, or not sure. Groups
marked not sure, or not a guest, are left out. Then:

```bash
node scripts/people.mjs <faces.json> <tags.json> [--extra <extra.json>]
```

- `faces.json`: the groups, published with the Who's Who page.
- `tags.json`: the names given (the page's saved `tags`).
- `extra.json`: photos added by hand, under a household's letter (they join its tab)
  or a guest's name exactly as in `attendees.json` (they join that household's tab,
  and the guest gets the tab): `{ "<letter or guest name>": ["photo-id", ...] }`.

A name typed on the page that isn't on the guest list is looked up among the aliases
in `src/data/attendees.json`. If it still matches no one, the script reports it and
leaves it out.

Faces too small or too turned away to be grouped were then matched to the named
rows. A face counts only when it is clearly closer to one household's rows than to
anyone else's (similarity 0.5 or more, at least 0.1 ahead). Every one of those matches
was checked by eye, by two reviewers working separately and then once more, before
its photo was added. These photos are in `extra.json`, kept with the Who's Who page
like `faces.json`; pass it with `--extra` when re-running, or they drop out.

A second private page, "Who's Missing", shows the faces no one has been named for,
so the couple can find guests who are in none of the named rows. Its faces are
grouped by the families they stand beside, and include look-alike leads drawn from
the faces already named. Later rounds added faces like photos of the missing guests
that the couple sent, and the small background faces (16 to 40 pixels across) that
the grouping skipped. Faces named there go into `extra.json` under the guest's name.

`people.json` has two parts. `households` maps each household (its `letter` in
`attendees.json`) to photo ids, one household per line. `people` lists the guests
who are in at least one of those photos themselves; only they get the tab. Both are
safe to edit by hand: to take a photo out of a household's tab, delete its id (and
if those were the only photos someone is in, take their name out of `people`); to
give a guest the tab, add their name exactly as in `attendees.json`. Re-running
`scripts/people.mjs` rewrites both parts, so for a change that lasts, put the photos
in `extra.json` under the guest's name. `npm run build` checks that every id is in
`photos.json`, every household is on the guest list, everyone in `people` is a guest
whose household has photos, and every household with photos has someone in
`people`. The couple's own card
(`couple`) has their photos too, shown in the chapters' smaller rows since there
are so many.

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
- `scripts/people.mjs` — each household's Your Photos, from the couple's naming of face groups
- `source-media/` — full-size originals (kept for re-processing, never deployed)
- `api/` — Vercel serverless API routes for the guest app

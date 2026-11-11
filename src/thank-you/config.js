// Everything on the thank-you site that is likely to change lives here.

export const THANK_YOU = {
  // Background song (public/audio/). Loops; fades in on the first tap.
  musicSrc: '/audio/tu-mil-jaaye.mp3',
  // Start the song this many seconds in (e.g. to begin at the chorus).
  musicStartAt: 0,

  // Video on the front of the card. Placeholder: the engagement film used on
  // the invitation. Swap in the videographer's teaser's Vimeo id when ready.
  cardVimeoId: '1149072071',

  // Paste the Vogue article link here once it is published; until then the
  // card shows a quiet "coming soon" line in its place.
  vogueUrl: '',

  photographer: 'Ruben Larruy',
  hashtag: '#JayWalkingToJairath',
  dates: 'September 9 – 11, 2026',
  place: 'Barcelona, Spain',
};

// The clip that plays inside the envelope once a guest enters their name:
// the first dance under the flowers, fireworks overhead. It plays once, holds
// on its last frame (the embrace) for `holdAfterEnd` seconds, then the card
// slides out. `seconds` is its length, used until the file reports its own;
// `focus` frames it in the envelope's window (the dancers sit low). The
// velvet is the envelope's darkest tone. Web version made from
// source-media/Shriya Neil Dance.mp4 (see source-media/README.md); give it a
// new file name whenever it changes, since browsers cache /video for a day.
export const ENVELOPE_CLIP = {
  src: '/video/first-dance.mp4',
  poster: '/video/first-dance-poster.jpg',
  velvet: '#0A0A0A',
  seconds: 4.3,
  holdAfterEnd: 1.2,
  focus: '50% 88%',
};

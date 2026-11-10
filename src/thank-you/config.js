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

// The clip that plays inside the envelope once a guest enters their name.
// The envelope is coloured to match the clip's letterbox (#0A0A0A) so the
// footage melts into black velvet. Web version made from
// source-media/Neil Shriya Dance.mp4 (see source-media/README.md).
export const ENVELOPE_CLIP = {
  src: '/video/thank-you-dance.mp4',
  poster: '/video/thank-you-dance-poster.jpg',
  velvet: '#0A0A0A',
};

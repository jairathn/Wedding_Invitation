// Everything on the thank-you site that is likely to change lives here.

export const THANK_YOU = {
  // Background song (public/audio/). Loops; fades in on the first tap.
  musicSrc: '/audio/tu-mil-jaaye.mp3',
  // Start the song this many seconds in (e.g. to begin at the chorus).
  musicStartAt: 0,

  // Video on the front of the card: the wedding teaser by RPS Films
  // (https://vimeo.com/1249319814). The invitation keeps the engagement film.
  cardVimeoId: '1249319814',

  // The Vogue India story about the wedding. Linked from the front of the
  // card and from the end of the photographs; leave empty to hide both links.
  vogueUrl: 'https://www.vogue.in/gallery/this-couple-turned-the-wine-cellar-of-an-11th-century-spanish-castle-into-a-nightclub-for-their-wedding-after-party',

  photographer: 'Ruben Larruy',
  // Other photographers' photos (marked "set" in photos.json): each gets its
  // own tab after Ruben's chapters, with this credit and an invitation to look.
  photoSets: {
    rps: {
      name: 'RPS Films',
      title: 'Behind the Scenes',
      invite: 'See the work of RPS Films, who generously took more behind-the-scenes photos the whole week!',
      covers: ['rps-aksh9130', 'rps-aksh0022', 'rps-dsc9255'], // shown with the invitation
    },
  },
  hashtag: '#JayWalkingToJairath',
  dates: 'September 9 – 11, 2026',
  place: 'Barcelona, Spain',
};

// The clip that plays inside the envelope once a guest enters their name:
// RPS Films' shot of the couple dancing, sparklers behind, fading to
// their logo. It plays once, holds on its last frame for `holdAfterEnd`
// seconds, then the card slides out. `seconds` is its length, used until the
// file reports its own; `focus` frames it in the envelope's window. The
// velvet is the envelope's darkest tone. Web version made from
// source-media/envelope-dance.mp4, cropped to the middle of the frame, where
// the dancers and the logo are, since the window is tall (see
// source-media/README.md); give it a new file name whenever it changes, since
// browsers cache /video for a day.
export const ENVELOPE_CLIP = {
  src: '/video/envelope-dance-hd.mp4',
  poster: '/video/envelope-dance-hd-poster.jpg',
  velvet: '#0A0A0A',
  seconds: 4.9,
  holdAfterEnd: 1.2,
  focus: '50% 50%',
};

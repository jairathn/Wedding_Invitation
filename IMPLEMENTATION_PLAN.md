# Wedding Invitation - Implementation Plan

## Project Overview

A beautiful, animated digital wedding invitation for **Shriya Jayswal & Neil Jairath's** wedding in Barcelona, Spain (September 9-11, 2026). The experience mimics a trifold invitation that opens to reveal a personalized video message.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18 + Vite** | Fast, modern framework with excellent DX |
| **Framer Motion** | Industry-leading animation library |
| **Tailwind CSS** | Rapid, elegant styling |
| **Google Fonts** | Cormorant Garamond (elegant serif) + Montserrat (clean sans) |

---

## Design System

### Color Palette (Mediterranean Spain)

```
Primary:
- Terracotta:     #C4725E  (warm, earthy)
- Golden Sand:    #D4A853  (sunny, celebratory)

Secondary:
- Olive Green:    #6B7B3C  (natural, garden)
- Soft Cream:     #FAF7F2  (elegant background)
- Deep Charcoal:  #2C2C2C  (text)

Accents:
- Blush Pink:     #E8D5D0  (romantic)
- Warm White:     #FFFEF9  (cards, overlays)
```

### Typography

```
Headers/Names:    Cormorant Garamond (italic for romance)
Monogram:         Cormorant Garamond (elegant initials)
Body/Buttons:     Montserrat (clean, readable)
```

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Background: Castell (20% opacity)              │  │
│  │                                                        │  │
│  │              ┌─────────────────────┐                   │  │
│  │              │   CLOSED TRIFOLD    │                   │  │
│  │              │                     │                   │  │
│  │              │      S & N          │                   │  │
│  │              │    (monogram)       │                   │  │
│  │              │                     │                   │  │
│  │              │  Shriya & Neil      │                   │  │
│  │              │                     │                   │  │
│  │              │  [Engagement Photo] │                   │  │
│  │              │                     │                   │  │
│  │              │ [Open Invitation]   │                   │  │
│  │              └─────────────────────┘                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Click "Open Invitation"
┌─────────────────────────────────────────────────────────────┐
│                    NAME ENTRY MODAL                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │         "Please enter your name as it appears          │  │
│  │              on your invitation"                       │  │
│  │                                                        │  │
│  │              ┌─────────────────────┐                   │  │
│  │              │                     │                   │  │
│  │              └─────────────────────┘                   │  │
│  │                   [Continue]                           │  │
│  │                                                        │  │
│  │  (Error: "We couldn't find that name. Please try       │  │
│  │   the name exactly as shown on your invitation.")      │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Valid name entered
┌─────────────────────────────────────────────────────────────┐
│              TRIFOLD OPENING ANIMATION                       │
│                                                              │
│  Left panel folds back ← │ Center │ → Right panel folds back │
│                                                              │
│  (3D CSS transform with perspective, ~1.5s duration)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Animation completes
┌─────────────────────────────────────────────────────────────┐
│                    OPENED INVITATION                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │              Welcome, [Guest Name]!                    │  │
│  │                                                        │  │
│  │         ┌─────────────────────────────┐                │  │
│  │         │                             │                │  │
│  │         │      VIDEO PLAYER           │                │  │
│  │         │      (click to play)        │                │  │
│  │         │                             │                │  │
│  │         └─────────────────────────────┘                │  │
│  │                                                        │  │
│  │            #JayWalkingToJairath                        │  │
│  │                                                        │  │
│  │     Barcelona, Spain · September 9-11, 2026            │  │
│  │                                                        │  │
│  │    ┌─────────────────────────────────────┐             │  │
│  │    │  Click to RSVP at Zola!             │             │  │
│  │    │  Our password is Barcelona2026       │             │  │
│  │    └─────────────────────────────────────┘             │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
wedding-invitation/
├── public/
│   ├── images/
│   │   ├── castell-background.jpg      # Venue photo (provided)
│   │   └── engagement-photo.jpg        # Couple's photo (provided)
│   └── video/
│       └── wedding-video.mp4           # 30-second video (provided later)
│
├── src/
│   ├── components/
│   │   ├── Background.jsx              # Transparent castle background
│   │   ├── TrifoldInvitation.jsx       # Main trifold component
│   │   ├── ClosedInvitation.jsx        # Front of closed trifold
│   │   ├── Monogram.jsx                # S&N elegant monogram
│   │   ├── NameEntryModal.jsx          # Guest name validation
│   │   ├── OpenedInvitation.jsx        # Revealed content
│   │   ├── VideoPlayer.jsx             # Custom styled video player
│   │   └── RSVPButton.jsx              # Zola link button
│   │
│   ├── data/
│   │   └── guests.json                 # Guest name list
│   │
│   ├── hooks/
│   │   └── useGuestValidation.js       # Name lookup logic
│   │
│   ├── styles/
│   │   └── animations.css              # Custom keyframes
│   │
│   ├── App.jsx                         # Main app component
│   ├── index.css                       # Tailwind imports + globals
│   └── main.jsx                        # React entry point
│
├── index.html
├── tailwind.config.js                  # Custom colors, fonts
├── vite.config.js
└── package.json
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Vite + React project
2. Install dependencies (framer-motion, tailwindcss)
3. Configure Tailwind with custom colors and fonts
4. Set up Google Fonts (Cormorant Garamond, Montserrat)
5. Create base file structure

### Phase 2: Static Components
6. Create Background component with castle image
7. Build Monogram component (S&N)
8. Build ClosedInvitation layout
9. Add engagement photo display
10. Style "Open Invitation" button

### Phase 3: Name Validation
11. Create guests.json structure
12. Build NameEntryModal component
13. Implement guest validation hook
14. Add error state with retry capability

### Phase 4: Animations
15. Implement trifold opening animation (3D transforms)
16. Add staggered reveal animations for content
17. Create smooth modal transitions
18. Add micro-interactions (hover states, button feedback)

### Phase 5: Opened Invitation Content
19. Build OpenedInvitation layout
20. Create custom VideoPlayer component
21. Style hashtag display
22. Build RSVPButton component

### Phase 6: Responsive Design
23. Mobile-first adjustments
24. Touch-friendly interactions
25. Video player mobile optimization
26. Test across breakpoints

### Phase 7: Polish & Optimization
27. Performance optimization (lazy loading, image compression)
28. Accessibility improvements
29. Loading states
30. Final testing and refinement

---

## Animation Details

### Trifold Opening Animation
```javascript
// Using Framer Motion with 3D perspective
const trifoldVariants = {
  closed: {
    rotateY: 0,
    scale: 1,
  },
  opening: {
    rotateY: -180,
    transition: {
      duration: 1.5,
      ease: [0.43, 0.13, 0.23, 0.96], // Custom easing
    }
  }
};

// Container needs perspective for 3D effect
style={{ perspective: 1500 }}
```

### Content Reveal (Staggered)
```javascript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};
```

---

## Guest List Format (guests.json)

```json
{
  "guests": [
    { "name": "John Smith", "aliases": ["John", "Johnny Smith"] },
    { "name": "Jane Doe", "aliases": ["Jane"] },
    // ... more guests
  ]
}
```

Name matching will be:
- Case-insensitive
- Trim whitespace
- Check primary name and aliases
- Partial match support (first name only if unique)

---

## Responsive Breakpoints

| Breakpoint | Design Adjustments |
|------------|-------------------|
| Mobile (<640px) | Full-width trifold, stacked layout, larger touch targets |
| Tablet (640-1024px) | Scaled trifold, comfortable spacing |
| Desktop (>1024px) | Full elegant layout with hover effects |

---

## Assets Needed (from you)

1. **castell-background.jpg** - Castell de Sant Marçal photo (provided)
2. **engagement-photo.jpg** - Couple's photo (provided)
3. **wedding-video.mp4** - 30-second video (to be provided)
4. **guests.json** - Guest name list (to be provided)
5. **Zola URL** - RSVP link (to be provided)

---

## Questions Resolved

| Question | Answer |
|----------|--------|
| Couple names | Shriya Jayswal & Neil Jairath |
| Display names | Shriya & Neil |
| Monogram | S & N |
| Dates | September 9-11, 2026 |
| Location | Barcelona, Spain |
| Hashtag | #JayWalkingToJairath |
| Zola password | Barcelona2026 |
| Video behavior | Click to play (not autoplay) |
| Invalid name | Polite message + retry |
| Mobile | Fully responsive |

---

## Ready to Build!

This plan covers everything needed for an elegant, performant wedding invitation. The trifold animation will be the showstopper, with the video reveal creating an emotional moment for your guests.

**Estimated structure:** ~15 files, ~1500 lines of code
**Key focus:** Animation smoothness, elegant typography, emotional impact

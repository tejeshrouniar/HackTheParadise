# Accessibility notes

Accessibility is part of the interaction model, not a final styling pass. These notes describe the support present in the current source; they are not a claim of WCAG certification.

## Implemented patterns

- The application has a skip link, labeled route navigation, current-page state, semantic forms, and visible keyboard focus rules in `src/styles/tokens.css`.
- Modal dialogs use the shared Radix-backed `src/components/ui/Modal.tsx` wrapper for focus handling, Escape, and background isolation.
- The World Map uses labeled native buttons for book selection, movement, and level entry. Both routes support keyboard movement, pointer/touch controls, and a direct chapter list; locked landmarks announce the progression requirement and cannot be entered. The player can click-to-walk on the scene. Reduced-motion preferences suppress the animated chapter arrival, while the avatar animation follows the shared motion preference.
- Quest completion, wallet errors, narration captions, and other changing status messages use live regions where appropriate.
- The user preference and operating-system reduced-motion settings feed `MotionConfig`; CSS disables selected decorative loops and transitions.
- The soundtrack does not autoplay. Bundled narration has native audio controls and visible story text remains available when playback fails.
- The layout uses responsive breakpoints, touch-sized trail controls, and form labels. Pixel art uses crisp rendering while preserving the surrounding text interface.
- The bookshelf uses labeled native buttons to select books. Route and book page turns honor reduced-motion preferences; the shelf changes to a compact two-column layout on narrow screens.

## When changing a screen

1. Use a native button for an action and a link for navigation. Give icon-only controls an accessible name.
2. Keep keyboard order aligned with the visual task order; do not remove focus outlines.
3. Make locked/unavailable state clear in text, not only color or animation.
4. Keep captions/transcripts visible when sound conveys story or result information.
5. Honor reduced motion without skipping information or quest steps.
6. Check narrow layouts and zoom; controls and status must not be clipped or covered by the floating player.

## Validation limits

The automated suite checks code, progression, sprite timing, and database permissions. It does not run axe-core or a screen reader, and this repository has no automated contrast certification. Before a public accessibility claim, perform a manual keyboard pass and test at least one screen reader/browser combination plus 200% zoom on the main routes.

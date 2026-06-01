# Product

## Register

product

## Users

Single user: Brian, a Spanish learner studying vocabulary drawn from *Cien años de soledad*. Uses the app in focused personal study sessions — not a classroom tool, not a shared product. Primary motivation is reading comprehension, not conversational fluency. Context sentences from the actual book are a key differentiator.

## Product Purpose

A personal spaced-repetition vocabulary trainer tied to a specific literary source. Success means words from the book become instantly recognizable while reading. The app should feel like a worthy companion to a serious book — not a gamified language app for beginners.

## Brand Personality

Immersive, focused, literary. Three words: warm, intentional, calm.

Emotional goal: studying vocabulary should feel like reading by candlelight in Macondo — not a chore, not a game, but something quietly compelling. The interface earns attention rather than demanding it.

## Anti-references

- Anki: too clinical, grey, joyless. Study tools can be beautiful.
- Duolingo: too gamified, too childlike, too loud. No streaks, no XP bars, no cartoon owls.
- Generic dark SaaS (Linear, Vercel dashboard): cold slate + indigo is workmanlike but anonymous. This app has a personality.
- Standard AI-generated dark mode: Tailwind slate palette (--bg: #0f172a, --surface: #1e293b, --accent: #6366f1) is the saturated AI default. Replace it entirely.
- Aurora / Nordic / Midnight themes: the previous "Midnight Norway" palette was replaced with "Macondo by Candlelight" — warm earth tones, light rising from below. Do not revert.

## Design Principles

1. **The book is the soul.** Example sentences from *Cien años de soledad* are a feature, not a footnote. Surface them with care: guillemets « », EB Garamond italic, never truncated.
2. **Focused immersion over gamification.** No streaks, no reward animations, no noise. The reward is the word clicking into place.
3. **Color does work.** The Macondo palette isn't decoration — correct/wrong feedback, mode selection, and progress are communicated through deliberate color, not just labels.
4. **Personal scale.** This is one person's app. It can be opinionated, specific, and idiosyncratic. It doesn't need to scale to thousands of users.
5. **Motion should be earned.** Flashcard flips, answer reveals, and session transitions deserve considered animation. Don't animate for the sake of it.
6. **Literary voice throughout.** Home screen quote, session-end lines, empty states — all written in the register of the novel, not generic app copy.

## Design System

**Palette:** OKLCH throughout. Background `oklch(11% 0.022 47)` — near-black with a warm earth tint (hue 47), not a void. Accent `oklch(73% 0.155 85)` — ochre gold, the yellow butterfly hue from *Cien años de soledad*. Success/error are muted earth-adjacent greens and reds, not traffic-light colors.

**Candlelight gradient:** Three-layer radial composition — warm ochre bottom-center, terracotta lower-left, earth-green lower-right. Light rises from below, not descends from above. SVG feTurbulence grain overlay (`body::after`, `mix-blend-mode: screen`, `baseFrequency: 0.55`, opacity 0.07) adds tactile parchment quality.

**Typography:** EB Garamond (weights 400, 500, italic) for Spanish study words, headings, book quotations, and home screen quote. Chosen for text-face legibility at 1rem and colonial Latin American printing history. DM Sans for all UI chrome. Book sentences always in guillemets « ».

**Motion:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` for all transitions. Screen entrance: 280ms slide-up + fade. Answer feedback: error shake (380ms), correct glow pulse (500ms). Flashcard: blur-dissolve (280ms opacity + filter). All animations have `prefers-reduced-motion` alternatives.

## Features Shipped

- Spaced repetition (SM-2) with due/new/learned status
- Type mode (ES→EN and EN→ES)
- Flashcard mode (ES→EN and EN→ES)
- Multiple choice mode
- Book sentences from *Cien años de soledad* indexed by word
- Word list view: searchable, status badges, accuracy %, expandable book sentence
- Google Sheets vocabulary source (public CSV, 5-min cache)
- Settings screen (sheet ID config, cache clear)
- Index quality report (build script: not-found, near-dups, spelling hints, duplicate EN, short EN)
- Home screen rotating García Márquez quote
- Session-end literary lines (12 lines, 4 score tiers)

## Accessibility & Inclusion

Single user with no known accessibility requirements. Keyboard navigation works throughout. All animations respect `prefers-reduced-motion`.

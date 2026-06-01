# Product

## Register

product

## Users

Single user: Brian, a Spanish learner studying vocabulary drawn from *Cien años de soledad*. Uses the app in focused personal study sessions — not a classroom tool, not a shared product. Primary motivation is reading comprehension, not conversational fluency. Context sentences from the actual book are a key differentiator.

## Product Purpose

A personal spaced-repetition vocabulary trainer tied to a specific literary source. Success means words from the book become instantly recognizable while reading. The app should feel like a worthy companion to a serious book — not a gamified language app for beginners.

## Brand Personality

Immersive, focused, expressive. Three words: vivid, intentional, calm.

Emotional goal: studying vocabulary should feel like settling into a focused session under an aurora sky — not a chore, not a game, but something quietly compelling. The interface earns attention rather than demanding it.

## Anti-references

- Anki: too clinical, grey, joyless. Study tools can be beautiful.
- Duolingo: too gamified, too childlike, too loud. No streaks, no XP bars, no cartoon owls.
- Generic dark SaaS (Linear, Vercel dashboard): cold slate + indigo is workmanlike but anonymous. This app has a personality.
- Standard AI-generated dark mode: Tailwind slate palette (--bg: #0f172a, --surface: #1e293b, --accent: #6366f1) is the saturated AI default. Replace it entirely.

## Design Principles

1. **The book is the soul.** Example sentences from *Cien años de soledad* are a feature, not a footnote. Surface them with care.
2. **Focused immersion over gamification.** No streaks, no reward animations, no noise. The reward is the word clicking into place.
3. **Color does work.** The northern lights palette isn't decoration — correct/wrong feedback, mode selection, and progress should be communicated through deliberate color, not just labels.
4. **Personal scale.** This is one person's app. It can be opinionated, specific, and a little idiosyncratic. It doesn't need to scale to thousands of users.
5. **Motion should be earned.** Flashcard flips, answer reveals, and session transitions deserve considered animation. Don't animate for the sake of it.

## Design System

**Palette:** OKLCH throughout. Background `oklch(14% 0.022 220)` — near-black with a cool blue tint, not a void. Accent `oklch(78% 0.17 65)` — warm amber, aurora-adjacent. Success/error are muted greens and reds that belong to the same palette rather than generic traffic-light colors.

**Aurora gradient:** Three-layer radial composition — warm amber upper-right, cool teal upper-left, green mid-sweep. Applied as `background-image` on `body`. SVG feTurbulence grain overlay (`body::after`, `mix-blend-mode: screen`, opacity 0.055) adds texture without interfering with legibility.

**Typography:** DM Serif Display (display serif) for Spanish study words, headings, and book quotations. DM Sans for all UI chrome — buttons, labels, stats. Book context sentences rendered in DM Serif Display italic so they feel typeset from the actual novel rather than tagged as metadata.

**Motion:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` for all transitions. Screen entrance: 280ms slide-up + fade. Answer feedback: error shake (380ms), correct glow pulse (500ms). Flashcard: blur-dissolve (280ms opacity + filter). All animations have `prefers-reduced-motion` alternatives.

## Accessibility & Inclusion

Single user with no known accessibility requirements. Keyboard navigation works throughout (for study efficiency). All animations respect `prefers-reduced-motion`.

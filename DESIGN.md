---
name: Vocabulario
description: Personal Spanish vocabulary trainer for reading Cien años de soledad.
colors:
  macondo-dark:        "oklch(11% 0.022 47)"
  warm-surface:        "oklch(16% 0.026 45)"
  surface-raised:      "oklch(21% 0.028 43)"
  earth-border:        "oklch(30% 0.028 42)"
  parchment-text:      "oklch(88% 0.012 75)"
  muted-sepia:         "oklch(60% 0.018 65)"
  ochre-gold:          "oklch(73% 0.155 85)"
  ochre-gold-deep:     "oklch(67% 0.165 85)"
  tierra-verde:        "oklch(61% 0.11 148)"
  terracotta:          "oklch(58% 0.11 28)"
  amber-warn:          "oklch(73% 0.13 80)"
typography:
  display:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
  flashcard-word:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "2.4rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "normal"
  subhead:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.4
  book-sentence:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.7
    letterSpacing: "normal"
  home-quote:
    fontFamily: "'EB Garamond', Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.7
rounded:
  full: "99px"
  md: "14px"
  sm: "8px"
spacing:
  card: "28px"
  section: "32px"
  component: "16px"
  sm: "8px"
components:
  button-primary:
    backgroundColor: "{colors.ochre-gold}"
    textColor: "{colors.macondo-dark}"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-primary-hover:
    backgroundColor: "{colors.ochre-gold-deep}"
    textColor: "{colors.macondo-dark}"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-secondary:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-success:
    backgroundColor: "{colors.tierra-verde}"
    textColor: "oklch(100% 0 0)"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  button-error:
    backgroundColor: "{colors.terracotta}"
    textColor: "oklch(100% 0 0)"
    rounded: "{rounded.sm}"
    padding: "13px 26px"
  card-default:
    backgroundColor: "{colors.warm-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.card}"
  input-default:
    backgroundColor: "{colors.macondo-dark}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  mc-option-default:
    backgroundColor: "{colors.warm-surface}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  mc-option-correct:
    backgroundColor: "oklch(61% 0.11 148 / 0.14)"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  mc-option-wrong:
    backgroundColor: "oklch(58% 0.11 28 / 0.14)"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
---

# Design System: Vocabulario

## 1. Overview

**Creative North Star: "Macondo by Candlelight"**

García Márquez wrote *Cien años de soledad* in Macondo — a village under Colombian sun, lit at night by candles and kerosene lamps, saturated with the smell of earth and almond blossoms. This design system places vocabulary study inside that physical world. The background is warm Colombian earth rather than polar sky. Light rises from below like candlelight, not from above like aurora. The accent color is ochre gold — the hue of the yellow butterflies that follow Mauricio Babilonia, a color that appears nowhere else in the novel but is felt everywhere.

The palette is Macondo Midnight: a near-black with a warm earth undertone (hue 47), three layers of candlelight radial gradient rising from the lower canvas, and ochre gold as the single interactive color. EB Garamond is the display typeface — a true text face with deep colonial Latin American printing history (Garamond type was carried to the Americas by Spanish printers in the 16th century). It reads at 1rem where DM Serif Display did not, making it correct for both flashcard words and book sentence quotations. DM Sans remains as UI chrome.

Literary touches mark the interface: book sentences quoted with Spanish guillemets (« »), a rotating García Márquez quote on the home screen, session-end lines drawn from a pool of twelve in four tiers calibrated to score, and SVG grain texture over the entire canvas.

**Key Characteristics:**
- Candlelight gradient — light rising from below, not descending from above
- Warm earth neutrals (hue 42–75) throughout; no cool blue tint
- Ochre gold accent (`oklch(73% 0.155 85)`) — yellow butterfly hue from the novel
- EB Garamond for all content (Spanish words, book sentences, headings, home quote)
- DM Sans for all controls — never mixed within one element
- Guillemets « » for all book sentence quotations
- Home screen rotating García Márquez quote (1.3rem italic EB Garamond)
- Session-end literary lines, score-tiered (4 tiers, 3 lines each, random pick)
- No gamification: no streaks, XP bars, reward animations, or celebratory states

## 2. Colors: The Macondo Midnight Palette

One warm accent, one warm neutral family, muted semantic colors drawn into the same earth-tone hue space.

### Primary

- **Ochre Gold** (`oklch(73% 0.155 85)`): Every interactive element. Buttons, focus rings, progress bar fill, hover states, and the amber bloom in the card glow shadow. Hue 85 — the yellow butterfly color from *Cien años de soledad*. Its rarity is the point.

### Neutral

- **Macondo Dark** (`oklch(11% 0.022 47)`): Body background. Near-black with a warm earth tint — not a void. Carries the three-layer candlelight gradient.
- **Warm Surface** (`oklch(16% 0.026 45)`): Card and surface background. First tonal step above the background.
- **Raised Surface** (`oklch(21% 0.028 43)`): Hover states and elevated elements.
- **Earth Border** (`oklch(30% 0.028 42)`): Borders, dividers, and the disabled progress track.
- **Parchment Text** (`oklch(88% 0.012 75)`): Primary readable text. Not pure white — warm tint keeps it inside the palette.
- **Muted Sepia** (`oklch(60% 0.018 65)`): Secondary text, hints, session metadata, home quote attribution.

### Semantic

- **Tierra Verde** (`oklch(61% 0.11 148)`): Correct answer state, success feedback, learned-status badge. Muted chroma — a Colombian jungle green, not a traffic-light green.
- **Terracotta** (`oklch(58% 0.11 28)`): Wrong answer state, error feedback. Warm earth red, palette-native.
- **Amber Warn** (`oklch(73% 0.13 80)`): Warning state only.

### Gradient (Body)

Three-layer radial candlelight composition, light rising from the bottom:
```css
radial-gradient(ellipse 220% 55% at 50% 130%, oklch(24% 0.13 72  / 0.80), transparent 55%),
radial-gradient(ellipse 120% 45% at  0% 110%, oklch(19% 0.10 28  / 0.60), transparent 50%),
radial-gradient(ellipse  75% 35% at 100%  90%, oklch(18% 0.08 145 / 0.45), transparent 45%)
```

Light origin at bottom-center (130%), lower-left (110%), lower-right (90%). Warm ochre center, terracotta left shoulder, earth-green right shoulder. Evokes candlelight from below, not aurora from above.

### Named Rules

**The One Accent Rule.** Ochre gold is the only interactive color. It appears on buttons, focus rings, progress bar, and hover glows. No second accent permitted.

**The Muted Semantic Rule.** Correct/wrong states use chroma ~0.11. They belong to the warm-earth palette, not imported saturated traffic-light colors.

**The Hue Consistency Rule.** All neutral tokens stay in the 42–75 hue range. No cool blue tint — that was the previous palette (Midnight Norway, hue 215–220) and must not creep back in.

## 3. Typography

**Display Font:** EB Garamond (weights 400, 500, italic; Georgia fallback)
**Body Font:** DM Sans (weights 400, 500, 600, 700; system sans fallback)

EB Garamond is a true text face designed to be read at body sizes as well as display sizes. Its colonial Latin American printing history makes it thematically correct for a companion to García Márquez. DM Sans is geometric and workmanlike, designed to disappear in UI chrome.

### Hierarchy

- **Display** (weight 500, 2rem, EB Garamond, line-height 1.2): Screen headings — home greeting, section titles.
- **Flashcard Word** (weight 500, 2.4rem, EB Garamond, line-height 1.1): The Spanish word under study. Dominant element on the study card.
- **Subhead** (weight 500, 1.4rem, EB Garamond, line-height 1.3): h2 section headings within screens.
- **Body** (weight 400, 1rem, DM Sans, line-height 1.5): All prose UI text.
- **Label** (weight 600, 0.78rem, DM Sans): Metadata counts, session stats, MC letter badges.
- **Book Sentence** (weight 400 italic, 0.95rem, EB Garamond, line-height 1.7, `text-wrap: pretty`): Real sentences from *Cien años de soledad*. Always wrapped in guillemets « ». Muted sepia color. Never truncated.
- **Home Quote** (weight 400 italic, 1.3rem, EB Garamond, line-height 1.7): Rotating García Márquez quote on the home screen. One of three confirmed novel lines, selected randomly per visit. Color: `var(--text)` at 72% opacity — bright enough to read against the dark background. Attribution in 0.85rem EB Garamond, `var(--muted)`, no additional opacity reduction.

### Named Rules

**The Two-Register Rule.** EB Garamond for content (Spanish words, book sentences, home quote, screen headings). DM Sans for everything else (buttons, labels, stats, navigation). Never mixed within one element.

**The Book Sentence Rule.** Sentences from the novel always use `.book-sentence`: italic EB Garamond, muted-sepia, line-height 1.7, guillemets « ». Never reduce below 0.95rem.

**The Guillemet Rule.** All book sentences use Spanish-correct quotation marks: `«sentence»`. Never straight quotes, never English curly quotes.

## 4. Elevation

Depth through tonal steps first, shadow second. Three surface tones convey hierarchy; shadows are ambient and glow-forward.

### Shadow Vocabulary

- **Card Glow** (`0 0 0 1px oklch(30% 0.028 42), 0 4px 32px oklch(0% 0 0 / 0.4), 0 0 60px oklch(73% 0.155 85 / 0.04)`): All cards. Border-as-shadow + deep ambient + faint ochre bloom at 4%.
- **Focus Ring Glow** (`0 0 0 4px oklch(73% 0.155 85 / 0.08), 0 0 20px oklch(73% 0.155 85 / 0.3)`): Input focus.
- **Button Ochre Glow** (`0 0 20px oklch(73% 0.155 85 / 0.3)`): Primary button resting state.
- **Progress Bar Glow** (`0 0 8px oklch(73% 0.155 85 / 0.3), 0 0 2px oklch(73% 0.155 85)`): Progress fill glow.

### Named Rules

**The Tonal-First Rule.** Use a lighter surface tone before reaching for a shadow.

**The Bloom Rule.** Every shadow touching the primary accent includes a faint ochre bloom layer at ≤6% opacity.

## 5. Components

### Buttons

- **Primary:** Ochre gold background, macondo-dark text, 8px radius, ochre glow shadow.
- **Secondary:** Warm surface background, parchment text, 1px earth border.
- **Success / Error:** Solid tierra verde / terracotta. Flashcard self-mark only.
- **Ghost Icon (`.btn-icon`):** 36×36px circle, muted sepia icon. Hover: parchment + raised surface fill.

### Cards

14px radius, warm surface background, card-glow shadow, 28px internal padding.

### Inputs

Macondo-dark background (recessed), 2px earth border, 8px radius, 14px/18px padding, 1.1rem.
Focus: ochre border + focus ring glow. Correct: tierra verde border. Wrong: terracotta border + shake animation (380ms ease-out-quart).

### Multiple Choice Options

Warm surface, 2px earth border, 8px radius. Hover: ochre border. Letter badge: 24px circle, earth-border fill, muted sepia text. Correct: tierra verde border + success-subtle bg. Wrong: terracotta border + error-subtle bg.

### Flashcard

Blur-dissolve reveal (not 3D flip). Front fades opacity 0 + blur 8px; back fades opacity 1 + blur 0. 280ms ease. `prefers-reduced-motion`: opacity only, 150ms. Book sentence in `.book-sentence` beneath the Spanish word. Correct / Wrong buttons appear via `.reveal-up` (220ms ease-out-expo) on first flip.

### Progress Bar

6px height, pill, full-width. Track: earth border. Fill: ochre gold with glow. 600ms cubic-bezier(0.4, 0, 0.2, 1). Always animates from previous card's percentage (`_lastPct`).

### Word List

Searchable list of all vocabulary words with SRS status, accuracy, and expandable book sentences.

- **Status badges:** `new` (earth border bg, muted sepia text), `due` (ochre-gold/15% bg, ochre text), `learned` (success-subtle bg, tierra verde text)
- **Sort order:** due → new → learned, then alphabetical within each group
- **Expand:** Tapping a row reveals `.wl-row-detail` with book sentence (async-loaded, guillemeted) and due date line
- **Search:** Filters on Spanish word and English translation, case-insensitive

### Home Screen Quote

Between stats card and Study Now CTA. Randomly selects one of three confirmed García Márquez lines per page load. 1.3rem italic EB Garamond, muted sepia color, centered, max-width 400px. Attribution in 0.85rem, opacity 0.55. Wrapped in guillemets.

### Session End Lines

Twelve literary lines across four score tiers, one picked at random per session end:
- ≥90%: "Buena memoria." / "Las palabras ya son tuyas." / "Macondo te pertenece un poco más."
- ≥70%: "Progresando bien." / "El camino se hace al andar." / "Poco a poco, la aldea cobra forma."
- ≥50%: "Las palabras se aprenden con paciencia." / "Cada error es una palabra que regresa." / "La memoria necesita tiempo."
- <50%: "Vuelve mañana. Las palabras esperan." / "El olvido tiene cura: volver a leer." / "Hasta Úrsula olvidaba."

### Grain Texture

SVG `feTurbulence` overlay on `body::after`: `baseFrequency='0.55'`, `mix-blend-mode: screen`, `opacity: 0.07`. Tactile parchment quality without interfering with legibility.

## 6. Do's and Don'ts

### Do

- **Do** use ochre gold (`oklch(73% 0.155 85)`) as the single interactive color.
- **Do** render book sentences with `.book-sentence` and guillemets: `«sentence»`. They are quotations from a serious novel.
- **Do** preserve all three candlelight gradient layers on `body` — light rising from below is the brand identity.
- **Do** keep semantic colors muted (chroma ~0.11) and warm-earth-adjacent.
- **Do** apply `prefers-reduced-motion` alternatives to every animation.
- **Do** use EB Garamond weight 500 for flashcard words. Weight 400 for book sentences and quotes.
- **Do** keep all neutral tokens in hue range 42–75 (warm earth).

### Don't

- **Don't** use cool blue neutral tones. The old Midnight Norway palette (hue 220, aurora gradient from above) was replaced intentionally.
- **Don't** use straight quotes or English curly quotes for book sentences. Guillemets « » only.
- **Don't** gamify. No streaks, XP bars, reward animations, confetti, or level-up screens.
- **Don't** use gradient text (`background-clip: text` with gradient). All text is a single OKLCH solid.
- **Don't** add a light mode. Dark-only is a deliberate product decision.
- **Don't** use EB Garamond for UI chrome (buttons, navigation, settings inputs, stat labels). Reserved for content.
- **Don't** animate from 0% on progress bar. Always start from `_lastPct`.
- **Don't** add a secondary accent color. Ochre gold only.
- **Don't** use the Tailwind slate + indigo SaaS default or generic Linear/Vercel aesthetics.

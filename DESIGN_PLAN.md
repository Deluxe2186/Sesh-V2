# Sesh Skate Spot App - Design Plan

## Project Overview
**Product:** Sesh - Live skate spot finder for Lagos skaters
**Audience:** Lagos skaters (Gen Z, millennials), urban youth culture
**Primary Job:** Help skaters find active sessions at verified spots across Lagos in real-time
**Context:** Mobile-first, urban youth culture, data-conscious, community-driven

---

## 1. COLOR PALETTE (6 named hex values)

### Core Brand Palette
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `accent` | `#FF5A1F` | `#FF5A1F` | Primary actions, CTAs, live indicators, accent elements |
| `accent-soft` | `#FFF3F0` | `#3D1A0F` | Hover states, subtle backgrounds, focus rings |
| `surface` | `#FFFFFF` | `#17171A` | Card backgrounds, elevated surfaces |
| `surface-elevated` | `#F6F4EF` | `#1E1E22` | Elevated cards, modals, dropdowns |
| `foreground` | `#111111` | `#F4F4F5` | Primary text, headings |
| `muted` | `#555555` | `#A3A3AE` | Secondary text, placeholders, disabled states |
| `border` | `#D4D0C8` | `#3A3A3F` | Borders, dividers, input borders |
| `live` | `#16A34A` | `#22C55E` | Live indicators, online status |
| `warning` | `#F59E0B` | `#FBBF24` | Warnings, pending states |
| `destructive` | `#DC2626` | `#EF4444` | Errors, destructive actions |

### Gradient Tokens
- `gradient-accent`: `linear-gradient(135deg, #FF5A1F 0%, #FF8C42 100%)`
- `gradient-surface`: `linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)`
- `gradient-accent-soft`: `linear-gradient(135deg, var(--accent-soft) 0%, transparent 100%)`

---

## 2. TYPOGRAPHY

### Font Families
| Role | Font | Variable | Weights |
|------|------|----------|---------|
| Display/Headlines | Space Grotesk | `--font-space-grotesk` | 500, 600, 700 |
| Body/UI | Inter | `--font-inter` | 400, 500, 600 |

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-display-xl` | 4.5rem / 72px | 1.05 | 700 | Hero headlines (desktop) |
| `text-display-lg` | 3.5rem / 56px | 1.1 | 700 | Hero headlines (mobile) |
| `text-display-md` | 2.25rem / 36px | 1.15 | 700 | Section headlines |
| `text-display-sm` | 1.5rem / 24px | 1.2 | 600 | Card headlines, subsections |
| `text-xl` | 1.25rem / 20px | 1.5 | 500 | Large body, lead paragraphs |
| `text-lg` | 1.125rem / 18px | 1.5 | 400 | Body text |
| `text-base` | 1rem / 16px | 1.5 | 400 | Default body text |
| `text-sm` | 0.875rem / 14px | 1.5 | 400 | Secondary text, captions |
| `text-xs` | 0.75rem / 12px | 1.4 | 500 | Labels, badges, meta text |

### Font Features
- `font-display`: Space Grotesk, variable weights 500-700
- `font-body`: Inter, variable weights 400-600
- Tabular numerals for live counts: `font-variant-numeric: tabular-nums`

---

## 3. SPACING SYSTEM

### Base Unit: 4px (0.25rem)
| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | Reset |
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Default gap, inline gaps |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Standard padding, component gaps |
| `space-5` | 20px | Section inner padding |
| `space-6` | 24px | Section gaps, card padding |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Page section spacing |
| `space-12` | 48px | Large page sections |
| `space-16` | 64px | Hero sections, major breaks |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Sharp corners |
| `radius-sm` | 4px | Badges, pills, small elements |
| `radius-md` | 8px | Buttons, inputs, badges |
| `radius-lg` | 12px | Cards, modals, dropdowns |
| `radius-xl` | 16px | Large cards, modals |
| `radius-2xl` | 24px | Hero sections, major containers |
| `radius-full` | 9999px | Pills, avatars, pills |

---

## 4. SHADOW SYSTEM

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.2)` | Subtle elevation |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.3)` | Cards, buttons |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` | `0 4px 12px rgba(0,0,0,0.4)` | Cards, dropdowns |
| `shadow-lg` | `0 12px 24px rgba(0,0,0,0.12)` | `0 12px 24px rgba(0,0,0,0.5)` | Modals, elevated cards |
| `shadow-xl` | `0 20px 40px rgba(0,0,0,0.15)` | `0 20px 40px rgba(0,0,0,0.6)` | Sheets, drawers |

---

## 5. MICRO ANIMATIONS

### Animation Principles
- **Duration**: 150-300ms for micro-interactions, 300-500ms for transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material easing) for most; `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) for playful elements
- **Reduced Motion**: Respect `prefers-reduced-motion` - disable non-essential animations
- **Stagger**: 50-80ms stagger for list/item entrances

### Animation Tokens
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `duration-instant` | 0ms | - | Immediate |
| `duration-fast` | 150ms | `ease-out` | Hover, focus, tap |
| `duration-normal` | 200ms | `ease-out` | Standard transitions |
| `duration-normal-spring` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful pop |
| `duration-normal-ease` | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `duration-slow` | 350ms | `ease-in-out` | Page transitions |
| `duration-slow-spring` | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Modal open, sheet open |

### Keyframe Animations
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Animation Classes
```css
.animate-fade-in { animation: fade-in 200ms ease-out; }
.animate-slide-up { animation: slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-slide-down { animation: slide-down 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-scale-in { animation: scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-slide-in-right { animation: slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-slide-in-left { animation: slide-in-left 300ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
.animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
.animate-shimmer { animation: shimmer 2s linear infinite; }
.animate-spin { animation: spin 1s linear infinite; }
```

### Stagger Delays
```css
.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 200ms; }
.stagger-5 { animation-delay: 250ms; }
```

---

## 6. LAYOUT CONCEPTS

### Grid System
- **Mobile**: Single column, 16px padding
- **Tablet (≥768px)**: 2-column grid, 24px padding
- **Desktop (≥1024px)**: 12-column grid, 32px padding
- **Wide (≥1440px)**: 12-column grid, max-width 1280px, centered

### Alignment Guidance
- **Default**: Left-aligned for content, centered for hero/heroic moments
- **Forms**: Left-aligned labels, left-aligned inputs
- **Cards**: Left-aligned content, right-aligned actions
- **Navigation**: Left-aligned (logo), right-aligned (actions)
- **Data tables**: Left-align text, right-align numbers

### Breakpoints
| Breakpoint | Min Width | Columns | Container Padding |
|------------|-----------|---------|-------------------|
| `mobile` | 0px | 1 | 16px |
| `tablet` | 768px | 2 | 24px |
| `desktop` | 1024px | 12 | 32px |
| `wide` | 1440px | 12 | 32px (max-w-7xl) |

---

## 7. COMPONENT PATTERNS

### Buttons
| Variant | Style | Hover | Active | Disabled |
|---------|-------|-------|--------|----------|
| Primary | `bg-accent text-accent-foreground` | `brightness-105` | `scale-[0.98]` | `opacity-50 cursor-not-allowed` |
| Secondary | `bg-surface border border-border` | `bg-surface-elevated` | `scale-[0.98]` | `opacity-50` |
| Ghost | `transparent` | `bg-surface-elevated` | `scale-[0.98]` | `opacity-50` |
| Destructive | `bg-destructive text-destructive-foreground` | `brightness-105` | `scale-[0.98]` | `opacity-50` |
| Outline | `border-2 border-accent text-accent` | `bg-accent/10` | `scale-[0.98]` | `opacity-50` |

**Button Animations:**
- Hover: `transition-colors duration-fast`
- Tap: `active:scale-[0.98] transition-transform duration-fast`
- Focus: `focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`

### Cards
```css
.card {
  @apply rounded-xl border bg-surface p-6 shadow-sm 
         transition-all duration-normal-ease
         hover:shadow-md hover:border-accent/20
         hover:-translate-y-0.5;
}
```

### Inputs
```css
.input {
  @apply w-full rounded-lg border border-border bg-surface 
         px-4 py-3 text-foreground placeholder:text-muted
       transition-colors duration-fast
       focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
       disabled:opacity-50 disabled:cursor-not-allowed;
}
```

### Badges
```css
.badge {
  @apply inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 
         text-xs font-medium transition-colors duration-fast;
}
.badge-primary { @apply bg-accent/10 text-accent; }
.badge-success { @apply bg-live/10 text-live; }
.badge-warning { @apply bg-warning/10 text-warning; }
.badge-destructive { @apply bg-destructive/10 text-destructive; }
```

---

## 8. MICRO-INTERACTION SPECIFICATIONS

### Page Load Sequence
1. **0ms**: HTML/CSS paint (critical CSS inlined)
2. **50ms**: Hero content fade-in (`animate-fade-in`)
3. **100ms**: Hero content slide-up (`animate-slide-up`)
3. **150ms**: Primary CTA scale-in (`animate-scale-in` staggered)
4. **200ms**: Trust signals fade-in staggered (`stagger-1`, `stagger-2`, `stagger-3`)
5. **300ms**: Map preview fade-in (`animate-fade-in`)
6. **400ms**: Section headers slide-up staggered
6. **500ms**: Cards slide-up staggered (`stagger-1`, `stagger-2`, `stagger-3`)

### Hover Interactions
| Element | Animation | Duration |
|---------|-----------|----------|
| Buttons | Scale 1.02 → 0.98 (tap) | 150ms |
| Cards | TranslateY(-4px), shadow-md | 200ms |
| Buttons (primary) | Brightness 105% | 150ms |
| Links | Color transition | 150ms |
| Icons (buttons) | Scale 1.1 | 150ms |
| Nav items | Color + underline slide | 200ms |

### Form Interactions
| Interaction | Animation |
|-------------|-----------|
| Focus input | Border color + ring fade-in (150ms) |
| Error shake | Horizontal shake 3x (300ms) |
| Success check | Scale-in + fade (300ms spring) |
| Character count | Fade + slide (150ms) |

### Navigation
| Interaction | Animation |
|-------------|-----------|
| Tab switch | Cross-fade 200ms |
| Sheet open | Slide-up 300ms spring |
| Sheet close | Fade 150ms + slide-down 200ms |
| Dropdown open | Scale-in 150ms spring |
| Modal open | Fade 150ms + scale-in 200ms spring |

---

## 9. ACCESSIBILITY & REDUCED MOTION

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .animate-pulse-soft,
  .animate-pulse-ring,
  .animate-shimmer,
  .animate-spin {
    animation: none !important;
  }
}
```

### Focus Management
- Visible focus ring: `outline-2 outline-accent outline-offset-2`
- Skip link: Skip to main content (first focusable)
- Trap focus in modals/sheets
- Return focus to trigger on close

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Design Tokens (globals.css)
- [ ] Add all color tokens (light/dark)
- [ ] Add spacing tokens
- [ ] Add typography tokens
- [ ] Add shadow tokens
- [ ] Add border radius tokens
- [ ] Add animation keyframes
- [ ] Add animation utility classes
- [ ] Add reduced motion media query

### Phase 2: Base Components
- [ ] Update Button component
- [ ] Update Card component
- [ ] Update Input/Textarea components
- [ ] Update Badge component
- [ ] Update Card/Modal/Sheet components

### Phase 3: Layout & Pages
- [ ] Update globals.css with design tokens
- [ ] Update Marketing page (landing)
- [ ] Update Explore page
- [ ] Update Add Spot wizard
- [ ] Update Spot Detail page
- [ ] Update Profile/Settings pages

### Phase 4: Micro-interactions
- [ ] Button hover/tap/active states
- [ ] Card hover/lift animations
- [ ] Form focus/error/success states
- [ ] Navigation transitions
- [ ] Page load sequence
- [ ] Staggered entrance animations

### Phase 5: Polish
- [ ] Reduced motion support
- [ ] Focus management
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Performance audit

---

## DESIGN PRINCIPLES SUMMARY

1. **Boldness in one place**: The accent color (#FF5A1F) is the star - use it sparingly for maximum impact
2. **Quiet confidence**: Everything else is muted, spacious, disciplined
3. **Motion with purpose**: Every animation answers "what changed?" or "what happens next?"
4. **Respect the user**: Reduced motion, keyboard nav, screen readers first
4. **Skate culture voice**: Conversational, direct, no marketing fluff
5. **Performance first**: Animations on transform/opacity only, will-change hints

---

*This design plan is a living document. Update as implementation reveals constraints or opportunities.*
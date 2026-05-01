# Codebrief Design System

## Aesthetic
Dark, terminal-inspired dev tool. Think Warp + Linear hybrid. Sharp, dense, no rounded-everything.

## Typography
- **Display/Headings**: `Geist Sans` (variable, clean, geometric)
- **Body**: `Geist Sans` at lighter weight
- **Code/Mono**: `JetBrains Mono` for diffs, code blocks, PR data
- Import from Google Fonts / Fontsource

## Colors (dark mode only)
- **Background**: `#0A0A0B` (near-black)
- **Surface**: `#111113` (cards, panels)
- **Surface elevated**: `#1A1A1D` (hover states, modals)
- **Border**: `#262629` (subtle dividers)
- **Border bright**: `#3A3A3F` (focused elements)
- **Text primary**: `#EDEDEF` (near-white)
- **Text secondary**: `#8B8B8E` (muted)
- **Text tertiary**: `#5C5C5F` (disabled)
- **Accent/Primary**: `#00E5A0` (green — success, CTA)
- **Accent hover**: `#00CC8E`
- **Accent muted**: `rgba(0, 229, 160, 0.12)` (backgrounds)
- **Warning**: `#FFB224` (bug flags)
- **Error/Destructive**: `#FF4D4D`
- **Info**: `#3B82F6` (suggestions)

## Layout
- Max content width: 960px for main content
- Generous vertical spacing between sections
- Monospace-heavy for data display
- Sharp corners (2px radius max) on cards/buttons
- 1px solid borders, no shadows (except subtle glow on accent)

## Motion
- Staggered fade-in on page load (CSS only)
- No bouncy animations — quick, precise transitions (150ms ease)

## Components
- Buttons: filled accent, ghost, outline variants. Small, dense.
- Cards: `#111113` bg, `#262629` border, no border-radius or 2px max
- Inputs: dark bg, 1px border, monospace for URL inputs
- Status badges: pill-shaped, colored bg with matching text
- Code blocks: syntax-highlighted with terminal feel

## Anti-patterns to avoid
- Purple gradients
- Rounded corners > 4px
- Inter/Roboto/Arial
- Card grids with drop shadows
- Light mode anything

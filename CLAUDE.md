# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MH Studio is a single-page marketing website for a web design and AI agency based in San José, Costa Rica. The entire site lives in one file: `index.html` (~1900 lines) with all CSS, HTML, and JavaScript inline. There is no build system, no package manager, and no external JS dependencies.

To preview the site, open `index.html` directly in a browser.

## Architecture

The file is organized in this order:
1. `<style>` block — all CSS (~1060 lines)
2. HTML body — navbar, mobile menu, then page sections by anchor ID: `#hero`, `#trust`, `#servicios`, `#portafolio`, `#proceso`, `#por-que`, `#testimonios`, `#precios`, `#cta`, `#contacto`, footer
3. `<script>` block — all vanilla JS (~100 lines) at the bottom

## Design system

All visual tokens are CSS custom properties on `:root` (lines 15–36):
- Background scale: `--obsidian` → `--carbon` → `--graphite` (dark to slightly lighter)
- Borders: `--border` (subtle) / `--border-lit` (hover state)
- Primary accent: `--blue: #4B7BFF` with dim (`--blue-dim`) and glow (`--blue-glow`) variants
- Secondary accent: `--green: #1FD1A0`
- Text: `--ice` (primary) / `--silver` (muted) / `--silver-dim` (very muted)
- Fonts: `--font-body` (DM Sans) / `--font-mono` (DM Mono)
- Easing: `--ease` / `--ease-out` (custom cubic-bezier)

Utility classes cover typography (`.display-xl`, `.body-lg`, etc.), layout (`.container`, `.grid-2/3/4`, flex helpers), spacing (`.mt-*`, `.mb-*`, `.gap-*`), and buttons (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-lg`).

## Animation pattern

Scroll-triggered animations use a single `IntersectionObserver`. Add `animate-on-scroll` to any element and it will fade+slide up when entering the viewport. Add `delay-1` through `delay-5` for staggered timing. The observer removes itself after triggering (one-shot, not repeated).

Hero elements use CSS `@keyframes fade-up` with explicit `animation-delay` values (no JS needed).

## Contact form

The form (`#contacto`) is UI-only. `handleFormSubmit()` simulates a loading state and then a success state with no actual network request. To wire it to a backend, replace the `setTimeout` logic in that function.

## Business context

- Language: Spanish (Costa Rican)
- WhatsApp contact: +506 8367-4466 (`wa.me/50683674466`)
- Email: contacto@mhstudio.cr
- The "Testimonios" section is explicitly labeled as hypothetical impact examples, not real testimonials — keep this honest framing when editing that section.
- Portfolio has one real delivered project (Matías Parfum) and six conceptual examples — maintain the visual distinction between them (green "Entregado" badge vs. "Conceptual" tag).

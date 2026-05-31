# Product

## Register

brand

## Users

Two audiences, one primary:

- **Guests (primary)** open a personal link (`/?to=<token>`), often on a phone, sometimes shared via WhatsApp. They arrive curious and emotionally warm: they want to know who is marrying, when and where, see the couple, confirm whether they can attend, leave a wish, and save their QR entry ticket. Context is casual and mobile-first, frequently with one hand, sometimes on slow connections.
- **The couple / host (secondary)** use the protected `/admin` builder to customize every word, color, photo, and event without a designer or wedding organizer, then manage guests, moderate the guestbook, and run venue check-in (`/admin/checkin`) plus the live `/welcome-screen`.

The job to be done: turn a static "save the date" into a living, personal invitation that makes each guest feel individually welcomed, and gives the couple full self-serve control.

## Product Purpose

A customizable digital wedding invitation and guest-management platform. The public invitation is the deliverable: a single, beautifully paced scroll that renders entirely from the couple's saved settings. Success is a guest who feels personally invited, RSVPs through the guestbook, and arrives with their QR ticket; and a couple who built and ran the whole thing themselves.

## Brand Personality

Elegant, warm, romantic. The voice is intimate and gracious, never transactional. Typography-led and unhurried, with gold-on-cream warmth and soft entrance motion. It should feel like a keepsake the couple made, not a form to fill in. Bilingual touches (Indonesian guest-facing copy) are part of the warmth.

## Anti-references

- **Generic template builder** (Canva / Wix cookie-cutter wedding templates): avoid the interchangeable, mass-produced look. This should feel made-for-them.
- **Corporate SaaS**: no cold dashboard/landing aesthetics, hero-metric blocks, stock gradients, or rounded-icon-above-heading card grids on the guest-facing page.
- **Loud / cluttered**: no busy, over-decorated, animation-heavy noise. Restraint and pacing over density.
- **Dark / neon**: no dark mode, neon, or high-contrast tech styling. The world is warm and light.

## Design Principles

- **Personal first.** Every guest sees their own name, ticket, and a tailored greeting. Personalization is the point, not a feature.
- **One unhurried scroll.** Pace the story (cover → couple → story → details → gallery → gift → guestbook). One dominant idea per fold; let sections breathe.
- **The couple's content carries the design.** The system is a frame; their photos, words, and palette fill it. Theming is fully data-driven (hex codes in the DB → CSS variables), so the same structure can feel like many different weddings.
- **Self-serve without a designer.** Anything a guest sees, the couple can change in `/admin` with a live preview. No code, no WO required.
- **Keepsake, not form.** Even functional moments (RSVP, gift, check-in) should feel gracious and celebratory.

## Accessibility & Inclusion

Standard care, treated as table stakes: WCAG AA contrast (verify custom themes stay legible), full keyboard navigation in modals and forms, visible focus states, honor `prefers-reduced-motion` (GSAP reveals already fall back), generous mobile tap targets, and meaningful alt text on couple/guest imagery.

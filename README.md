# OneStep

A calm task app that shows you one small step at a time.

**User:** Maya, a college student with ADHD and 27 tasks across 5 apps.
**Barrier:** Task paralysis. A wall of tasks makes her close the app without starting.
**Change:** From a full list to one doable step, started in under a minute.

## What it does
- **Brain dump:** type everything in any order; it becomes small 5–15 minute steps.
- **Energy check:** low energy starts with easy wins, high energy with hard work.
- **One-step view:** one step, a gentle timer (no alarms), Done / Not now.
- **I'm stuck:** splits the step into three tiny ones.
- **Handoff note:** "where I left off / what's next", ready to copy for yourself or a teammate.
- **Accessibility:** keyboard use, screen-reader labels, easy-to-read typeface, higher contrast, read aloud, animations off, light/dark mode.
- **No shame:** no overdue labels, no streaks.

## Run it
```
npm install
npm run dev
```
Build: `npm run build`. Deploy to Netlify (config included).

**Optional AI:** set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in Netlify. Without it the app uses built-in rules, so it always works.

## Limitations
Not clinically validated. Rule-based splitting is simple; AI quality varies. Data stays in your browser, with no sync across devices. Not yet tested with a screen reader across browsers.

## Disclosure (for Devpost)
- **Pre-existing work:** built on the Vite + React scaffold of *Unlinear* by Beyzanur Kuyuk (MIT, `LICENSE` kept). All screens, design, logic and the AI function were rewritten for OneStep. Inspired by Unlinear's idea of one step at a time.
- **Libraries:** React, Vite. Font: Atkinson Hyperlegible (optional).
- **AI assistance:** Claude (Anthropic) helped write the code and this README. Add your own edits and testing notes here.

## Test results (fill in)
Time to first action and feedback from 3–5 testers, with their permission.

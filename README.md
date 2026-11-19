[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v2/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/intan151/gta6-trophy-guide-leonida-v2/reward.svg)](https://make.fun/c/gta6-trophy-guide-01/)

# Leonida Ledger v2 — GTA VI Trophy Guide & Tracker

An offline, static web app that walks you to the Grand Theft Auto VI platinum trophy and keeps score as you go. Built for the make.fun competition [Build the best GTA 6 trophy guide](https://make.fun/c/gta6-trophy-guide-01/) — a free bounty with a $250 prize pool and 50 places.

## What it covers

All **55 official PS5 trophies** for GTA VI:

- 1 Platinum
- 2 Gold
- 6 Silver
- 46 Bronze

Every trophy carries its own short, original guide — what to do, where, and when it can be missed — plus a one-line quick tip and cited sources (Exophase, PSNProfiles, PowerPyx). Where no source has pinned a trigger down yet, the guide says so plainly instead of guessing.

## The one missable trophy

There is exactly **one missable trophy**: **Positive Mental Attitude**, earned by meditating in Chapter 1. Miss that moment and the platinum is locked out for that playthrough, so the guide flags it on the checklist, in the roadmap, and on a dedicated Missables page — don't walk past it.

## What's new in v2

- **Sort control** — order the checklist by grade, name, roadmap phase, or PSN-tracked count, so the next thing to chase is always on top.
- **Next up strip** — the next unearned trophy in roadmap order, one click away from its guide.
- **Reset filters** — one button clears search, grade, kind, earned-state and the missable toggle.
- **Roadmap progress bars** — each of the 5 phases shows how far through it you are.
- **Guide navigation** — step to the previous / next trophy from the detail pane without scrolling the list.
- **Smarter spoiler masking** — hidden story trophies still show their roadmap phase, so you can plan around them without seeing the spoiler.
- **Deeper search** — search now matches names, descriptions, guides and tips, not just names.
- **Fresh look** — a Leonida-dusk palette (deep teal, warm sand, sunset orange for missables).

## Features

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in your browser with localStorage, so it survives closing the tab.
- **Export and import** — back up your progress as a JSON file, or restore it later on any device.
- **Filters** — narrow the list by trophy grade (Platinum / Gold / Silver / Bronze), by kind (story, missable, collectibles, activities, online), by earned/unearned status, or by free-text search.
- **Spoiler setting** — hide story details until you are ready to see them.
- **5-phase roadmap** — a step-by-step plan that takes you from the first story missions all the way to the platinum, in a sensible order that keeps the missable trophy safe.
- **Fully offline** — no server, no account, no network needed once the files are on your machine. Open it and play.

## How to use it

1. Download or clone this repository.
2. Open `app/index.html` in any modern web browser (or run `node serve.ts` and visit http://localhost:8080).
3. That's it — the guide and tracker run entirely in your browser.

Your checklist progress is stored locally in your browser, and nothing is sent anywhere.

## Project layout

- `app/index.html` — the app itself (open this file)
- `app/data/trophies.json` — the full list of 55 trophies with their guides, quick tips and sources
- `app/data/roadmap.json` — the 5-phase roadmap to platinum
- `app/js/` — tracker logic: `main.js`, `store.js`, `filters.js`, `views.js`
- `app/css/style.css` — styling
- `screenshots/` — screenshots of the checklist, roadmap, missable warning, and filters

## License

See `LICENSE` (MIT).

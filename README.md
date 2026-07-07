# Sell Car Essex — starter

A Vite + React + Tailwind starter for the sellcaressex.co network:
one hub page where visitors pick their area, then a shared form component
rendered under each town's own URL (e.g. `/colchester`, `/witham`).

## What's in here

```
src/
  data/
    towns.js       <- add a new area page by adding one line here
    vehicles.js     <- make/model list used by the form
  components/
    SellForm.jsx    <- the whole multi-step form (used on every town page)
  pages/
    Hub.jsx         <- the "choose your area" landing page (the root URL)
    TownPage.jsx    <- renders for any /:slug that matches a town
  App.jsx           <- routing
  index.css         <- Tailwind + custom animations
```

## Adding a new area

Open `src/data/towns.js` and add a line:

```js
{ slug: "sudbury", name: "Sudbury" },
```

That's it — `/sudbury` now works automatically, no new files needed.

## Getting it running locally (VS Code)

1. Open this folder in VS Code.
2. Open a terminal (`` Ctrl+` `` / `` Cmd+` ``) and run:
   ```
   npm install
   npm run dev
   ```
3. Open the URL it prints (usually `http://localhost:5173`).
4. Try `http://localhost:5173/colchester` and `http://localhost:5173/witham`.

## Where leads currently go

Right now, submitting the form just logs the lead to the browser console
(see `handleLeadSubmit` in `TownPage.jsx`). Before this goes live you'll
want to send that data somewhere real. Easiest options, roughly in order
of effort:

1. **Formspree / Getform** — paste in a form endpoint URL, no backend needed.
2. **A Vercel serverless function** — create `api/lead.js` in this project,
   have it email you or write to a spreadsheet/Airtable, and call it with
   `fetch('/api/lead', { method: 'POST', body: JSON.stringify(lead) })`.
3. **A proper CRM** — once volume justifies it.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to vercel.com → "Add New Project" → import that repo.
3. Vercel auto-detects Vite — no config needed beyond what's already in
   `vercel.json` (handles the town-page routing on refresh).
4. Once deployed, point your `sellcaressex.co` domain at the Vercel
   project under Project Settings → Domains.

## Notes on the design

The colour palette, fonts, and layout are all defined in
`tailwind.config.js` and reused via Tailwind classes — if you want to
adjust the look, that's the file to start with.

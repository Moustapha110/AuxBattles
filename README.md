# AuxBattles

A real time multiplayer music battle game. Players compete by playing tracks in a chosen category, the room votes live, and players advance through elimination rounds.

## Features

- Multiplayer music battles by category
- Live voting between players
- Elimination rounds that advance winners
- Supabase backed data layer (schema in `supabase/migrations`)

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Supabase

## Run locally

```bash
git clone https://github.com/Moustapha110/AuxBattles.git
cd AuxBattles
npm install
cp .env.example .env   # add your own Supabase URL and anon key
npm run dev
```

## Environment variables

| Variable | Description |
| --- | --- |
| VITE_SUPABASE_URL | Your Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Your Supabase anon key |

## Author

Built by [Moustapha Ba](https://github.com/Moustapha110).

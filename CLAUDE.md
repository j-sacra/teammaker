# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TeamMaker is a football/soccer team randomizer web app with a Portuguese UI. Players are rated on 7 weighted attributes and balanced across teams using a snake-draft algorithm.

## Architecture

- **Frontend**: Single-page app in `index.html` — vanilla HTML/CSS/JS, no framework or bundler
- **Backend**: Cloudflare Pages Function at `functions/api/room/[room].js` — RESTful GET/PUT with optimistic concurrency (revision tracking)
- **Storage**: 3-tier persistence — URL hash (base64-encoded state for sharing) → localStorage (`tm2_state:<room>`) → Cloudflare Workers KV (remote sync)

## Development

No build step. Open `index.html` in a browser or serve with any static server. The backend requires Cloudflare Pages; without it the app runs in offline/localStorage-only mode.

Deploy target: Cloudflare Pages with `/functions` as the functions directory and `/` as build output (no build command).

## Key Concepts

- **Room**: Identified from URL path `/grupo/<room>/` (default: `ligadoscoxos`). All state is scoped per room.
- **State object `S`**: `{ players, exclusions, numTeams, teamNames, teamColors, history }` — serialized to all 3 storage tiers.
- **Team balancing** (`makeTeams()`): Runs up to 500 iterations of snake draft by weighted overall rating, respecting exclusion pairs, minimizing score variance across teams.
- **Player attributes**: cardio (10%), speed (15%), passing (15%), control (15%), finishing (20%), defending (20%), intensity (5%).
- **Remote sync**: PUT with `rev` field for optimistic concurrency; 409 on conflict triggers pull-and-retry.

---
name: deploy
description: Deploy teammaker to Cloudflare Pages. Use when the user wants to publish or push to production.
allowed-tools: Bash
---

# Deploy to Cloudflare Pages

1. Check for uncommitted changes with `git status`. If there are changes, warn the user and ask if they want to commit first.
2. Run `wrangler pages deploy . --project-name=teammaker`
3. Report the live URL back to the user.
4. If `wrangler` is not installed, tell the user to run `npm install -g wrangler` and authenticate with `wrangler login`.

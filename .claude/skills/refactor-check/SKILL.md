---
name: refactor-check
description: Analyze index.html for size and complexity. Suggest splitting CSS/JS only when the file is getting unwieldy.
allowed-tools: Read, Grep
---

# Refactor Check

This project is a single-file app (`index.html`). That's fine when small, but can get painful as it grows.

1. Read `index.html` and measure:
   - Total line count
   - Approximate lines of CSS (inside `<style>`)
   - Approximate lines of JS (inside `<script>`)
   - Number of functions defined

2. Flag issues only if they're real:
   - File exceeds ~800 lines total
   - Any single function exceeds ~60 lines
   - Duplicated patterns (copy-pasted HTML generation, repeated style blocks)

3. If the file is still manageable, say so. Don't recommend splitting just for the sake of it.

4. If splitting is warranted, suggest concrete moves:
   - Which CSS blocks → `style.css`
   - Which JS sections → `app.js` or named modules
   - Keep the HTML template inline (no build step)

Be honest. "It's fine for now" is a valid answer.

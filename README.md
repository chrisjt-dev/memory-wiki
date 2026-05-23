Memory Wiki (Next.js + MDX)

Overview
- Next.js + MDX-based memory wiki for Chris Johnson.
- Public site with a simple password gate.
- Hosted on Vercel. Agents will add MDX files under content/ (subjects/ or daily/).
- In-browser admin editor (simple GitHub-backed flow planned; current admin route edits files via API for demo).

Quick start (local)
1. cd agents-shared/projects/memory-wiki
2. npm install
3. export WIKI_PASSWORD="your-password"
4. npm run dev

Vercel deploy
- Create a new Vercel project from this repo (or link the folder).
- Set Environment Variable WIKI_PASSWORD to the desired password in Project > Settings > Environment Variables.
- Deploy.

How it works (scaffold)
- content/subjects/*.mdx — subject pages. Frontmatter: title, tags, summary
- content/daily/YYYY-MM-DD.mdx — daily logs. Frontmatter: title, date, summary
- pages/index.js — lists subjects and recent daily logs, with password gate.
- pages/subjects/[slug].js — subject page rendering MDX.
- pages/daily/[date].js — daily log rendering MDX.
- pages/admin.js — simple in-browser editor for creating/editing MDX content; requires login.
- pages/api/login.js — POST endpoint to set a session cookie if password matches WIKI_PASSWORD.

Notes & next steps
- This is a scaffold. It uses filesystem reading (fs) and expects the site to be deployed on Vercel with the repository available.
- For production: swap the simple password gate for proper auth (Vercel Password, SSO, or GitHub OAuth).
- We can replace client-side search (lunr) with Meilisearch for large content.

If you want, I’ll push this scaffold into the agents-shared folder (already created) and wire up a Vercel project for you. Or I can instead generate a full implementation plan with exact files and tests. Which next?
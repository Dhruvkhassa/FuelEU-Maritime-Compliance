# Deploying FuelEU-Maritime-Compliance

This document explains two simple deployment approaches: (A) quick public demo using Vercel (frontend) + Railway (backend) and (B) full self-hosted stack via Docker Compose on a VPS.

Important: the project backend stores and computes compliance balances in grams CO₂e (g) — the frontend converts to tonnes (t) for display. Keep this in mind when wiring monitoring/alerts.

Option 1 — Vercel (frontend) + Railway (backend) (recommended for demo / shareable URL)

1. Frontend (Vercel)
   - Create a GitHub repo (if not already) and push this project.
   - Sign in to Vercel and select "Import Project" → choose the frontend folder.
   - Build command: `npm run build` ; Publish directory: `dist`
   - Add an environment variable `VITE_API_BASE_URL` (if used) pointing to the backend public URL (e.g., https://your-backend.up.railway.app).

2. Backend (Railway)
   - Sign in to Railway and create a new project.
   - Choose "Deploy from GitHub" or "Dockerfile" and point to the `backend` folder.
   - Set environment variables in Railway:
     - `DATABASE_URL` = postgres connection string (Railway will provision Postgres or you can add a PostgreSQL plugin)
     - `PORT` = 3001
   - If Railway provisions Postgres, run migrations (`npx prisma migrate deploy`) and then seed (run seed script) from the Railway shell or CI step.

3. After both are deployed, set the frontend API base url to the backend's public URL.

Option 2 — Docker Compose on a VPS

1. Copy the repo to the VPS.
2. Ensure Docker & docker-compose are installed.
3. Create environment variables or edit `docker-compose.prod.yml` with secure passwords.
4. Run:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
5. Run migrations and seed inside the backend container (or as part of a startup script):
   ```bash
   docker exec -it <backend_container> npm run db:migrate
   docker exec -it <backend_container> npm run db:seed
   ```

Notes about CI / secrets
- The included GitHub Actions workflow `build-and-test.yml` runs backend tests and builds the frontend. To add automatic deploy steps, add deployment steps and secrets for your cloud provider.

Removing a contributor from GitHub (see below)
--------------------------------------------
GitHub lists contributors based on commit history. To remove `nikhil-rao-1907` from the Contributors list you can either:

1. Remove collaborator access (if they were added as a repository collaborator or org member):
   - Go to the repository Settings → Manage access and remove the user or revoke their access.
   - This will remove their collaborator role but they will still appear in the Contributors list if they have commits.

2. Remove or re-author commits authored by that user (changes Git history) — destructive and requires force-push:
   - To replace author email/name for all commits by that user (recommended safer than full deletion), run locally (in a cloned repo):

     ```bash
     # Install git-filter-repo (recommended)
     pip install git-filter-repo

     # Rewrite author identity (example: change author email 'their@example.com' to your name/email)
     git filter-repo --replace-email "their@example.com=Your Name <you@example.com>"

     # Force-push rewritten history to origin (careful: affects all forks and PRs)
     git push --force --all
     git push --force --tags
     ```

   - Alternatively, for a small number of commits you can use `git rebase -i` and `git commit --amend --author="Your Name <you@example.com>"` then force-push.

3. Revert commits instead (non-destructive):
   - You can revert specific commits authored by that user. Reverts will remain in history and the contributor will still show up as a contributor, but their changes will be undone.

Important warnings:
- Rewriting history (filter-repo / filter-branch) is destructive for teams. If the repo is public or has forks/PRs, coordinate with contributors and be prepared for everyone to reclone.
- If the user is listed only as a GitHub collaborator and not via commits, removing access in Settings is sufficient.

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Quickstart

```bash
npm install
cp .env.example .env
# set DATABASE_URL in .env
npm run db:push   # apply schema
npm run seed      # add admin, staff, and test plan
npm run dev:full  # Vite + API in watch mode
```

## Deploying to Railway (recommended for testing)

1. Create a new Railway project, connect to this GitHub repo, and add a Postgres service.
2. Add environment variables in the Railway service: `DATABASE_URL` (from the Postgres plugin), `PORT=3001`, and optionally `VITE_API_BASE=https://<service-subdomain>.railway.app/api`.
3. Build command: `npm run build`. Start command: `npm run start` (serves the built frontend and API from Express).
4. After the first deploy, run `npm run db:push` followed by `npm run seed` from the Railway shell to create tables and seed admin/staff accounts.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

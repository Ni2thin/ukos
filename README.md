This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## UKOS Companion

The companion answers recorded spending, planned budgets, currency conversions, loan estimates, savings timelines, and calendar questions locally. Chat history lasts only for the current browser tab session; New Chat clears it. It does not modify your records.

Run `npm test` for financial calculation and companion regression tests.

For optional broader cloud responses, set `GEMINI_API_KEY` in an ignored `.env.local` file and restart the dev server. The user must enable the cloud checkbox before an unsupported local question is sent to Google Gemini. The conversation and selected budget, loan, savings, expense and calendar fields are shared; passport numbers, profile fields and document files are excluded. Recorded numerical questions continue to use deterministic local answers. Cloud responses time out and fall back to local guidance when unavailable.

The cloud route requires application authentication and deployment rate limiting before a public deployment with a paid API key. Local request validation and size limits do not replace those controls.

## Backup, recovery and private sync

Open **Backup & Sync** in the sidebar to export a JSON backup, preview and restore one, review the snapshot from before a restore, or recover deleted entries. All record collections and uploaded document content are included; backups contain sensitive data and are not encrypted.

Cloud sync is local-first, account-scoped, and backed by revision checks and a durable retry queue. It requires a Supabase project. Follow [supabase/SETUP.md](supabase/SETUP.md) to configure the database migration, Email authentication and public environment variables. No Supabase project is currently configured, so live sign-in, RLS and multi-device sync still require activation and verification.

### Editorial UI redesign

The October 2026 redesign uses locally served Satoshi, Staatliches and Stint Ultra Condensed fonts, a navy/blue palette, readable labels, simpler navigation, a mobile quick dock, three Home money summaries, and reduced-motion support. Light mode is retained. Font sources and licenses are recorded in `public/fonts/`.

The redesign is isolated in the `checkpoint-editorial-ui` commit/tag. To undo it without rewriting history, run `git revert checkpoint-editorial-ui`, then push the resulting revert commit. The preceding backup/sync checkpoint remains `checkpoint-backup-sync`.

### UK101 accounts and welcome page

Signed-out visitors now see a UK101 welcome page with email-as-username/password sign-in and account creation. Connect Supabase using `supabase/SETUP.md` to activate accounts. Until configured, the page offers explicitly labelled local access to existing records. The `checkpoint-uk101-welcome` commit/tag isolates this change; undo with `git revert checkpoint-uk101-welcome`.

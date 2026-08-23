# Job Application Tracker

A full-stack app for tracking internship and job applications, every application logged, filtered by status, and moved through the pipeline from Applied to Offer.

Built this because I was tracking applications in a random notes file with no real system. Wanted an actual one.

**Live:** [job-tracker-psi-lovat.vercel.app](https://job-tracker-psi-lovat.vercel.app/)

## Features

- **Authentication** — email/password and Google OAuth sign-in via Supabase Auth
- **Full CRUD** — add, edit, delete, and update the status of every application
- **Row-Level Security** — Postgres RLS policies enforce that each user can only ever see their own data, at the database level, not just in the UI
- **Status pipeline** — Applied → OA → Interview → Offer → Rejected, with filterable views
- **Custom email delivery** — account verification through a self-configured SMTP workflow (Resend), including debugging a permissions issue separate from RLS
- **AI fit analysis** — paste a job description in, get a match score, strengths, gaps, and a tailoring tip back, powered by the Anthropic Claude API
- **Rate limiting** — server-side, per-user (10 requests/hour, sliding window), backed by a Postgres table logging every request; protects against abuse and runaway API costs. Debugged a real two-layer Postgres permissions bug along the way, missing RLS SELECT policy, then a missing table-level GRANT — both required to actually read the log table back

### In progress
- **reCAPTCHA v3** — bot protection on signup/login

## Tech Stack

- Next.js 16 (App Router)
- Supabase (Auth + PostgreSQL + Row-Level Security)
- Resend (transactional email)
- Anthropic Claude API (AI fit analysis)
- Deployed on Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a `.env.local` file — see `.env.example` for the required variables (Supabase URL/key at minimum; Anthropic and reCAPTCHA keys only needed once those features are wired up).

## How I Built This

Learning full-stack development and backend concepts this way, alongside coursework. I use Claude as a learning partner throughout — asking it to explain concepts, help debug, and pair on architecture decisions, but I write, test, and understand every line before it ships. This project is where I actually learned Row-Level Security, OAuth flows, and Postgres from scratch.
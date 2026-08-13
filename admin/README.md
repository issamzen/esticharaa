# Estichara.ma — قاعدة البيانات + لوحة التحكم

## What's in this folder

```
esticharaa-admin/
├── supabase/
│   ├── 01-schema.sql   ← the FULL database (tables, security, functions)
│   └── 02-seed.sql     ← starter data (categories, token packs) + make-me-admin
└── src/                ← the admin dashboard app (Arabic, RTL)
```

---

## Step 1 — Create your Supabase project (free, ~3 minutes)

1. Go to **https://supabase.com** → Sign up (GitHub login works)
2. Click **New project**
   - Name: `estichara`
   - Database password: choose a strong one and **save it somewhere**
   - Region: **West EU (Paris)** — closest to Morocco
3. Wait ~2 minutes for it to be created

## Step 2 — Create the database

1. In Supabase, open **SQL Editor** (left menu) → **New query**
2. Copy ALL of `supabase/01-schema.sql` → paste → **Run** ▶️
3. New query again → copy ALL of `supabase/02-seed.sql` → paste → **Run** ▶️

That's the entire database done: registration, questions, answers,
private messages, token economy, orders, withdrawals, reviews,
notifications, reports, settings — all with security rules.

## Step 3 — Create your admin account

1. Supabase → **Authentication** → **Users** → **Add user** → enter your
   email + a password (check "Auto confirm user")
2. SQL Editor → run this (with YOUR email):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## Step 4 — Connect the dashboard

1. Supabase → **Project Settings** → **API** → copy:
   - **Project URL**
   - **anon public** key
2. Open `src/config.ts` in this folder and paste them
3. Set `DEMO_MODE = false` in the same file

## Step 5 — Run / deploy the dashboard

Locally:
```bash
bun install
bun run dev
```

Deploy to Netlify (recommended — separate site from the main website):
- New site → connect this folder/repo
- Build command: `bun run build` — Publish directory: `dist`
- Give it a subdomain like `admin.estichara.ma` (or keep the netlify.app URL,
  it's protected by login anyway)

---

## How the token flow works (manual payments)

1. User registers → gets a profile automatically (0 tokens)
2. User picks a pack → an **order** is created (pending)
3. User pays you by bank transfer / cash
4. You open **الطلبات والتوكن** in the dashboard → **تأكيد الدفع**
   → tokens are credited automatically + user gets a notification
5. Experts answer questions → you approve answers → expert earns tokens
6. Expert requests withdrawal → you approve & pay → mark **تم التحويل**

Every token movement is recorded in `token_transactions` (full audit trail).

## Security notes

- The **anon key** in `src/config.ts` is safe to be public — all protection
  comes from Row Level Security policies in the database.
- Only users with `role = 'admin'` in the `profiles` table can see or
  change anything in the dashboard. Everyone else gets "not admin".
- **Never** put the `service_role` key in any frontend code.

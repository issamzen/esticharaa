-- ============================================================
-- ESTICHARA.MA — COMPLETE SUPABASE SCHEMA
-- Run this file FIRST in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- ENUMS ----------
create type public.user_role as enum ('user', 'expert', 'admin');
create type public.expert_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.question_status as enum ('pending', 'published', 'closed', 'rejected');
create type public.answer_status as enum ('pending', 'approved', 'rejected');
create type public.order_status as enum ('pending', 'paid', 'cancelled');
create type public.withdrawal_status as enum ('pending', 'approved', 'paid', 'rejected');
create type public.tx_type as enum ('purchase', 'spend_unlock', 'earn_answer', 'earn_bonus', 'withdrawal_hold', 'withdrawal_refund', 'admin_adjust');

-- ---------- PROFILES (every registered user) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text,
  city text,
  locale text not null default 'ar',
  role public.user_role not null default 'user',
  tokens_balance integer not null default 0 check (tokens_balance >= 0),
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile on signup (registration works out of the box)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check helper (used by security policies)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- EXPERT PROFILES ----------
create table public.expert_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  title text not null default '',            -- e.g. "محامية بهيئة الرباط"
  specialization text not null default '',
  bio text not null default '',
  city text not null default '',
  status public.expert_status not null default 'pending',
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  answered_count integer not null default 0,
  earned_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_fr text not null default '',
  name_en text not null default '',
  icon text not null default 'Sparkles',
  sort integer not null default 0,
  active boolean not null default true
);

-- ---------- QUESTIONS ----------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 10 and 200),
  body text not null check (char_length(body) between 20 and 8000),
  tokens integer not null default 0 check (tokens >= 0),  -- 0 = free question
  status public.question_status not null default 'pending',
  views integer not null default 0,
  answers_count integer not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.questions (status, created_at desc);
create index on public.questions (category_id);
create index on public.questions (user_id);

-- ---------- ANSWERS ----------
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 20 and 12000),
  preview text not null default '',           -- free teaser shown to everyone
  status public.answer_status not null default 'pending',
  is_best boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, expert_id)
);
create index on public.answers (question_id);
create index on public.answers (expert_id);
create index on public.answers (status);

-- ---------- UNLOCKS (user paid tokens to read full answers) ----------
create table public.question_unlocks (
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tokens_spent integer not null,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

-- ---------- PRIVATE MESSAGES ----------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, expert_id, question_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.messages (conversation_id, created_at);

-- Keep conversation freshness updated
create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end $$;
create trigger on_message_insert after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------- TOKEN ECONOMY ----------
create table public.token_packs (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  tokens integer not null check (tokens > 0),
  bonus integer not null default 0,
  price_mad numeric(10,2) not null check (price_mad >= 0),
  popular boolean not null default false,
  active boolean not null default true,
  sort integer not null default 0
);

-- Manual payment flow: user creates an order → pays by bank transfer /
-- cash / CMI later → admin confirms → tokens credited automatically.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pack_id uuid references public.token_packs(id) on delete set null,
  tokens integer not null,
  bonus integer not null default 0,
  price_mad numeric(10,2) not null,
  method text not null default 'bank_transfer',
  status public.order_status not null default 'pending',
  reference text not null default '',         -- bank transfer reference
  admin_note text not null default '',
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.orders (status, created_at desc);

-- Every token movement is recorded here (full audit trail)
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,                    -- positive = credit, negative = debit
  type public.tx_type not null,
  reference_id uuid,                          -- order / question / withdrawal id
  note text not null default '',
  created_at timestamptz not null default now()
);
create index on public.token_transactions (user_id, created_at desc);

-- Expert withdrawals (tokens → cash)
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.profiles(id) on delete cascade,
  tokens integer not null check (tokens > 0),
  amount_mad numeric(10,2) not null,
  method text not null default 'bank_transfer',
  payout_details text not null default '',    -- RIB / PayPal email
  status public.withdrawal_status not null default 'pending',
  admin_note text not null default '',
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.withdrawals (status, created_at desc);

-- ---------- REVIEWS ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (expert_id, user_id, question_id)
);

-- Keep expert rating in sync
create or replace function public.refresh_expert_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.expert_profiles ep set
    rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where expert_id = ep.user_id), 0),
    reviews_count = (select count(*) from public.reviews where expert_id = ep.user_id)
  where ep.user_id = coalesce(new.expert_id, old.expert_id);
  return coalesce(new, old);
end $$;
create trigger on_review_change after insert or update or delete on public.reviews
  for each row execute function public.refresh_expert_rating();

-- ---------- NOTIFICATIONS ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  link text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

-- ---------- REPORTS (abuse / complaints) ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('question','answer','user','message')),
  target_id uuid not null,
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- SITE SETTINGS (admin-controlled) ----------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.settings (key, value) values
  ('award_per_answer',   '10'),      -- tokens an expert earns per approved answer
  ('best_answer_bonus',  '5'),
  ('min_payout_tokens',  '1000'),
  ('token_to_mad',       '0.5'),     -- 1 token = 0.5 MAD at withdrawal
  ('maintenance_mode',   'false');

-- ---------- updated_at auto-touch ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger t_profiles_u  before update on public.profiles        for each row execute function public.touch_updated_at();
create trigger t_experts_u   before update on public.expert_profiles for each row execute function public.touch_updated_at();
create trigger t_questions_u before update on public.questions       for each row execute function public.touch_updated_at();
create trigger t_answers_u   before update on public.answers         for each row execute function public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (who can see/change what)
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.expert_profiles    enable row level security;
alter table public.categories         enable row level security;
alter table public.questions          enable row level security;
alter table public.answers            enable row level security;
alter table public.question_unlocks   enable row level security;
alter table public.conversations      enable row level security;
alter table public.messages           enable row level security;
alter table public.token_packs        enable row level security;
alter table public.orders             enable row level security;
alter table public.token_transactions enable row level security;
alter table public.withdrawals        enable row level security;
alter table public.reviews            enable row level security;
alter table public.notifications      enable row level security;
alter table public.reports            enable row level security;
alter table public.settings           enable row level security;

-- profiles
create policy "read own profile"    on public.profiles for select using (id = auth.uid() or public.is_admin() or role = 'expert');
create policy "update own profile"  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()) and tokens_balance = (select p.tokens_balance from public.profiles p where p.id = auth.uid()));
create policy "admin update any"    on public.profiles for update using (public.is_admin());

-- expert profiles
create policy "public sees approved experts" on public.expert_profiles for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "apply as expert"     on public.expert_profiles for insert with check (user_id = auth.uid());
create policy "expert edits own bio" on public.expert_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid() and status = (select e.status from public.expert_profiles e where e.user_id = auth.uid()) and verified = (select e.verified from public.expert_profiles e where e.user_id = auth.uid()));
create policy "admin manages experts" on public.expert_profiles for update using (public.is_admin());

-- categories (public read, admin write)
create policy "anyone reads categories" on public.categories for select using (true);
create policy "admin writes categories" on public.categories for all using (public.is_admin());

-- questions
create policy "read published questions" on public.questions for select using (status = 'published' or user_id = auth.uid() or public.is_admin());
create policy "ask question"          on public.questions for insert with check (user_id = auth.uid());
create policy "edit own pending"      on public.questions for update using (user_id = auth.uid() and status = 'pending');
create policy "admin manages questions" on public.questions for update using (public.is_admin());
create policy "admin deletes questions" on public.questions for delete using (public.is_admin());

-- answers: full body only for owner of question after unlock, the expert, or admin
create policy "read full answer when allowed" on public.answers for select using (
  public.is_admin()
  or expert_id = auth.uid()
  or (
    status = 'approved' and (
      exists (select 1 from public.questions q where q.id = question_id and q.tokens = 0)
      or exists (select 1 from public.question_unlocks u where u.question_id = answers.question_id and u.user_id = auth.uid())
      or exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
    )
  )
);
create policy "expert writes answer" on public.answers for insert with check (
  expert_id = auth.uid()
  and exists (select 1 from public.expert_profiles e where e.user_id = auth.uid() and e.status = 'approved')
);
create policy "expert edits pending answer" on public.answers for update using (expert_id = auth.uid() and status = 'pending');
create policy "admin manages answers" on public.answers for update using (public.is_admin());
create policy "admin deletes answers" on public.answers for delete using (public.is_admin());

-- Public teaser view (safe columns only — bypasses row security on purpose)
create view public.answer_previews as
  select id, question_id, expert_id, preview, is_best, created_at
  from public.answers where status = 'approved';
grant select on public.answer_previews to anon, authenticated;

-- unlocks
create policy "see own unlocks"  on public.question_unlocks for select using (user_id = auth.uid() or public.is_admin());

-- conversations & messages (participants + admin)
create policy "participants see conversation" on public.conversations for select using (user_id = auth.uid() or expert_id = auth.uid() or public.is_admin());
create policy "user starts conversation" on public.conversations for insert with check (user_id = auth.uid());
create policy "participants read messages" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or c.expert_id = auth.uid()))
  or public.is_admin()
);
create policy "participants send messages" on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or c.expert_id = auth.uid()))
);
create policy "mark message read" on public.messages for update using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or c.expert_id = auth.uid()))
);

-- token packs (public read active, admin write)
create policy "anyone reads active packs" on public.token_packs for select using (active = true or public.is_admin());
create policy "admin writes packs" on public.token_packs for all using (public.is_admin());

-- orders
create policy "see own orders"  on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "create own order" on public.orders for insert with check (user_id = auth.uid() and status = 'pending');
create policy "admin manages orders" on public.orders for update using (public.is_admin());

-- transactions (read own; only functions write)
create policy "see own transactions" on public.token_transactions for select using (user_id = auth.uid() or public.is_admin());

-- withdrawals
create policy "expert sees own withdrawals" on public.withdrawals for select using (expert_id = auth.uid() or public.is_admin());
create policy "admin manages withdrawals" on public.withdrawals for update using (public.is_admin());

-- reviews
create policy "anyone reads reviews" on public.reviews for select using (true);
create policy "reviewer writes review" on public.reviews for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.question_unlocks u join public.questions q on q.id = u.question_id
              where u.user_id = auth.uid() and q.id = reviews.question_id)
);
create policy "admin deletes reviews" on public.reviews for delete using (public.is_admin());

-- notifications
create policy "see own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "mark own notification read" on public.notifications for update using (user_id = auth.uid());

-- reports
create policy "create report" on public.reports for insert with check (reporter_id = auth.uid());
create policy "admin reads reports" on public.reports for select using (public.is_admin());
create policy "admin resolves reports" on public.reports for update using (public.is_admin());

-- settings (public read, admin write)
create policy "anyone reads settings" on public.settings for select using (true);
create policy "admin writes settings" on public.settings for update using (public.is_admin());

-- ============================================================
-- BUSINESS FUNCTIONS (safe, atomic token operations)
-- ============================================================

-- User unlocks a premium question's answers
create or replace function public.unlock_question(p_question_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_cost int; v_balance int;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select tokens into v_cost from public.questions where id = p_question_id and status = 'published';
  if not found then raise exception 'QUESTION_NOT_FOUND'; end if;
  if v_cost = 0 then return; end if;
  if exists (select 1 from public.question_unlocks where question_id = p_question_id and user_id = auth.uid()) then return; end if;
  select tokens_balance into v_balance from public.profiles where id = auth.uid() for update;
  if v_balance < v_cost then raise exception 'INSUFFICIENT_TOKENS'; end if;
  update public.profiles set tokens_balance = tokens_balance - v_cost where id = auth.uid();
  insert into public.question_unlocks (question_id, user_id, tokens_spent) values (p_question_id, auth.uid(), v_cost);
  insert into public.token_transactions (user_id, amount, type, reference_id) values (auth.uid(), -v_cost, 'spend_unlock', p_question_id);
end $$;

-- Admin approves an answer → expert earns tokens automatically
create or replace function public.approve_answer(p_answer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_expert uuid; v_question uuid; v_award int;
begin
  if not public.is_admin() then raise exception 'ADMIN_ONLY'; end if;
  select expert_id, question_id into v_expert, v_question from public.answers where id = p_answer_id and status = 'pending';
  if not found then raise exception 'ANSWER_NOT_PENDING'; end if;
  select (value)::int into v_award from public.settings where key = 'award_per_answer';
  update public.answers set status = 'approved' where id = p_answer_id;
  update public.questions set answers_count = answers_count + 1 where id = v_question;
  update public.profiles set tokens_balance = tokens_balance + v_award where id = v_expert;
  update public.expert_profiles set answered_count = answered_count + 1, earned_tokens = earned_tokens + v_award where user_id = v_expert;
  insert into public.token_transactions (user_id, amount, type, reference_id) values (v_expert, v_award, 'earn_answer', p_answer_id);
  insert into public.notifications (user_id, title, body) values (v_expert, 'تمت الموافقة على إجابتك', 'حصلت على ' || v_award || ' توكن.');
end $$;

-- Admin confirms a manual payment → tokens credited
create or replace function public.confirm_order(p_order_id uuid, p_note text default '')
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_tokens int; v_bonus int;
begin
  if not public.is_admin() then raise exception 'ADMIN_ONLY'; end if;
  select user_id, tokens, bonus into v_user, v_tokens, v_bonus from public.orders where id = p_order_id and status = 'pending' for update;
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;
  update public.orders set status = 'paid', admin_note = p_note, confirmed_by = auth.uid(), confirmed_at = now() where id = p_order_id;
  update public.profiles set tokens_balance = tokens_balance + v_tokens + v_bonus where id = v_user;
  insert into public.token_transactions (user_id, amount, type, reference_id, note) values (v_user, v_tokens + v_bonus, 'purchase', p_order_id, p_note);
  insert into public.notifications (user_id, title, body) values (v_user, 'تم تأكيد طلبك', 'تمت إضافة ' || (v_tokens + v_bonus) || ' توكن إلى رصيدك.');
end $$;

-- Admin manually adjusts a balance (bonus / correction)
create or replace function public.adjust_tokens(p_user_id uuid, p_amount int, p_note text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_ONLY'; end if;
  update public.profiles set tokens_balance = tokens_balance + p_amount where id = p_user_id;
  insert into public.token_transactions (user_id, amount, type, note) values (p_user_id, p_amount, 'admin_adjust', p_note);
end $$;

-- Expert requests a withdrawal (tokens held immediately)
create or replace function public.request_withdrawal(p_tokens int, p_method text, p_details text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_min int; v_rate numeric; v_balance int; v_id uuid;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if not exists (select 1 from public.expert_profiles where user_id = auth.uid() and status = 'approved') then
    raise exception 'NOT_AN_APPROVED_EXPERT';
  end if;
  select (value)::int into v_min from public.settings where key = 'min_payout_tokens';
  select (value)::numeric into v_rate from public.settings where key = 'token_to_mad';
  if p_tokens < v_min then raise exception 'BELOW_MINIMUM_PAYOUT'; end if;
  select tokens_balance into v_balance from public.profiles where id = auth.uid() for update;
  if v_balance < p_tokens then raise exception 'INSUFFICIENT_TOKENS'; end if;
  update public.profiles set tokens_balance = tokens_balance - p_tokens where id = auth.uid();
  insert into public.withdrawals (expert_id, tokens, amount_mad, method, payout_details)
    values (auth.uid(), p_tokens, round(p_tokens * v_rate, 2), p_method, p_details) returning id into v_id;
  insert into public.token_transactions (user_id, amount, type, reference_id) values (auth.uid(), -p_tokens, 'withdrawal_hold', v_id);
  return v_id;
end $$;

-- Admin decides a withdrawal ('approved' | 'paid' | 'rejected' → refund)
create or replace function public.decide_withdrawal(p_id uuid, p_status text, p_note text default '')
returns void language plpgsql security definer set search_path = public as $$
declare v_expert uuid; v_tokens int; v_current public.withdrawal_status;
begin
  if not public.is_admin() then raise exception 'ADMIN_ONLY'; end if;
  select expert_id, tokens, status into v_expert, v_tokens, v_current from public.withdrawals where id = p_id for update;
  if not found then raise exception 'WITHDRAWAL_NOT_FOUND'; end if;
  if v_current in ('paid', 'rejected') then raise exception 'ALREADY_FINAL'; end if;
  update public.withdrawals set status = p_status::public.withdrawal_status, admin_note = p_note, decided_by = auth.uid(), decided_at = now() where id = p_id;
  if p_status = 'rejected' then
    update public.profiles set tokens_balance = tokens_balance + v_tokens where id = v_expert;
    insert into public.token_transactions (user_id, amount, type, reference_id, note) values (v_expert, v_tokens, 'withdrawal_refund', p_id, p_note);
  end if;
  insert into public.notifications (user_id, title, body) values (v_expert, 'تحديث طلب السحب', 'حالة طلبك الجديدة: ' || p_status);
end $$;

-- One call returns everything the admin dashboard overview needs
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'ADMIN_ONLY'; end if;
  select jsonb_build_object(
    'users',             (select count(*) from public.profiles),
    'experts',           (select count(*) from public.expert_profiles where status = 'approved'),
    'pending_experts',   (select count(*) from public.expert_profiles where status = 'pending'),
    'questions',         (select count(*) from public.questions),
    'pending_questions', (select count(*) from public.questions where status = 'pending'),
    'pending_answers',   (select count(*) from public.answers where status = 'pending'),
    'pending_orders',    (select count(*) from public.orders where status = 'pending'),
    'pending_withdrawals',(select count(*) from public.withdrawals where status = 'pending'),
    'tokens_in_circulation', (select coalesce(sum(tokens_balance),0) from public.profiles),
    'revenue_mad',       (select coalesce(sum(price_mad),0) from public.orders where status = 'paid'),
    'signups_14d', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'count', c) order by d), '[]'::jsonb)
      from (
        select date_trunc('day', dd) d, count(p.id) c
        from generate_series(now() - interval '13 days', now(), interval '1 day') dd
        left join public.profiles p on date_trunc('day', p.created_at) = date_trunc('day', dd)
        group by 1
      ) s
    )
  ) into result;
  return result;
end $$;

-- ---------- STORAGE (avatars bucket) ----------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images public" on storage.objects for select using (bucket_id = 'avatars');
create policy "users upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- REALTIME (live chat) ----------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

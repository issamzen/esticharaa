-- ============================================================
-- ESTICHARA.MA — EXPERT APPLICATIONS + 404 IMAGE (run once)
-- ============================================================

-- 404 page image setting (admin-controlled)
insert into public.settings (key, value) values
  ('page_404', '{"image_url": "", "show_search": true}'::jsonb)
on conflict (key) do nothing;

-- Documents attached to an expert application
create table public.expert_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('cin', 'photo', 'cv', 'diploma', 'license', 'other')),
  file_url text not null,
  file_name text not null default '',
  created_at timestamptz not null default now()
);
create index on public.expert_documents (user_id);

alter table public.expert_documents enable row level security;

create policy "owner reads own documents" on public.expert_documents
  for select using (user_id = auth.uid() or public.is_admin());
create policy "owner uploads documents" on public.expert_documents
  for insert with check (user_id = auth.uid());
create policy "owner deletes own pending docs" on public.expert_documents
  for delete using (
    user_id = auth.uid()
    and exists (select 1 from public.expert_profiles e
                where e.user_id = auth.uid() and e.status = 'pending')
  );
create policy "admin deletes documents" on public.expert_documents
  for delete using (public.is_admin());

-- Private storage bucket for expert documents (CIN is sensitive!)
insert into storage.buckets (id, name, public) values ('expert-docs', 'expert-docs', false)
on conflict (id) do nothing;

create policy "owner uploads expert docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expert-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner reads own expert docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'expert-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "admin deletes expert docs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expert-docs' and public.is_admin());

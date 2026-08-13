-- ============================================================
-- ESTICHARA.MA — CMS SETTINGS (run once in SQL Editor)
-- Lets the admin dashboard control branding, colors, menus,
-- payment methods... without touching GitHub.
-- ============================================================

-- Site-wide settings rows (jsonb payloads, admin-editable)
insert into public.settings (key, value) values
  ('site_branding', '{
    "site_name": "Estichara.ma",
    "logo_url": "",
    "favicon_url": ""
  }'::jsonb),
  ('site_colors', '{
    "primary":   "#0D4B4B",
    "secondary": "#1E8C85",
    "accent":    "#D4AF37",
    "muted":     "#F2E8D6"
  }'::jsonb),
  ('site_nav', '[
    {"to": "/questions",     "key": "nav.questions",     "visible": true},
    {"to": "/categories",    "key": "nav.categories",    "visible": true},
    {"to": "/experts",       "key": "nav.experts",       "visible": true},
    {"to": "/tokens",        "key": "tokens.buyTokens",  "visible": true},
    {"to": "/pricing",       "key": "nav.pricing",       "visible": true},
    {"to": "/about",         "key": "footer.about",      "visible": true}
  ]'::jsonb),
  ('site_footer', '[
    {"to": "/questions",     "key": "nav.questions",       "visible": true},
    {"to": "/categories",    "key": "nav.categories",      "visible": true},
    {"to": "/experts",       "key": "nav.experts",         "visible": true},
    {"to": "/blog",          "key": "nav.blog",            "visible": true},
    {"to": "/tokens",        "key": "tokens.buyTokens",    "visible": true},
    {"to": "/pricing",       "key": "nav.pricing",         "visible": true},
    {"to": "/ask",           "key": "common.askQuestion",  "visible": true},
    {"to": "/become-expert", "key": "nav.becomeExpert",    "visible": true},
    {"to": "/about",         "key": "footer.about",        "visible": true},
    {"to": "/contact",       "key": "footer.contact",      "visible": true}
  ]'::jsonb),
  ('payment_methods', '[
    {"id": "card",     "label": "بطاقة بنكية (CMI)",  "icon": "CreditCard", "active": true},
    {"id": "transfer", "label": "تحويل بنكي",          "icon": "Landmark",   "active": true},
    {"id": "cash",     "label": "كاش بلص / وفاكاش",     "icon": "Wallet",     "active": true},
    {"id": "paypal",   "label": "PayPal",              "icon": "Wallet",     "active": false}
  ]'::jsonb)
on conflict (key) do nothing;

-- Allow admin to INSERT new settings keys too (update policy already exists)
create policy "admin inserts settings" on public.settings
  for insert with check (public.is_admin());

-- Public storage bucket for logo / favicon
insert into storage.buckets (id, name, public) values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "branding public read" on storage.objects
  for select using (bucket_id = 'branding');
create policy "admin uploads branding" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'branding' and public.is_admin());
create policy "admin updates branding" on storage.objects
  for update to authenticated
  using (bucket_id = 'branding' and public.is_admin());
create policy "admin deletes branding" on storage.objects
  for delete to authenticated
  using (bucket_id = 'branding' and public.is_admin());

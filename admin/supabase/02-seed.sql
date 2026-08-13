-- ============================================================
-- ESTICHARA.MA — SEED DATA
-- Run AFTER 01-schema.sql
-- ============================================================

-- Categories (same as your website)
insert into public.categories (slug, name_ar, name_fr, name_en, icon, sort) values
  ('legal',       'الأعمال والقانون',   'Droit & Business',      'Business & Law',      'Scale',          1),
  ('medical',     'الصحة والطب',        'Santé & Médecine',      'Health & Medicine',   'Stethoscope',    2),
  ('finance',     'المال والضرائب',     'Finance & Impôts',      'Finance & Taxes',     'Landmark',       3),
  ('tech',        'التقنية والبرمجة',   'Tech & Développement',  'Tech & Development',  'Code2',          4),
  ('education',   'التعليم والدراسة',   'Éducation',             'Education',           'GraduationCap',  5),
  ('realestate',  'العقار والسكن',      'Immobilier',            'Real Estate',         'Home',           6),
  ('family',      'الأسرة والعلاقات',   'Famille',               'Family',              'Heart',          7),
  ('career',      'العمل والوظائف',     'Carrière',              'Career',              'Briefcase',      8),
  ('business',    'ريادة الأعمال',      'Entrepreneuriat',       'Entrepreneurship',    'Rocket',         9),
  ('psychology',  'الدعم النفسي',       'Soutien psychologique', 'Psychology',          'Brain',          10)
on conflict (slug) do nothing;

-- Token packs (same as your pricing page)
insert into public.token_packs (name_ar, tokens, bonus, price_mad, popular, sort) values
  ('باقة البداية',   100,  0,   99.00,  false, 1),
  ('الباقة الشائعة', 500,  50,  449.00, true,  2),
  ('باقة برو',       1000, 100, 849.00, false, 3),
  ('باقة المؤسسات',  5000, 750, 3799.00, false, 4);

-- ============================================================
-- ⚠️ MAKE YOURSELF ADMIN
-- 1. First sign up in your app (or Supabase Dashboard → Authentication → Add user)
-- 2. Then run this line with YOUR email:
-- ============================================================
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

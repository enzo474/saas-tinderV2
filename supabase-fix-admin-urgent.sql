-- ============================================
-- FIX URGENT : Déblocage compte admin
-- ============================================
-- À exécuter IMMÉDIATEMENT dans Supabase SQL Editor

-- 1. Créer une analyse "factice" complète et payée pour l'admin
INSERT INTO analyses (
  user_id,
  status,
  paid_at,
  ab_variant,
  created_at,
  updated_at,
  photo_count,
  diagnostic,
  optimized_bios,
  projection,
  quick_optimizations
)
SELECT 
  id,
  'paid',  -- Status payé
  NOW(),   -- Payé maintenant
  'A',     -- Variant A
  NOW(),
  NOW(),
  5,       -- 5 photos
  '{"overall_score": 8, "main_issues": ["Test admin"], "strengths": ["Admin mode"]}',
  '["Bio admin test 1", "Bio admin test 2", "Bio admin test 3"]',
  '{"current_matches": 10, "optimized_matches": 50, "improvement": "5x"}',
  '["Quick fix 1", "Quick fix 2", "Quick fix 3"]'
FROM auth.users
WHERE email = 'enzo.ambrosiano38920@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 2. Vérifier que tout est OK
SELECT 
  u.email,
  a.status,
  a.paid_at,
  a.created_at,
  p.role,
  p.credits
FROM auth.users u
LEFT JOIN analyses a ON u.id = a.user_id
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'enzo.ambrosiano38920@gmail.com';

-- Résultat attendu :
-- email: enzo.ambrosiano38920@gmail.com
-- status: paid
-- paid_at: (timestamp récent)
-- role: admin
-- credits: 999999

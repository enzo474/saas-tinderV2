-- Ajouter les colonnes pour la génération de photos IA (offre premium 14,90€)
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS nanobanana_task_ids TEXT[],
  ADD COLUMN IF NOT EXISTS generated_photos_urls TEXT[],
  ADD COLUMN IF NOT EXISTS image_generation_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_generation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_photos_urls TEXT[];

-- nanobanana_task_ids : IDs des tasks NanoBanana pour polling
-- generated_photos_urls : URLs finales des 5 photos générées (Supabase Storage)
-- image_generation_used : flag anti-abus (une seule génération par achat)
-- image_generation_started_at : timestamp de début de génération
-- source_photos_urls : URLs des photos sources uploadées par l'utilisateur

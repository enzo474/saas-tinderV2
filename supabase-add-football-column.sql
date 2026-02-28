-- Ajoute la colonne pour stocker le football (accroche optimisée) généré par l'IA
ALTER TABLE rizz_sessions
  ADD COLUMN IF NOT EXISTS generated_football TEXT;

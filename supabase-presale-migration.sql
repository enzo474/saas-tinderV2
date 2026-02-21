-- Migration : colonne prévente dans user_profiles
-- À exécuter dans Supabase SQL Editor

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS presale_purchased_at TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.presale_purchased_at IS 'Date d''achat de la prévente Accroche/Discussion. NULL = pas acheté.';

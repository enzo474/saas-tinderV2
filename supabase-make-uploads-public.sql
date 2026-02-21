-- Rendre le bucket 'uploads' PUBLIC pour permettre l'affichage des images générées
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- 1. Rendre le bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'uploads';

-- 2. Créer une policy pour permettre la lecture publique des photos générées
CREATE POLICY "Public read access for generated photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[2] = 'generated-photos'
);

-- 3. (Optionnel) Vérifier que c'est bien appliqué
SELECT id, name, public FROM storage.buckets WHERE id = 'uploads';

-- Ajouter la colonne personality à la table analyses
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS personality TEXT;

-- Cette colonne stocke la description personnalité de l'utilisateur (max 300 caractères)
-- Exemple: "Je suis plutôt sarcastique, j'aime l'humour noir et je me prends jamais au sérieux..."

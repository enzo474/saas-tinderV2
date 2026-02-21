'use client'

interface EditPromptInputProps {
  value: string
  onChange: (value: string) => void
  hasReferenceImage?: boolean
}

const EXAMPLE_PROMPT_WITH_REF =
  "Ne change absolument rien à l'Image 1, garde cette image telle quelle. Change uniquement la tenue par celle que je t'ai envoyée en Image 2."

const EXAMPLE_PROMPT_NO_REF =
  "Change la couleur de la veste en noir, remplace le fond par un environnement urbain moderne, conserve mon visage et ma posture exactement."

export function EditPromptInput({ value, onChange, hasReferenceImage }: EditPromptInputProps) {
  const charCount = value.length
  const maxChars = 800
  const minChars = 10
  const isValid = charCount >= minChars && charCount <= maxChars
  const examplePrompt = hasReferenceImage ? EXAMPLE_PROMPT_WITH_REF : EXAMPLE_PROMPT_NO_REF

  return (
    <div className="space-y-5">
      {/* Textarea */}
      <div>
        <label className="block font-montserrat font-semibold text-white text-sm mb-2">
          Instructions de modification
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Décris ce que tu veux modifier..."
          className="w-full h-36 px-4 py-3 bg-bg-primary border-2 border-border-primary rounded-xl font-inter text-white text-sm placeholder:text-text-tertiary focus:outline-none focus:border-red-primary resize-none transition-colors duration-200"
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center mt-1.5">
          <p className={`font-inter text-xs ${isValid ? 'text-text-tertiary' : 'text-red-light'}`}>
            {charCount < minChars
              ? `Minimum ${minChars} caractères requis`
              : 'Sois précis pour un meilleur résultat'}
          </p>
          <p className={`font-inter text-xs ${charCount > maxChars * 0.9 ? 'text-red-light' : 'text-text-tertiary'}`}>
            {charCount} / {maxChars}
          </p>
        </div>
      </div>

      {/* Exemple de prompt */}
      <div>
        <p className="text-text-tertiary text-xs font-semibold uppercase tracking-wide mb-2">
          Exemple de prompt
        </p>
        <button
          type="button"
          onClick={() => onChange(examplePrompt)}
          className="w-full text-left px-4 py-3.5 bg-bg-primary border-2 border-border-primary hover:border-red-primary rounded-xl transition-all duration-200 group"
        >
          <div className="flex items-start gap-3">
            <span className="text-red-primary text-base mt-0.5 shrink-0">💡</span>
            <p className="font-inter text-text-secondary text-sm leading-relaxed group-hover:text-white transition-colors">
              &quot;{examplePrompt}&quot;
            </p>
          </div>
          <p className="text-text-tertiary text-xs mt-2 ml-7">
            Cliquez pour utiliser cet exemple
          </p>
        </button>
      </div>

      {/* Astuce */}
      <div className="flex items-start gap-3 px-4 py-3 bg-red-primary/8 border border-red-primary/25 rounded-xl">
        <span className="text-red-light text-base shrink-0 mt-0.5">⚡</span>
        <p className="font-inter text-text-secondary text-sm leading-relaxed">
          <strong className="text-red-light">Astuce :</strong> Plus tu es précis dans tes instructions, meilleur sera le résultat.{' '}
          {hasReferenceImage
            ? "Utilise \"Image 1\" et \"Image 2\" pour référencer chaque photo dans ton prompt."
            : "L'IA préservera ton visage et ton identité quoi qu'il arrive."}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function UpdateImagesPage() {
  const [taskId, setTaskId] = useState('')
  const [resultImageUrl, setResultImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/update-image-from-nanobanana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: taskId.trim(),
          resultImageUrl: resultImageUrl.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Image mise à jour avec succès',
          details: data,
        })
        // Reset form
        setTaskId('')
        setResultImageUrl('')
      } else {
        setResult({
          success: false,
          message: data.error || 'Erreur lors de la mise à jour',
          details: data,
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Erreur réseau',
        details: { error: error.message },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-sora">
          Mise à jour manuelle des images NanoBanana
        </h1>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 mb-6">
          <p className="text-[#9da3af] mb-4">
            Utilise cette page pour mettre à jour manuellement les images générées par NanoBanana.
            <br />
            Copie-colle le <code className="bg-[#27272a] px-2 py-1 rounded">taskId</code> et l&apos;URL de résultat depuis les logs NanoBanana.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="taskId" className="block text-sm font-medium mb-2">
              Task ID (depuis les logs NanoBanana)
            </label>
            <input
              id="taskId"
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="ex: b3fbefb3a09d1031f0966dd55b0b6292"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#6366f1]"
              required
            />
          </div>

          <div>
            <label htmlFor="resultImageUrl" className="block text-sm font-medium mb-2">
              URL de résultat (depuis les logs NanoBanana)
            </label>
            <input
              id="resultImageUrl"
              type="url"
              value={resultImageUrl}
              onChange={(e) => setResultImageUrl(e.target.value)}
              placeholder="ex: https://tempfile.aiquickdraw.com/workers/results/..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#6366f1]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-[#f3f4f6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mise à jour en cours...
              </>
            ) : (
              'Mettre à jour l\'image'
            )}
          </button>
        </form>

        {result && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              result.success
                ? 'bg-green-900/20 border-green-700 text-green-300'
                : 'bg-red-900/20 border-red-700 text-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold mb-2">{result.message}</p>
                {result.details && (
                  <pre className="text-xs bg-black/30 p-3 rounded mt-2 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-[#9da3af] text-sm">
            <li>Va sur les logs NanoBanana (https://nanobananaapi.ai/fr/logs)</li>
            <li>Trouve la ligne avec le statut &quot;Succès&quot; pour ton image</li>
            <li>Copie le <code className="bg-[#27272a] px-1 py-0.5 rounded">taskId</code> (colonne &quot;taskld&quot;)</li>
            <li>Copie l&apos;URL complète depuis la colonne &quot;Résultat&quot; (clique sur l&apos;icône de copie)</li>
            <li>Colle les deux valeurs dans le formulaire ci-dessus</li>
            <li>Clique sur &quot;Mettre à jour l&apos;image&quot;</li>
            <li>L&apos;image devrait apparaître dans ton dashboard après quelques secondes</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

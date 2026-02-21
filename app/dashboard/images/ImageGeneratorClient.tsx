'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { PhotoUploader } from '@/components/image-generator/PhotoUploader'
import { SingleStylePicker } from '@/components/image-generator/SingleStylePicker'
import { EditPromptInput } from '@/components/image-generator/EditPromptInput'
import { Button } from '@/components/ui/Button'
import { RechargeModal } from '@/components/credits/RechargeModal'
import { useRouter } from 'next/navigation'
import { Sparkles, Image as ImageIcon, Upload } from 'lucide-react'

interface GeneratedImage {
  id: string
  image_url: string
  photo_number: number
  created_at: string
}

interface ImageFolder {
  slug: string
  label: string
  count: number
  items: GeneratedImage[]
}

interface ImageGeneratorClientProps {
  userId: string
  availableStyles: any[]
  /** Used by the "reprendre" page — images grouped by style */
  imageFolders?: ImageFolder[]
  /** Legacy flat list (kept for the main images page) */
  generatedImages?: GeneratedImage[]
  initialMode?: 'new' | 'edit'
}

type Mode = 'new' | 'edit' | null
type NewImageStep = 'upload' | 'select-style' | 'generating'
type EditImageStep = 'select-generated' | 'upload-reference' | 'edit-prompt' | 'generating'

export function ImageGeneratorClient({ userId, availableStyles, imageFolders, generatedImages, initialMode }: ImageGeneratorClientProps) {
  const router = useRouter()

  const [mode, setMode] = useState<Mode>(initialMode ?? null)

  useEffect(() => {
    if (initialMode) setMode(initialMode)
  }, [initialMode])
  
  // Mode "Nouvelle image"
  const [newImageStep, setNewImageStep] = useState<NewImageStep>('upload')
  const [sourcePhotos, setSourcePhotos] = useState<File[]>([])
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  
  // Mode "Reprendre image"
  const [editImageStep, setEditImageStep] = useState<EditImageStep>('select-generated')
  const [sourceImageUrl, setSourceImageUrl] = useState<string>('')
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string>('')
  const [referenceImageData, setReferenceImageData] = useState<string | null>(null)
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null)
  const [ownPhotoMode, setOwnPhotoMode] = useState(false) // true = skipped step 1, uploading own photo
  // Folder navigation state for step 1
  const [openFolderSlug, setOpenFolderSlug] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  
  // Common
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(d => { if (typeof d.credits === 'number') setCredits(d.credits) })
      .catch(() => {})
  }, [])

  // Polling jusqu'à fin réelle de la génération
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationTimeout, setGenerationTimeout] = useState(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)


  // ========== MODE "NOUVELLE IMAGE" ==========
  
  const handlePhotosUploaded = (photos: File[]) => {
    setSourcePhotos(photos)
    setNewImageStep('select-style')
  }

  const handleStyleSelected = async (styleId: string) => {
    setIsGenerating(true)
    setError(null)
    setGenerationTimeout(false)
    setGenerationProgress(0)
    setNewImageStep('generating')

    try {
      const compressPhoto = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const img = new Image()
            img.onload = () => {
              const MAX = 1024
              const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
              const canvas = document.createElement('canvas')
              canvas.width = Math.round(img.width * ratio)
              canvas.height = Math.round(img.height * ratio)
              canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
              resolve(canvas.toDataURL('image/jpeg', 0.8))
            }
            img.onerror = reject
            img.src = reader.result as string
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

      const photosBase64 = await Promise.all(sourcePhotos.map(compressPhoto))

      const response = await fetch('/api/generate-single-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePhotos: photosBase64,
          styleId: styleId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.type === 'insufficient_credits') {
          setShowRechargeModal(true)
          setNewImageStep('select-style')
          setIsGenerating(false)
          return
        }
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      if (data.taskId) {
        setPendingTaskId(data.taskId)
      } else {
        router.push('/dashboard/home')
        setIsGenerating(false)
      }
    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message || 'Une erreur est survenue')
      setNewImageStep('select-style')
      setIsGenerating(false)
    }
  }

  // ========== MODE "REPRENDRE IMAGE" ==========

  // ---- Edit mode helpers ----
  const handleGeneratedImageSelect = (imageUrl: string) => {
    setSelectedGeneratedImage(imageUrl)
  }

  const handleContinueFromGallery = () => {
    setSourceImageUrl(selectedGeneratedImage)
    setOwnPhotoMode(false)
    setEditImageStep('upload-reference')
  }

  const handleSkipGallery = () => {
    setSelectedGeneratedImage('')
    setSourceImageUrl('')
    setOwnPhotoMode(true)
    setEditImageStep('upload-reference')
  }

  const handleReferenceFileChange = (file: File) => {
    setReferenceImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setReferenceImageData(result)
      if (ownPhotoMode) {
        // Own photo mode: the uploaded image IS the source
        setSourceImageUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleContinueFromReference = () => {
    setEditImageStep('edit-prompt')
  }

  const handleSkipReference = () => {
    // Only possible if they already have a generated image selected
    setReferenceImageData(null)
    setReferenceImageFile(null)
    setEditImageStep('edit-prompt')
  }

  const handleRegenerate = async () => {
    if (!sourceImageUrl || editPrompt.trim().length < 10) {
      setError('Prompt de modification requis (minimum 10 caractères)')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationTimeout(false)
    setGenerationProgress(0)
    setEditImageStep('generating')

    try {
      const response = await fetch('/api/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImageUrl: sourceImageUrl,
          referenceImageUrl: (!ownPhotoMode && referenceImageData) ? referenceImageData : undefined,
          customPrompt: editPrompt.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.type === 'insufficient_credits') {
          setShowRechargeModal(true)
          setEditImageStep('edit-prompt')
          setIsGenerating(false)
          return
        }
        throw new Error(data.error || 'Erreur lors de la modification')
      }

      if (data.taskId) {
        setPendingTaskId(data.taskId)
      } else {
        router.push('/dashboard/home')
        setIsGenerating(false)
      }
    } catch (err: any) {
      console.error('Regeneration error:', err)
      setError(err.message || 'Une erreur est survenue')
      setEditImageStep('edit-prompt')
      setIsGenerating(false)
    }
  }

  // Polling du statut + barre de progression évolutive
  useEffect(() => {
    if (!pendingTaskId) return

    const POLL_INTERVAL_MS = 3500
    const PROGRESS_INTERVAL_MS = 2000
    const PROGRESS_STEP = 2
    const PROGRESS_CAP = 95
    const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

    const clearAll = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    // Timeout global 5 min
    timeoutRef.current = setTimeout(() => {
      clearAll()
      setGenerationTimeout(true)
      setPendingTaskId(null)
      setIsGenerating(false)
    }, TIMEOUT_MS)

    // Progression dans le temps (cap 95%)
    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress((p) => Math.min(PROGRESS_CAP, p + PROGRESS_STEP))
    }, PROGRESS_INTERVAL_MS)

    const poll = async () => {
      try {
        const res = await fetch(`/api/generation-status?taskId=${encodeURIComponent(pendingTaskId)}`)
        const data = await res.json()
        if (data.status === 'ready') {
          clearAll()
          setGenerationProgress(100)
          setTimeout(() => {
            setPendingTaskId(null)
            setIsGenerating(false)
            router.push('/dashboard/home')
          }, 1500)
        }
      } catch {
        // Ignore poll errors, retry next interval
      }
    }

    poll()
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      clearAll()
    }
  }, [pendingTaskId, router])

  // ========== RENDU ==========

  // Écran de sélection de mode
  if (!mode) {
    return (
      <>
      <RechargeModal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} currentCredits={credits} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-montserrat font-bold text-white text-2xl md:text-3xl mb-2">Générateur d&apos;Images</h1>
          <p className="text-text-secondary">Choisissez un mode de génération pour commencer.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('new')}
            className="group bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 text-left hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-red-primary/10 rounded-full flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-red-primary" />
            </div>
            <h2 className="font-montserrat font-bold text-white text-xl mb-2">Nouvelle image</h2>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Créez une nouvelle image avec un style prédéfini. Plus de 1296 combinaisons possibles.
            </p>
            <ul className="text-text-tertiary text-xs space-y-1.5 mb-5">
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> Upload 4-6 photos de votre visage</li>
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> Choisissez un style</li>
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> Génération automatique</li>
            </ul>
            <span className="text-red-primary text-sm font-semibold">10 crédits</span>
          </button>

          <button
            onClick={() => setMode('edit')}
            className="group bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8 text-left hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-red-primary/10 rounded-full flex items-center justify-center mb-5">
              <ImageIcon className="w-7 h-7 text-red-primary" />
            </div>
            <h2 className="font-montserrat font-bold text-white text-xl mb-2">Choisis ton propre style</h2>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              Modifiez une image existante avec vos instructions personnalisées.
            </p>
            <ul className="text-text-tertiary text-xs space-y-1.5 mb-5">
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> Choisissez une image existante</li>
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> Décrivez vos modifications</li>
              <li className="flex items-center gap-2"><span className="text-red-primary">✓</span> L&apos;IA applique vos changements</li>
            </ul>
            <span className="text-red-primary text-sm font-semibold">10 crédits</span>
          </button>
        </div>
      </div>
      </>
    )
  }

  // Helper : barre de progression étapes
  const StepBar = ({ steps, current }: { steps: string[]; current: string }) => {
    const currentIdx = steps.indexOf(current)
    return (
      <div className="flex items-start justify-between max-w-md mx-auto mb-10">
        {steps.map((step, idx) => {
          const status = idx < currentIdx ? 'completed' : idx === currentIdx ? 'active' : 'inactive'
          return (
            <div key={step} className="flex-1 relative flex flex-col items-center">
              {idx < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-border-primary z-0">
                  {status === 'completed' && <div className="h-full bg-gradient-to-r from-red-primary to-red-light" />}
                </div>
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10 mb-2 transition-all duration-300 ${
                status === 'completed' ? 'bg-red-primary text-white' :
                status === 'active' ? 'bg-red-primary text-white shadow-lg shadow-red-primary/40' :
                'bg-border-primary text-text-tertiary'
              }`}>
                {status === 'completed' ? '✓' : idx + 1}
              </div>
              <p className={`text-center text-xs ${status === 'active' ? 'text-white font-semibold' : 'text-text-tertiary'}`}>
                {step}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  // Mode "Nouvelle image"
  if (mode === 'new') {
    const steps = ['Upload photos', 'Choisir style', 'Générer']
    const stepKey = newImageStep === 'upload' ? steps[0] : newImageStep === 'select-style' ? steps[1] : steps[2]
    return (
      <>
      <RechargeModal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} currentCredits={credits} />
      <div className="max-w-4xl mx-auto">
        <StepBar steps={steps} current={stepKey} />

        {newImageStep === 'upload' && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat font-bold text-white text-xl">Upload 4-6 photos de vous</h2>
              <Button variant="secondary" size="sm" onClick={() => (initialMode ? router.push('/dashboard/home') : setMode(null))}>
                ← Retour
              </Button>
            </div>
            <p className="text-text-secondary text-sm mb-6">Ces photos serviront de base pour générer votre nouvelle image IA.</p>
            <PhotoUploader onPhotosUploaded={handlePhotosUploaded} />
          </div>
        )}

        {newImageStep === 'select-style' && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-montserrat font-bold text-white text-xl">Choisissez un style</h2>
              <Button variant="secondary" size="sm" onClick={() => setNewImageStep('upload')}>
                ← Retour
              </Button>
            </div>
            <div className="bg-red-primary/10 border border-red-primary/30 rounded-xl p-3 mb-6 flex items-center gap-2">
              <span>💡</span>
              <p className="text-sm text-text-secondary">
                <strong className="text-red-light">Plus de 1296 combinaisons possibles</strong> par style !
              </p>
            </div>
            <SingleStylePicker availableStyles={availableStyles} onStyleSelected={handleStyleSelected} />
            {error && (
              <div className="mt-4 p-4 bg-red-primary/10 border border-red-primary/30 rounded-xl">
                <p className="text-red-light text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {newImageStep === 'generating' && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <div className="text-center py-8">
              {generationTimeout ? (
                <>
                  <h2 className="font-montserrat font-bold text-white text-xl mb-3">Génération en cours</h2>
                  <p className="text-text-secondary text-sm mb-6">
                    La génération prend plus de temps que prévu. Votre image apparaîtra sur votre dashboard dès qu&apos;elle sera prête.
                  </p>
                  <Link href="/dashboard/home">
                    <Button>Retour à l&apos;accueil</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                  <h2 className="font-montserrat font-bold text-white text-xl mb-3">Génération en cours...</h2>
                  <p className="text-text-secondary text-sm mb-6">
                    Votre image sera prête dans quelques instants. Vous serez redirigé automatiquement.
                  </p>
                  <div className="max-w-xs mx-auto">
                    <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <p className="text-text-tertiary text-sm">{Math.round(generationProgress)} %</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      </>
    )
  }

  // Mode "Reprendre image"
  if (mode === 'edit') {
    const steps = ['Mes images', 'Référence', 'Prompt', 'Générer']
    const stepKey =
      editImageStep === 'select-generated' ? steps[0] :
      editImageStep === 'upload-reference' ? steps[1] :
      editImageStep === 'edit-prompt' ? steps[2] :
      steps[3]

    return (
      <>
      <RechargeModal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} currentCredits={credits} />
      <div className="max-w-4xl mx-auto">
        <StepBar steps={steps} current={stepKey} />

        {/* ÉTAPE 1 : Choisir depuis mes images générées (navigation par dossiers) */}
        {editImageStep === 'select-generated' && (() => {
          const folders = imageFolders ?? []
          const currentFolder = openFolderSlug ? folders.find((f) => f.slug === openFolderSlug) : null

          return (
            <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {currentFolder && (
                    <button
                      onClick={() => { setOpenFolderSlug(null); setSelectedGeneratedImage('') }}
                      className="text-text-tertiary hover:text-white transition-colors text-sm"
                    >
                      ← Dossiers
                    </button>
                  )}
                  <h2 className="font-montserrat font-bold text-white text-xl">
                    {currentFolder ? currentFolder.label : 'Choisir depuis mes images générées'}
                  </h2>
                </div>
                {!currentFolder && (
                  <Button variant="secondary" size="sm" onClick={() => (initialMode ? router.push('/dashboard/home') : setMode(null))}>
                    ← Retour
                  </Button>
                )}
              </div>
              <p className="text-text-secondary text-sm mb-6">
                {currentFolder
                  ? `${currentFolder.count} image${currentFolder.count > 1 ? 's' : ''} — cliquez sur une image pour la sélectionner.`
                  : 'Sélectionnez un dossier pour parcourir vos images générées.'}
              </p>

              {/* Vue : liste des dossiers */}
              {!currentFolder && (
                <>
                  {folders.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-xl mb-6">
                      <p className="text-text-secondary mb-1">Aucune image générée pour l&apos;instant.</p>
                      <p className="text-text-tertiary text-sm">Utilisez votre propre photo ci-dessous.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {folders.map((folder) => {
                        const thumbnail = folder.items[0]?.image_url
                        return (
                          <button
                            key={folder.slug}
                            onClick={() => setOpenFolderSlug(folder.slug)}
                            className="group bg-bg-primary border-2 border-border-primary rounded-2xl overflow-hidden hover:border-red-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-red-primary/15 transition-all duration-300 text-left"
                          >
                            <div className="h-36 bg-gradient-to-br from-border-primary to-bg-tertiary overflow-hidden">
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt={folder.label}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-text-tertiary text-3xl">🖼️</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-montserrat font-bold text-white text-sm truncate mb-0.5">
                                {folder.label}
                              </h4>
                              <p className="text-text-tertiary text-xs">
                                {folder.count} image{folder.count > 1 ? 's' : ''}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Vue : images dans le dossier ouvert */}
              {currentFolder && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                  {currentFolder.items.map((image) => {
                    const isSelected = selectedGeneratedImage === image.image_url
                    return (
                      <button
                        key={image.id}
                        onClick={() => handleGeneratedImageSelect(image.image_url)}
                        className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-red-primary ring-2 ring-red-primary/30 scale-[1.02]'
                            : 'border-border-primary hover:border-red-primary/50'
                        }`}
                      >
                        <img src={image.image_url} alt={`Photo ${image.photo_number}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-red-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-red-primary rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-sm font-bold">✓</span>
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border-primary">
                <Button
                  onClick={handleContinueFromGallery}
                  disabled={!selectedGeneratedImage}
                  className="w-full sm:w-auto justify-center"
                >
                  Continuer avec cette image →
                </Button>
              </div>
            </div>
          )
        })()}

        {/* ÉTAPE 2 : Image de référence (ou photo personnelle si ownPhotoMode) */}
        {editImageStep === 'upload-reference' && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-montserrat font-bold text-white text-xl">
                {ownPhotoMode ? 'Uploadez votre photo' : 'Style de référence'}
              </h2>
              <Button variant="secondary" size="sm" onClick={() => setEditImageStep('select-generated')}>
                ← Retour
              </Button>
            </div>

            <p className="text-text-secondary text-sm mb-6">
              {ownPhotoMode
                ? 'Uploadez la photo que vous souhaitez modifier.'
                : 'Upload une image du style que tu veux intégrer à ton image.'}
            </p>

            {/* Si déjà une image générée sélectionnée, afficher miniature */}
            {!ownPhotoMode && selectedGeneratedImage && (
              <div className="flex items-center gap-4 mb-6 p-3 bg-bg-primary/50 rounded-xl border border-border-primary">
                <div className="relative w-14 aspect-[9/16] rounded-lg overflow-hidden border border-border-primary shrink-0">
                  <img src={selectedGeneratedImage} alt="Image de base" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Image de base sélectionnée</p>
                  <p className="text-text-tertiary text-xs">Image générée que vous allez modifier</p>
                </div>
              </div>
            )}

            {/* Zone d'upload */}
            {!referenceImageData ? (
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors duration-200 ${
                ownPhotoMode ? 'border-red-primary/50 hover:border-red-primary bg-red-primary/5' : 'border-border-primary hover:border-red-primary/50'
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleReferenceFileChange(file)
                  }}
                />
                <Upload className="w-10 h-10 mb-3 text-text-tertiary" />
                <p className="text-white text-sm font-medium mb-1">
                  {ownPhotoMode ? 'Cliquez pour choisir votre photo' : 'Cliquez pour ajouter une image de référence'}
                </p>
                <p className="text-text-tertiary text-xs">JPG, PNG, WEBP • Max 10 MB</p>
              </label>
            ) : (
              <div className="relative inline-block">
                <img
                  src={referenceImageData}
                  alt="Référence"
                  className="max-h-64 rounded-xl border-2 border-border-primary object-contain"
                />
                <button
                  onClick={() => {
                    setReferenceImageData(null)
                    setReferenceImageFile(null)
                    if (ownPhotoMode) setSourceImageUrl('')
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black rounded-full text-white flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-border-primary">
              {ownPhotoMode ? (
                <Button
                  onClick={handleContinueFromReference}
                  disabled={!referenceImageData}
                  className="w-full sm:w-auto justify-center"
                >
                  Continuer →
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleContinueFromReference}
                    className="w-full sm:w-auto justify-center"
                  >
                    {referenceImageData ? 'Continuer avec cette référence →' : 'Continuer →'}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Prompt */}
        {editImageStep === 'edit-prompt' && (() => {
          const promptImages: { label: string; src: string; hint: string }[] = []
          if (sourceImageUrl) promptImages.push({ label: 'Image 1', src: sourceImageUrl, hint: 'À modifier' })
          if (referenceImageData && !ownPhotoMode) promptImages.push({ label: 'Image 2', src: referenceImageData, hint: 'Référence' })
          const hasRef = promptImages.length > 1

          return (
            <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-montserrat font-bold text-white text-xl">Décrivez vos modifications</h2>
                <Button variant="secondary" size="sm" onClick={() => setEditImageStep('upload-reference')}>
                  ← Retour
                </Button>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                Décris précisément ce que tu veux changer. L&apos;IA appliquera tes instructions en conservant ton identité.
              </p>

              {/* Aperçu des images numérotées */}
              {promptImages.length > 0 && (
                <div className="p-4 bg-bg-primary/60 border border-border-primary rounded-xl mb-6">
                  <div className="flex items-start gap-3 flex-wrap">
                    {promptImages.map((img) => (
                      <div key={img.label} className="flex flex-col items-center gap-1.5">
                        <div className="relative w-16 md:w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 border-border-primary">
                          <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-red-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg leading-tight">
                            {img.label}
                          </div>
                        </div>
                        <p className="text-text-tertiary text-xs">{img.hint}</p>
                      </div>
                    ))}
                    {hasRef && (
                      <div className="flex-1 min-w-[120px] self-center mt-1">
                        <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                          Tu as <strong className="text-white">2 images</strong> disponibles.{' '}
                          Utilise <span className="text-red-light font-semibold">&quot;Image&nbsp;1&quot;</span> et{' '}
                          <span className="text-red-light font-semibold">&quot;Image&nbsp;2&quot;</span> dans ton prompt pour les référencer.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <EditPromptInput
                value={editPrompt}
                onChange={setEditPrompt}
                hasReferenceImage={hasRef}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-primary/10 border border-red-primary/30 rounded-xl">
                  <p className="text-red-light text-sm">{error}</p>
                </div>
              )}
              <div className="mt-6">
                <Button
                  onClick={handleRegenerate}
                  disabled={isGenerating || editPrompt.trim().length < 10}
                  className="w-full justify-center"
                >
                  {isGenerating ? 'Modification...' : 'Modifier cette image (10 crédits)'}
                </Button>
              </div>
            </div>
          )
        })()}

        {/* ÉTAPE 4 : Génération */}
        {editImageStep === 'generating' && (
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-border-primary rounded-2xl p-8">
            <div className="text-center py-8">
              {generationTimeout ? (
                <>
                  <h2 className="font-montserrat font-bold text-white text-xl mb-3">Modification en cours</h2>
                  <p className="text-text-secondary text-sm mb-6">
                    La modification prend plus de temps que prévu. Votre image apparaîtra sur votre dashboard dès qu&apos;elle sera prête.
                  </p>
                  <Link href="/dashboard/home">
                    <Button>Retour à l&apos;accueil</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 border-4 border-border-primary border-t-red-primary rounded-full animate-spin" />
                  <h2 className="font-montserrat font-bold text-white text-xl mb-3">Modification en cours...</h2>
                  <p className="text-text-secondary text-sm mb-6">
                    Votre image modifiée sera prête dans quelques instants. Vous serez redirigé automatiquement.
                  </p>
                  <div className="max-w-xs mx-auto">
                    <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-red-primary to-red-light transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <p className="text-text-tertiary text-sm">{Math.round(generationProgress)} %</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      </>
    )
  }

  return null
}

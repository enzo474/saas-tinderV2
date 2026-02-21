/**
 * Service d'appel API NanoBanana Pro
 * Documentation: https://api.nanobananaapi.ai
 */

export interface NanoBananaGenerateRequest {
  prompt: string
  imageUrls?: string[] // URLs publiques des photos sources (optionnel, seulement si type = IMAGETOIAMGE)
  callBackUrl: string // URL du webhook pour recevoir l'image générée
  resolution?: '2K' | '4K'
  aspectRatio?: string
}

export interface NanoBananaGenerateResponse {
  code: number
  data: {
    taskId: string
  }
  message?: string
}

export interface NanoBananaCallbackPayload {
  code: number
  data: {
    taskId: string
    info: {
      resultImageUrl: string
    }
  }
  message?: string
}

export interface NanoBananaCreditsResponse {
  code: number
  data: {
    credits: number
  }
  message?: string
}

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL || 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate'
const NANOBANANA_CREDIT_URL = process.env.NANOBANANA_CREDIT_URL || 'https://api.nanobananaapi.ai/api/v1/common/credit'
const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY

if (!NANOBANANA_API_KEY) {
  console.warn('NANOBANANA_API_KEY is not set in environment variables')
}

/**
 * Génère une image avec NanoBanana Pro API
 * Retourne un taskId à stocker en DB pour tracking
 */
export async function generateImageNanoBanana(
  params: NanoBananaGenerateRequest
): Promise<NanoBananaGenerateResponse> {
  if (!NANOBANANA_API_KEY) {
    throw new Error('NanoBanana API key is not configured')
  }

  // Construire le body selon la doc NanoBanana
  const requestBody: any = {
    prompt: params.prompt,
    type: params.imageUrls && params.imageUrls.length > 0 ? 'IMAGETOIAMGE' : 'TEXTTOIAMGE',
    numImages: 1,
    callBackUrl: params.callBackUrl,
    // L'API renvoie "Resolution must not be blank" si ce champ est absent
    resolution: params.resolution || '2K',
  }
  
  // Ajouter imageUrls seulement si type = IMAGETOIAMGE
  if (params.imageUrls && params.imageUrls.length > 0) {
    requestBody.imageUrls = params.imageUrls
  }

  console.log('[NanoBanana API] Request sent:', { type: requestBody.type, callbackUrl: params.callBackUrl })

  const response = await fetch(NANOBANANA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NANOBANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const responseText = await response.text()
  
  if (!response.ok) {
    // Essayer de parser la réponse JSON si possible
    let errorMessage = responseText
    try {
      const errorData = JSON.parse(responseText)
      errorMessage = errorData.message || errorData.msg || JSON.stringify(errorData)
    } catch {
      // Garder le texte brut si ce n'est pas du JSON
    }
    
    console.error('[NanoBanana API] Error:', response.status, errorMessage)
    throw new Error(`NanoBanana API error: ${response.status} - ${errorMessage}`)
  }

  let data: NanoBananaGenerateResponse
  try {
    data = JSON.parse(responseText)
  } catch (parseError) {
    console.error('[NanoBanana API] Failed to parse response:', parseError)
    throw new Error(`NanoBanana API returned invalid JSON: ${responseText}`)
  }

  console.log('[NanoBanana API] Success:', { taskId: data.data?.taskId })

  if (data.code !== 200) {
    const errorMsg = data.message || data.msg || 'Unknown error'
    console.error('[NanoBanana API] Non-200 code:', data.code, errorMsg)
    throw new Error(`NanoBanana API returned error code ${data.code}: ${errorMsg}`)
  }

  return data
}

/**
 * Vérifie les crédits disponibles sur le compte NanoBanana
 */
export async function checkNanoBananaCredits(): Promise<number> {
  if (!NANOBANANA_API_KEY) {
    throw new Error('NanoBanana API key is not configured')
  }

  const response = await fetch(NANOBANANA_CREDIT_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NANOBANANA_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NanoBanana credits API error: ${response.status} - ${errorText}`)
  }

  const data: NanoBananaCreditsResponse = await response.json()

  if (data.code !== 200) {
    throw new Error(`NanoBanana credits API returned error code ${data.code}: ${data.message || 'Unknown error'}`)
  }

  return data.data.credits
}

/**
 * Télécharge une image depuis une URL et retourne un Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Valide un payload de callback NanoBanana
 * Note: Cette fonction est maintenant moins stricte car NanoBanana peut envoyer différents formats
 */
export function validateCallbackPayload(payload: any): payload is NanoBananaCallbackPayload {
  // Vérification de base: payload doit avoir data et taskId
  if (!payload || !payload.data || typeof payload.data.taskId !== 'string') {
    return false
  }
  
  // Vérifier qu'il y a au moins une URL de résultat quelque part
  const hasResultImageUrl = !!(
    payload.data.info?.resultImageUrl ||
    payload.data.info?.result_urls ||
    payload.data.result_urls ||
    payload.data.resultImageUrl
  )
  
  return hasResultImageUrl
}

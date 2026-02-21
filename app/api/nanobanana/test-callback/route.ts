import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Endpoint de test pour simuler manuellement un callback NanoBanana
 * Usage: POST /api/nanobanana/test-callback avec body: { taskId: "xxx" }
 * 
 * Cet endpoint permet de tester le callback sans attendre NanoBanana
 */
export async function POST(req: NextRequest) {
  try {
    const { taskId, resultImageUrl } = await req.json()

    if (!taskId) {
      return NextResponse.json({ error: 'taskId requis' }, { status: 400 })
    }

    // Simuler le payload NanoBanana
    const mockPayload = {
      code: 200,
      data: {
        taskId: taskId,
        info: {
          resultImageUrl: resultImageUrl || 'https://tempfile.aiquickdraw.com/workers/results/test-image.png'
        }
      }
    }

    console.log('[Test Callback] Simulating NanoBanana callback with payload:', mockPayload)

    // Appeler le vrai callback handler
    const callbackUrl = new URL('/api/nanobanana/callback', req.url)
    const response = await fetch(callbackUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPayload),
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      callbackResponse: result,
      status: response.status,
    })
  } catch (error: any) {
    console.error('[Test Callback] Error:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test',
      message: error.message 
    }, { status: 500 })
  }
}

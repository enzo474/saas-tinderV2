import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/download-image?url=https://tempfile.aiquickdraw.com/...
 * Proxy serveur pour contourner le CORS des images NanoBanana.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL requise' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
  }
}

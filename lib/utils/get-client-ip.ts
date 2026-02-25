import { headers } from 'next/headers'

export async function getClientIP(): Promise<string | null> {
  const headersList = await headers()

  const cfConnectingIP = headersList.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim())
    return ips[0] || null
  }

  const realIP = headersList.get('x-real-ip')
  if (realIP) return realIP

  return null
}

export async function generateFingerprint(ip: string): Promise<string> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const data = `${ip}-${userAgent}`
  return Buffer.from(data).toString('base64')
}

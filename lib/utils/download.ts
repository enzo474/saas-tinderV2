import JSZip from 'jszip'

function proxyUrl(url: string) {
  // Passer par le proxy serveur pour éviter les erreurs CORS
  return `/api/download-image?url=${encodeURIComponent(url)}`
}

export async function downloadImage(url: string, filename: string) {
  const response = await fetch(proxyUrl(url))
  const blob = await response.blob()
  const urlObject = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = urlObject
  a.download = filename
  a.click()
  URL.revokeObjectURL(urlObject)
}

export async function downloadAllAsZip(urls: string[], zipName: string) {
  const zip = new JSZip()
  
  for (let i = 0; i < urls.length; i++) {
    const response = await fetch(proxyUrl(urls[i]))
    const blob = await response.blob()
    zip.file(`photo-${i + 1}.jpg`, blob)
  }
  
  const content = await zip.generateAsync({ type: 'blob' })
  const urlObject = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = urlObject
  a.download = zipName
  a.click()
  URL.revokeObjectURL(urlObject)
}

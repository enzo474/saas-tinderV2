'use client'

import { useState } from 'react'
import { DemoSection } from './DemoSection'
import { StyleChangeSection } from './StyleChangeSection'

type Face  = 'a' | 'b' | 'c'
type Style = 'night' | 'urban' | 'sport' | 'travel' | 'food' | 'business' | 'beach' | 'tennis' | 'foot' | 'basket' | 'lifestyle-boy' | 'lifestyle-man'

interface Props {
  styleImages?: Record<string, string>
}

export function LandingDemoWrapper({ styleImages = {} }: Props) {
  const [generatedImg, setGeneratedImg] = useState('')
  const [face, setFace]                 = useState<Face | null>(null)
  const [style, setStyle]               = useState<Style | null>(null)

  const handleResult = (img: string, f: Face, s: Style) => {
    setGeneratedImg(img)
    setFace(f)
    setStyle(s)
  }

  return (
    <>
      <DemoSection onResult={handleResult} styleImages={styleImages} />
      <StyleChangeSection generatedImg={generatedImg} face={face} style={style} />
    </>
  )
}

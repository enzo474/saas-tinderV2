export const LEVEL_THRESHOLDS = [
  { level: 0, name: 'Le Raté',        minXP: 0,    maxXP: 49   },
  { level: 1, name: 'Le Débutant',    minXP: 50,   maxXP: 149  },
  { level: 2, name: "L'Apprenti",     minXP: 150,  maxXP: 299  },
  { level: 3, name: 'Le Progressiste',minXP: 300,  maxXP: 599  },
  { level: 4, name: 'Le Confident',   minXP: 600,  maxXP: 999  },
  { level: 5, name: 'Le Séducteur',   minXP: 1000, maxXP: 1999 },
  { level: 6, name: "L'Alpha",        minXP: 2000, maxXP: Infinity },
]

export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].minXP) {
      return LEVEL_THRESHOLDS[i].level
    }
  }
  return 0
}

export function getLevelInfo(level: number) {
  return LEVEL_THRESHOLDS.find((l) => l.level === level) ?? LEVEL_THRESHOLDS[0]
}

export function getXPForNextLevel(totalXP: number, currentLevel: number): number {
  if (currentLevel >= 6) return 0
  const next = LEVEL_THRESHOLDS[currentLevel + 1]
  return next.minXP - totalXP
}

export function getLevelProgressPercent(totalXP: number, currentLevel: number): number {
  if (currentLevel >= 6) return 100
  const current = LEVEL_THRESHOLDS[currentLevel]
  const next = LEVEL_THRESHOLDS[currentLevel + 1]
  const range = next.minXP - current.minXP
  const progress = totalXP - current.minXP
  return Math.min(100, Math.round((progress / range) * 100))
}

export interface ConversationResult {
  finalRizz: number
  dateObtained: boolean
  difficultyLevel: number
  messageCount: number
}

export function calculateXPEarned(result: ConversationResult): number {
  const { finalRizz, dateObtained, difficultyLevel } = result

  let baseXP = 0
  if (finalRizz >= 80)      baseXP = 50
  else if (finalRizz >= 60) baseXP = 30
  else if (finalRizz >= 40) baseXP = 20
  else if (finalRizz >= 20) baseXP = 10
  else                      baseXP = 5

  const difficultyMultiplier = difficultyLevel // 1x, 2x, 3x
  const dateBonus = dateObtained ? 20 : 0

  return (baseXP * difficultyMultiplier) + dateBonus
}

export function calculateStarRating(rizz: number, dateObtained: boolean): number {
  if (dateObtained && rizz >= 80) return 5
  if (rizz >= 70)                 return 4
  if (rizz >= 50)                 return 3
  if (rizz >= 30)                 return 2
  return 1
}

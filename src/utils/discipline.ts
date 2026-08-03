import type { DisciplineId } from '@/types'

interface DisciplineTheme {
  accent: string
  tint: string
}

const THEMES: Record<DisciplineId, DisciplineTheme> = {
  transportation: { accent: 'var(--trb)', tint: 'var(--trb-tint)' },
  water: { accent: 'var(--wer)', tint: 'var(--wer-tint)' },
  buildings: { accent: 'var(--sba)', tint: 'var(--sba-tint)' },
  energy: { accent: 'var(--eps)', tint: 'var(--eps-tint)' },
}

export function themeFor(slug: DisciplineId): DisciplineTheme {
  return THEMES[slug]
}

export function themeVars(slug: DisciplineId) {
  const theme = themeFor(slug)
  return { '--accent': theme.accent, '--accent-tint': theme.tint }
}

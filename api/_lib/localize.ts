import type {
  CaseStudy,
  Highlight,
  SourceHighlight,
  Locale,
  Localized,
  Service,
  SourceCaseStudy,
  SourceService,
  SourceStat,
  Spec,
  Stat,
} from './types.js'

export function pick<T>(field: Localized<T>, locale: Locale): T {
  return field[locale] ?? field.en
}

function localizeSpec(spec: { label: Localized; value: Localized }, locale: Locale): Spec {
  return { label: pick(spec.label, locale), value: pick(spec.value, locale) }
}

function localizeCase(study: SourceCaseStudy, locale: Locale): CaseStudy {
  return {
    id: study.id,
    completed: study.completed,
    value: study.value,
    name: pick(study.name, locale),
    location: pick(study.location, locale),
    method: pick(study.method, locale),
    summary: pick(study.summary, locale),
  }
}

export function localizeService(service: SourceService, locale: Locale): Service {
  return {
    slug: service.slug,
    code: service.code,
    caseCount: service.caseCount,
    markets: service.markets,
    name: pick(service.name, locale),
    tagline: pick(service.tagline, locale),
    description: pick(service.description, locale),
    capabilities: pick(service.capabilities, locale),
    specs: service.specs.map((spec) => localizeSpec(spec, locale)),
    caseStudies: service.caseStudies.map((study) => localizeCase(study, locale)),
  }
}

export function localizeHighlight(highlight: SourceHighlight, locale: Locale): Highlight {
  return {
    id: highlight.id,
    slug: highlight.slug,
    market: highlight.market,
    location: pick(highlight.location, locale),
    headline: pick(highlight.headline, locale),
    blurb: pick(highlight.blurb, locale),
    linkLabel: pick(highlight.linkLabel, locale),
    ...(highlight.image ? { image: highlight.image } : {}),
    ...(highlight.imageAlt ? { imageAlt: pick(highlight.imageAlt, locale) } : {}),
    ...(highlight.caption ? { caption: pick(highlight.caption, locale) } : {}),
    ...(highlight.sourceUrl ? { sourceUrl: highlight.sourceUrl } : {}),
  }
}

export function localizeStat(stat: SourceStat, locale: Locale): Stat {
  return { value: stat.value, label: pick(stat.label, locale), note: pick(stat.note, locale) }
}

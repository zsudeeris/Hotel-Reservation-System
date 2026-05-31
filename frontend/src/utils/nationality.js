import { normalizeSearchText } from './searchUi.js'

function createOption(value, aliases = [], label = value) {
  return {
    label,
    value,
    aliases,
    normalizedValue: normalizeSearchText(value),
    normalizedLabel: normalizeSearchText(label),
    normalizedAliases: aliases.map(normalizeSearchText),
  }
}

export const NATIONALITY_OPTIONS = [
  createOption('Turkish', ['turk', 'türk', 'turkiye', 'türkiye', 'turkish']),
  createOption('Cypriot', ['kibris', 'kıbrıs', 'kibrisli', 'kıbrıslı']),
  createOption('British', ['ingiliz', 'ingiltere', 'birlesik krallik', 'birleşik krallık', 'uk', 'united kingdom']),
  createOption('German', ['alman', 'almanya', 'german']),
  createOption('French', ['fransiz', 'fransız', 'fransa', 'french']),
  createOption('Italian', ['italyan', 'italya', 'italian']),
  createOption('Spanish', ['ispanyol', 'ispanya', 'spanish']),
  createOption('Greek', ['yunan', 'yunanistan', 'greek']),
  createOption('American', ['amerikan', 'abd', 'usa', 'united states', 'amerika']),
  createOption('Canadian', ['kanada', 'kanadali', 'kanadalı', 'canada']),
  createOption('Dutch', ['hollandali', 'hollandalı', 'hollanda', 'netherlands']),
  createOption('Russian', ['rus', 'rusya', 'russian']),
  createOption('Ukrainian', ['ukraynali', 'ukraynalı', 'ukrayna', 'ukraine']),
  createOption('Polish', ['polonyali', 'polonyalı', 'polonya', 'poland']),
  createOption('Romanian', ['romanyali', 'romanyalı', 'romanya', 'romania']),
  createOption('Bulgarian', ['bulgar', 'bulgaristan', 'bulgaria']),
  createOption('Arabic', ['arap', 'arab', 'arabic']),
  createOption('Egyptian', ['misirli', 'mısırlı', 'misir', 'mısır', 'egypt']),
  createOption('Lebanese', ['lubnali', 'lübnanli', 'lübnanlı', 'lubnan', 'lebanon']),
  createOption('Iranian', ['irani', 'iranli', 'iranlı', 'iran']),
  createOption('Iraqi', ['irakli', 'ıraklı', 'irak', 'iraq']),
  createOption('Syrian', ['suriyeli', 'suriye', 'syria']),
  createOption('Jordanian', ['urdunlu', 'ürdünlü', 'urdun', 'ürdün', 'jordan']),
  createOption('Israeli', ['israil', 'israilli', 'israel']),
  createOption('Indian', ['hintli', 'hindistan', 'india']),
  createOption('Pakistani', ['pakistanli', 'pakistanlı', 'pakistan']),
  createOption('Chinese', ['cinli', 'çinli', 'cin', 'çin', 'china']),
  createOption('Japanese', ['japon', 'japonca', 'japan']),
  createOption('Korean', ['koreli', 'kore', 'korea']),
  createOption('Australian', ['avustralyali', 'avustralyalı', 'avustralya', 'australia']),
  createOption('Tunisian', ['tunuslu', 'tunus', 'tunisia']),
  createOption('Thai', ['taylandli', 'taylandlı', 'tayland', 'thailand']),
]

export function searchNationalityOptions(query, limit = 8) {
  const q = normalizeSearchText(query)
  if (!q) return []

  return NATIONALITY_OPTIONS
    .map(option => {
      const score =
        option.normalizedValue.startsWith(q) ? 0 :
        option.normalizedLabel.startsWith(q) ? 1 :
        option.normalizedAliases.some(alias => alias.startsWith(q)) ? 2 :
        option.normalizedValue.includes(q) ? 3 :
        option.normalizedLabel.includes(q) ? 4 :
        option.normalizedAliases.some(alias => alias.includes(q)) ? 5 :
        99
      return { ...option, score }
    })
    .filter(option => option.score < 99)
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function normalizeNationalityInput(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const normalized = normalizeSearchText(raw)
  const exact = NATIONALITY_OPTIONS.find(option =>
    option.normalizedValue === normalized ||
    option.normalizedLabel === normalized ||
    option.normalizedAliases.includes(normalized)
  )
  if (exact) return exact.value

  const matches = searchNationalityOptions(raw, 1)
  if (matches.length === 1 && normalized.length >= 4) return matches[0].value

  return raw
}

import Artist from '../models/Artist.js'

const defaultWikiBaseUrl = 'https://rapviet.fandom.com/vi/wiki/'

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

const uniqueStrings = (items = []) => {
  const seen = new Set()
  const values = []

  for (const item of items) {
    const value = trimString(item)

    if (!value) {
      continue
    }

    const key = value.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    values.push(value)
  }

  return values
}

const normalizeLookup = (value = '') =>
  trimString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const buildInitials = (value = '') =>
  trimString(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

const getSourceLabel = (url) => {
  try {
    const { hostname } = new URL(url)

    if (hostname.includes('rapviet.fandom.com')) {
      return 'Rapviet Wiki'
    }

    if (hostname.includes('wikipedia.org')) {
      return 'Wikipedia'
    }

    if (hostname.includes('fandom.com')) {
      return 'Fandom Wiki'
    }

    return hostname.replace(/^www\./, '')
  } catch {
    return 'Wiki'
  }
}

const buildWikiTarget = ({ name = '', sourceUrl = '' } = {}) => {
  const normalizedUrl = trimString(sourceUrl)
  const normalizedName = trimString(name)

  if (!normalizedUrl && !normalizedName) {
    throw new Error('Artist name or Wiki URL is required.')
  }

  const targetUrl = normalizedUrl || `${defaultWikiBaseUrl}${encodeURIComponent(normalizedName.replace(/\s+/g, '_'))}`
  const parsedUrl = new URL(targetUrl)
  const wikiIndex = parsedUrl.pathname.indexOf('/wiki/')

  if (wikiIndex === -1) {
    throw new Error('Wiki URL must contain /wiki/<page-title>.')
  }

  const prefix = parsedUrl.pathname.slice(0, wikiIndex)
  const rawTitle = parsedUrl.pathname.slice(wikiIndex + '/wiki/'.length)
  const title = decodeURIComponent(rawTitle).replace(/_/g, ' ').trim()
  const apiUrl = parsedUrl.hostname.includes('wikipedia.org')
    ? `${parsedUrl.origin}/w/api.php`
    : `${parsedUrl.origin}${prefix}/api.php`

  return {
    apiUrl,
    sourceUrl: `${parsedUrl.origin}${prefix}/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
    title,
  }
}

const fetchWikiPage = async ({ apiUrl, title }) => {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts|pageimages',
    explaintext: '1',
    redirects: '1',
    pithumbsize: '720',
    titles: title,
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`${apiUrl}?${params.toString()}`, {
    headers: {
      'User-Agent': 'TMusic/1.0 artist wiki importer',
    },
  })

  if (!response.ok) {
    throw new Error(`Wiki request failed with ${response.status}.`)
  }

  const payload = await response.json()
  const page = Object.values(payload?.query?.pages || {})[0]

  if (!page || page.missing) {
    throw new Error(`Wiki page "${title}" was not found.`)
  }

  if (!trimString(page.extract)) {
    const parsedText = await fetchParsedWikiText({ apiUrl, title })
    page.extract = parsedText.bodyText
    page.fullText = parsedText.fullText
  }

  return page
}

const decodeHtmlEntities = (value = '') =>
  String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const htmlToText = (html = '', { stripInfobox = true } = {}) => {
  let normalizedHtml = decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')

  if (stripInfobox) {
    normalizedHtml = normalizedHtml
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<table[\s\S]*?<\/table>/gi, ' ')
  }

  return normalizedHtml
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/section>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const fetchParsedWikiText = async ({ apiUrl, title }) => {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text|displaytitle',
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`${apiUrl}?${params.toString()}`, {
    headers: {
      'User-Agent': 'TMusic/1.0 artist wiki importer',
    },
  })

  if (!response.ok) {
    return { bodyText: '', fullText: '' }
  }

  const payload = await response.json()
  const html = payload?.parse?.text?.['*'] || ''

  return {
    bodyText: htmlToText(html),
    fullText: htmlToText(html, { stripInfobox: false }),
  }
}

const normalizeExtract = (value = '') =>
  trimString(value)
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')

const wikiInfoSectionHeaders = [
  'ten that',
  'rapname nickname',
  'nhom to chuc hang dia thuong hieu',
  'ban be dong minh hop tac',
  'doi thu ke thu beef voi',
  'd o b',
  'dob',
  'the loai',
]

const isWikiInfoSectionHeader = (line = '') => {
  const key = normalizeLookup(line)

  return wikiInfoSectionHeaders.some((header) => key === header || key.startsWith(`${header} `))
}

const getWikiInfoSectionValues = (extract = '', headingKey = '') => {
  const lines = normalizeExtract(extract)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const startIndex = lines.findIndex((line) => normalizeLookup(line) === headingKey)

  if (startIndex < 0) {
    return []
  }

  const values = []

  for (const line of lines.slice(startIndex + 1)) {
    if (isWikiInfoSectionHeader(line)) {
      break
    }

    values.push(
      ...line
        .split(/,|;|\s+\/\s+/)
        .map((item) => item.trim())
        .filter(Boolean),
    )
  }

  return uniqueStrings(values)
}

const buildBio = (extract = '') => {
  const normalizedExtract = normalizeExtract(extract)
  const firstParagraph = normalizedExtract
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .find(Boolean)

  if (!firstParagraph) {
    return ''
  }

  return firstParagraph.length > 760 ? `${firstParagraph.slice(0, 757).trim()}...` : firstParagraph
}

const extractRealName = (extract = '') => {
  const sectionRealName = getWikiInfoSectionValues(extract, 'ten that')[0]

  if (sectionRealName) {
    return sectionRealName
  }

  const normalizedExtract = normalizeExtract(extract)
  const directMatch = normalizedExtract.match(/t[eê]n\s+(?:th[aậ]t|[đd][aầ]y\s*[đd][uủ])\s*(?:l[aà]\s*)?([^,.\n]+)/i)

  if (directMatch?.[1]) {
    return trimString(directMatch[1])
  }

  const openingMatch = normalizedExtract.match(/^([^,(.\n]{4,80})\s*\([^)]*(?:sinh|ngh[eệ]\s*danh|th[uư][oờ]ng\s*[đd][uư][oợ]c)/i)

  return openingMatch?.[1] ? trimString(openingMatch[1]) : ''
}

const extractAliases = ({ extract = '', title = '', name = '', realName = '' } = {}) => {
  const aliases = [name, title, realName]
  aliases.push(...getWikiInfoSectionValues(extract, 'rapname nickname'))

  const aliasMatch = normalizeExtract(extract).match(/(?:ngh[eệ]\s*danh|bi[eế]t\s*[đd][eế]n\s*(?:v[oớ]i)?(?:\s+t[eê]n)?(?:\s+g[oọ]i)?|rapname)\s*(?:l[aà]\s*)?([^.\n]+)/i)

  if (aliasMatch?.[1]) {
    const aliasPhrase = aliasMatch[1]
      .replace(/c[oò]n\s+c[oó]\s+th[eể]\s+l[aà]/gi, ',')
      .split(/\s+l[aà]\s+m[oộ]t\b|\s+tr[uư][oớ]c\s+khi\b|\s+[đd][uư][oợ]c\s+bi[eế]t\b/i)[0]

    aliases.push(
      ...aliasPhrase
        .split(/,|;|\/|\s+ho[aặ]c\s+|\s+hay\s+|\s+v[aà]\s+/i)
        .map((item) => item.replace(/^l[aà]\s+/i, '').trim())
        .filter((item) => {
          const key = normalizeLookup(item)

          return item.length >= 2 && item.length <= 48 && !/[.!?]/.test(item) && key !== 'nickname'
        }),
    )
  }

  return uniqueStrings(aliases)
}

const buildStatsLabel = (extract = '') => {
  const firstSentence = normalizeExtract(extract).split(/[.!?]\s+/).find(Boolean) || ''
  const normalizedSentence = firstSentence.toLowerCase()
  const roles = []

  if (normalizedSentence.includes('rapper')) {
    roles.push('Rapper')
  }

  if (normalizedSentence.includes('ca sĩ') || normalizedSentence.includes('singer')) {
    roles.push('ca sĩ')
  }

  if (normalizedSentence.includes('sáng tác') || normalizedSentence.includes('songwriter')) {
    roles.push('singer-songwriter')
  }

  return uniqueStrings(roles).join(' / ') || 'Nghệ sĩ'
}

const buildCredits = ({ name, realName, extract }) => {
  const credits = [{ name, role: 'Main Artist' }]

  if (realName && normalizeLookup(realName) !== normalizeLookup(name)) {
    credits.push({ name: realName, role: 'Songwriter / Composer' })
  } else if (/s[aá]ng\s*t[aá]c|songwriter/i.test(extract)) {
    credits.push({ name, role: 'Songwriter / Composer' })
  }

  return credits
}

const buildArtistPayload = ({ name = '', sourceUrl = '', target, page }) => {
  const title = trimString(page?.title || target.title)
  const displayName = trimString(name) || title
  const extract = normalizeExtract(page?.extract || '')
  const fullText = normalizeExtract(page?.fullText || extract)
  const profileText = fullText || extract
  const realName = extractRealName(profileText) || extractRealName(extract)
  const aliases = extractAliases({ extract: profileText, title, name: displayName, realName })
  const imageUrl = trimString(page?.thumbnail?.source)

  return {
    name: displayName,
    meta: buildStatsLabel(extract),
    aliases,
    realName,
    bio: buildBio(extract),
    statsLabel: buildStatsLabel(extract),
    sourceLabel: getSourceLabel(sourceUrl || target.sourceUrl),
    sourceUrl: sourceUrl || target.sourceUrl,
    verified: true,
    credits: buildCredits({ name: displayName, realName, extract }),
    imageUrl,
    initials: buildInitials(displayName),
    artwork: '',
  }
}

const findExistingArtist = async ({ name, aliases = [], sourceUrl = '' }) => {
  const lookupValues = uniqueStrings([name, ...aliases])
  const orConditions = []

  if (sourceUrl) {
    orConditions.push({ sourceUrl })
  }

  for (const value of lookupValues) {
    orConditions.push({ name: value }, { aliases: value })
  }

  if (orConditions.length === 0) {
    return null
  }

  return Artist.findOne({ $or: orConditions }).collation({ locale: 'en', strength: 2 })
}

const getNextSortOrder = async () => {
  const latestArtist = await Artist.findOne().sort({ sortOrder: -1, createdAt: -1 }).select('sortOrder').lean()

  return Number.isFinite(Number(latestArtist?.sortOrder)) ? Number(latestArtist.sortOrder) + 1 : 0
}

export const importArtistWikiProfile = async ({ name = '', sourceUrl = '' } = {}) => {
  const target = buildWikiTarget({ name, sourceUrl })
  const page = await fetchWikiPage(target)
  const payload = buildArtistPayload({ name, sourceUrl, target, page })
  const existingArtist = await findExistingArtist(payload)

  if (existingArtist) {
    const previousSortOrder = Number.isFinite(Number(existingArtist.sortOrder)) ? existingArtist.sortOrder : 0

    existingArtist.set({
      ...payload,
      sortOrder: previousSortOrder,
    })
    await existingArtist.save()

    return {
      created: false,
      item: existingArtist,
      source: {
        title: page.title,
        url: payload.sourceUrl,
        label: payload.sourceLabel,
      },
    }
  }

  const createdArtist = await Artist.create({
    ...payload,
    sortOrder: await getNextSortOrder(),
  })

  return {
    created: true,
    item: createdArtist,
    source: {
      title: page.title,
      url: payload.sourceUrl,
      label: payload.sourceLabel,
    },
  }
}

import { useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Input,
  Tag,
  Typography,
  theme,
} from 'antd'
import {
  ArrowLeftOutlined,
  ClearOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { appPaths } from '../../../app/routes/paths.js'
import { panelStyle } from '../dashboard/adminDashboardTheme'
import { requestAdminJson } from '../adminAuthClient.js'

const { Paragraph, Text, Title } = Typography

const normalizeLookupToken = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const getFilenameStem = (filename = '') => filename.replace(/\.[^.]+$/, '')

const formatSlugWords = (value) =>
  String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const cleanupSongFilenameStem = (value) =>
  String(value || '')
    .trim()
    .replace(/^\d+\s*[-_. )]+/, '')
    .replace(/\s+/g, ' ')
    .trim()

const splitArtistAndTitleFromStem = (stem) => {
  const match = cleanupSongFilenameStem(stem).match(/^(.+?)\s+-\s+(.+)$/)

  if (!match) {
    return null
  }

  return {
    artist: match[1].trim(),
    title: match[2].trim(),
  }
}

const resolveSongIdentityFromFilename = (filename, defaultArtist = '') => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const parsedIdentity = splitArtistAndTitleFromStem(stem)

  if (parsedIdentity?.artist && parsedIdentity?.title) {
    return {
      artist: parsedIdentity.artist,
      title: parsedIdentity.title,
      errorMessage: '',
    }
  }

  const hyphenParts = stem
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean)

  if (hyphenParts.length >= 2) {
    const artist = formatSlugWords(hyphenParts[0])
    const titleParts = [...hyphenParts.slice(1)]

    if (titleParts.length > 1 && /^\d{3,}$/.test(titleParts[titleParts.length - 1])) {
      titleParts.pop()
    }

    const title = formatSlugWords(titleParts.join(' '))

    if (artist && title) {
      return {
        artist,
        title,
        errorMessage: '',
      }
    }
  }

  if (stem && defaultArtist.trim()) {
    return {
      artist: defaultArtist.trim(),
      title: formatSlugWords(stem),
      errorMessage: '',
    }
  }

  return {
    artist: '',
    title: stem,
    errorMessage:
      'Không tách được artist từ tên file. Dùng mẫu "Artist - Title" hoặc nhập default artist.',
  }
}

const resolvePodcastIdentityFromFilename = (filename, defaultShowTitle = '') => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const parsedIdentity = splitArtistAndTitleFromStem(stem)

  if (parsedIdentity?.artist && parsedIdentity?.title) {
    return {
      showTitle: parsedIdentity.artist,
      title: parsedIdentity.title,
      errorMessage: '',
    }
  }

  const hyphenParts = stem
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean)

  if (hyphenParts.length >= 2) {
    const showTitle = formatSlugWords(hyphenParts[0])
    const titleParts = [...hyphenParts.slice(1)]

    if (titleParts.length > 1 && /^\d{3,}$/.test(titleParts[titleParts.length - 1])) {
      titleParts.pop()
    }

    const title = formatSlugWords(titleParts.join(' '))

    if (showTitle && title) {
      return {
        showTitle,
        title,
        errorMessage: '',
      }
    }
  }

  if (stem && defaultShowTitle.trim()) {
    return {
      showTitle: defaultShowTitle.trim(),
      title: formatSlugWords(stem),
      errorMessage: '',
    }
  }

  return {
    showTitle: '',
    title: stem,
    errorMessage:
      'Không tách được show từ tên file. Dùng mẫu "Show - Episode" hoặc nhập default show.',
  }
}

const buildCoverLookupCandidates = (filename) => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const tokens = new Set()
  const fullToken = normalizeLookupToken(stem)

  if (fullToken) {
    tokens.add(fullToken)
  }

  const parsedIdentity = splitArtistAndTitleFromStem(stem)
  const titleToken = normalizeLookupToken(parsedIdentity?.title || '')

  if (titleToken) {
    tokens.add(titleToken)
  }

  return [...tokens]
}

const buildCoverLookup = (coverFiles) => {
  const lookup = new Map()

  for (const file of coverFiles) {
    for (const token of buildCoverLookupCandidates(file.name)) {
      const matches = lookup.get(token) || []
      matches.push(file)
      lookup.set(token, matches)
    }
  }

  return lookup
}

const getFileIdentity = (file) =>
  `${file.name}:${Number(file.lastModified) || 0}:${Number(file.size) || 0}`

const sortFilesByName = (files) =>
  [...files].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )

const findMatchedCoverByName = (audioFile, coverLookup, usedCoverIds) => {
  for (const token of buildCoverLookupCandidates(audioFile.name)) {
    const matches = coverLookup.get(token) || []

    if (matches.length === 1 && !usedCoverIds.has(getFileIdentity(matches[0]))) {
      return {
        file: matches[0],
        strategy: 'name',
      }
    }
  }

  return null
}

const assignCoverFilesToAudio = (audioFiles, coverFiles) => {
  const coverLookup = buildCoverLookup(coverFiles)
  const assignments = new Map()
  const usedCoverIds = new Set()

  for (const audioFile of audioFiles) {
    const namedMatch = findMatchedCoverByName(audioFile, coverLookup, usedCoverIds)

    if (!namedMatch) {
      continue
    }

    assignments.set(getFileIdentity(audioFile), namedMatch)
    usedCoverIds.add(getFileIdentity(namedMatch.file))
  }

  const remainingCovers = sortFilesByName(
    coverFiles.filter((file) => !usedCoverIds.has(getFileIdentity(file))),
  )

  for (const audioFile of audioFiles) {
    const audioId = getFileIdentity(audioFile)

    if (assignments.has(audioId)) {
      continue
    }

    const nextCover = remainingCovers.shift()

    if (!nextCover) {
      break
    }

    assignments.set(audioId, {
      file: nextCover,
      strategy: 'order',
    })
    usedCoverIds.add(getFileIdentity(nextCover))
  }

  return assignments
}

const parseSortOrder = (value) => {
  const parsed = Number.parseInt(String(value || '').trim(), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

const summarizePreviewRows = (rows) => ({
  total: rows.length,
  ready: rows.filter((row) => !row.errorMessage).length,
  withCover: rows.filter((row) => row.coverMatched).length,
  orderMatched: rows.filter((row) => row.coverMatchStrategy === 'order').length,
  missingCover: rows.filter((row) => !row.coverMatched).length,
  blocked: rows.filter((row) => Boolean(row.errorMessage)).length,
})

const importIssueStatuses = new Set(['skipped', 'error'])

const getImportIssues = (payload) =>
  (payload?.results || []).filter((item) => importIssueStatuses.has(item.status))

const getImportStatusLabel = (status) => {
  if (status === 'created') {
    return 'Tạo mới'
  }

  if (status === 'skipped') {
    return 'Bỏ qua'
  }

  return 'Lỗi'
}

const formatImportIssueText = (item) => {
  const title = item?.title || item?.audioFilename || `Dòng ${(Number(item?.index) || 0) + 1}`
  const owner = item?.artist || item?.showTitle
  const ownerText = owner ? ` - ${owner}` : ''
  const reason = item?.message || 'Server chưa trả ghi chú chi tiết.'

  return `${getImportStatusLabel(item?.status)}: ${title}${ownerText}. Lý do: ${reason}`
}

const formatImportNotice = (payload) => {
  const summary = payload?.summary || {}
  const total = summary.totalAudioFiles || 0
  const created = summary.createdCount || 0
  const skipped = summary.skippedCount || 0
  const errors = summary.errorCount || 0
  const issues = getImportIssues(payload)
  const issuePreview = issues.slice(0, 2).map(formatImportIssueText)
  const hiddenIssueCount = Math.max(issues.length - issuePreview.length, 0)
  const issueText = issuePreview.length
    ? ` Lý do: ${issuePreview.join(' | ')}${
        hiddenIssueCount > 0 ? ` (+${hiddenIssueCount} dòng khác trong kết quả import)` : ''
      }`
    : ''

  return `Đã xử lý ${total} file. Tạo mới ${created}, bỏ qua ${skipped}, lỗi ${errors}.${issueText}`
}

function FileSelectionCard(props) {
  const {
    actionLabel,
    description,
    files,
    icon,
    inputRef,
    inputAccept,
    title,
    onClear,
    onPick,
    onSelect,
  } = props
  const {
    token: { colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  return (
    <section
      style={{
        border: `1px solid ${colorBorderSecondary}`,
        borderRadius: 22,
        padding: 18,
        background: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <Text
            style={{
              color: colorTextSecondary,
              textTransform: 'uppercase',
              fontSize: 11,
              letterSpacing: '0.14em',
            }}
          >
            {title}
          </Text>
          <Title level={4} style={{ margin: '10px 0 6px' }}>
            {files.length} tệp
          </Title>
          <Text style={{ color: colorTextSecondary }}>{description}</Text>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            fontSize: 18,
          }}
        >
          {icon}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={inputAccept}
        multiple
        hidden
        onChange={onSelect}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        <Button type="primary" icon={<CloudUploadOutlined />} onClick={onPick} style={{ borderRadius: 12 }}>
          {actionLabel}
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={onClear}
          disabled={files.length === 0}
          style={{ borderRadius: 12 }}
        >
          Xóa danh sách
        </Button>
      </div>

      {files.length > 0 ? (
        <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
          {files.slice(0, 6).map((file) => (
            <div
              key={`${title}-${file.name}-${file.lastModified}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                borderRadius: 16,
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.035)',
              }}
            >
              <Text ellipsis style={{ maxWidth: '78%' }}>
                {file.name}
              </Text>
              <Tag style={{ margin: 0, borderRadius: 999 }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </Tag>
            </div>
          ))}
          {files.length > 6 ? (
            <Text style={{ color: colorTextSecondary }}>+ {files.length - 6} tệp khác</Text>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function AdminSongImportPageView({ resourceType = 'songs' }) {
  const isPodcastImport = resourceType === 'podcasts'
  const [audioFiles, setAudioFiles] = useState([])
  const [coverFiles, setCoverFiles] = useState([])
  const [defaultArtist, setDefaultArtist] = useState('')
  const [mood, setMood] = useState('Chill')
  const [host, setHost] = useState('')
  const [category, setCategory] = useState('Podcast')
  const [license, setLicense] = useState('')
  const [sourcePage, setSourcePage] = useState('')
  const [sortOrderStart, setSortOrderStart] = useState('0')
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [importResult, setImportResult] = useState(null)
  const audioInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  const coverAssignments = assignCoverFilesToAudio(audioFiles, coverFiles)
  const previewRows = audioFiles.map((file, index) => {
    const identity = isPodcastImport
      ? resolvePodcastIdentityFromFilename(file.name, defaultArtist)
      : resolveSongIdentityFromFilename(file.name, defaultArtist)
    const coverAssignment = coverAssignments.get(getFileIdentity(file)) || null
    const matchedCover = coverAssignment?.file || null
    const ownerName = isPodcastImport ? identity.showTitle : identity.artist

    return {
      key: `${file.name}-${file.lastModified}-${index}`,
      sortOrder: parseSortOrder(sortOrderStart) + index,
      title: identity.title || cleanupSongFilenameStem(getFilenameStem(file.name)),
      artist: isPodcastImport ? '' : identity.artist || '',
      showTitle: isPodcastImport ? identity.showTitle || '' : '',
      ownerName: ownerName || '',
      errorMessage: identity.errorMessage,
      audioFilename: file.name,
      coverFilename: matchedCover?.name || '',
      coverMatched: Boolean(matchedCover),
      coverMatchStrategy: coverAssignment?.strategy || '',
    }
  })
  const previewSummary = summarizePreviewRows(previewRows)
  const importIssues = importResult ? getImportIssues(importResult) : []
  const ownerLabel = isPodcastImport ? 'Default show' : 'Default artist'
  const ownerFallbackText = isPodcastImport ? 'Chưa xác định show' : 'Chưa xác định artist'
  const duplicateLabel = isPodcastImport
    ? 'Bỏ qua podcast trùng title + show đã tồn tại'
    : 'Bỏ qua bài trùng title + artist đã tồn tại'

  const resetInput = (ref) => {
    if (ref.current) {
      ref.current.value = ''
    }
  }

  const handleSelectFiles = (setter, ref) => (event) => {
    const nextFiles = Array.from(event.target.files || [])
    setter(nextFiles)
    setError('')
    setNotice('')
    setImportResult(null)
    resetInput(ref)
  }

  const handleClearFiles = (setter, ref) => () => {
    setter([])
    setImportResult(null)
    resetInput(ref)
  }

  const handleSubmit = async () => {
    if (audioFiles.length === 0) {
      setError('Hãy chọn ít nhất một file audio để import.')
      return
    }

    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      const formData = new FormData()

      for (const file of audioFiles) {
        formData.append('audioFiles', file)
      }

      for (const file of coverFiles) {
        formData.append('coverFiles', file)
      }

      if (isPodcastImport) {
        formData.append('defaultShowTitle', defaultArtist)
        formData.append('host', host)
        formData.append('category', category)
        formData.append('license', license)
        formData.append('sourcePage', sourcePage)
      } else {
        formData.append('defaultArtist', defaultArtist)
        formData.append('mood', mood)
      }

      formData.append('sortOrderStart', sortOrderStart)
      formData.append('skipDuplicates', String(skipDuplicates))

      const payload = await requestAdminJson(
        isPodcastImport ? '/api/admin/podcasts/import' : '/api/admin/songs/import',
        {
          method: 'POST',
          body: formData,
        },
      )

      setImportResult(payload)
      setNotice(formatImportNotice(payload))
    } catch (submitError) {
      if (submitError?.status === 401 || submitError?.status === 403) {
        window.location.assign(appPaths.admin.login)
        return
      }

      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        ...panelStyle({
          colorBgContainer,
          colorBorderSecondary,
          borderRadiusLG,
        }),
        padding: 26,
        borderRadius: 32,
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.028))',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Text style={{ color: colorTextSecondary, textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 11 }}>
            Admin Import
          </Text>
          <Title level={2} style={{ margin: '10px 0 8px' }}>
            {isPodcastImport ? 'Import podcast hàng loạt' : 'Import nhạc hàng loạt'}
          </Title>
          <Paragraph style={{ color: colorTextSecondary, marginBottom: 0, maxWidth: 880 }}>
            Chọn nhiều file audio và nhiều file ảnh. Hệ thống ưu tiên ghép cover theo tên file, nếu không thấy
            sẽ fallback theo thứ tự file cover. {isPodcastImport ? 'Tên podcast' : 'Tên nhạc'} có thể dùng mẫu{' '}
            <code>{isPodcastImport ? 'Show - Episode.mp3' : 'Artist - Title.mp3'}</code> hoặc slug như{' '}
            <code>{isPodcastImport ? 'show-episode-12345.mp3' : 'artist-title-12345.mp3'}</code>.
          </Paragraph>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.location.assign(isPodcastImport ? appPaths.admin.podcasts : appPaths.admin.songs)}
            style={{ borderRadius: 12 }}
          >
            {isPodcastImport ? 'Về podcast' : 'Về bài hát'}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setAudioFiles([])
              setCoverFiles([])
              setImportResult(null)
              setError('')
              setNotice('')
              resetInput(audioInputRef)
              resetInput(coverInputRef)
            }}
            style={{ borderRadius: 12 }}
          >
            Làm mới form
          </Button>
        </div>
      </div>

      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 18 }} />
      ) : null}

      {notice ? (
        <Alert type="success" message={notice} showIcon style={{ marginBottom: 16, borderRadius: 18 }} />
      ) : null}

      <div style={{ display: 'grid', gap: 20 }}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div style={{ display: 'grid', gap: 16 }}>
            <FileSelectionCard
              actionLabel="Chọn file audio"
              description="Hỗ trợ nhiều file mp3, wav, flac, m4a, aac, ogg."
              files={audioFiles}
              icon={<PlayCircleOutlined />}
              inputAccept="audio/*"
              inputRef={audioInputRef}
              title="Audio"
              onClear={handleClearFiles(setAudioFiles, audioInputRef)}
              onPick={() => audioInputRef.current?.click()}
              onSelect={handleSelectFiles(setAudioFiles, audioInputRef)}
            />

            <FileSelectionCard
              actionLabel="Chọn file cover"
              description="Ảnh sẽ được match theo tên file gốc. Không có cover vẫn import được."
              files={coverFiles}
              icon={<FileImageOutlined />}
              inputAccept="image/*"
              inputRef={coverInputRef}
              title="Cover"
              onClear={handleClearFiles(setCoverFiles, coverInputRef)}
              onPick={() => coverInputRef.current?.click()}
              onSelect={handleSelectFiles(setCoverFiles, coverInputRef)}
            />
          </div>

          <section
            style={{
              border: `1px solid ${colorBorderSecondary}`,
              borderRadius: 22,
              padding: 18,
              background: 'rgba(255, 255, 255, 0.03)',
              display: 'grid',
              gap: 14,
              alignContent: 'start',
            }}
          >
            <div>
              <Text style={{ color: colorTextSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.14em' }}>
                Cài đặt import
              </Text>
              <Title level={4} style={{ margin: '10px 0 6px' }}>
                Metadata mặc định
              </Title>
              <Text style={{ color: colorTextSecondary }}>
                Server sẽ suy ra {isPodcastImport ? 'show/title' : 'artist/title'} từ tên file nếu có mẫu{' '}
                <code>{isPodcastImport ? 'Show - Episode' : 'Artist - Title'}</code>.
              </Text>
            </div>

            <label style={{ display: 'grid', gap: 8 }}>
              <Text strong>{ownerLabel}</Text>
              <Input
                value={defaultArtist}
                onChange={(event) => {
                  setDefaultArtist(event.target.value)
                  setImportResult(null)
                }}
                placeholder={isPodcastImport ? 'Dùng khi file audio chỉ có tên tập' : 'Dùng khi file audio chỉ có tên bài hát'}
                style={{ borderRadius: 14 }}
              />
            </label>

            {isPodcastImport ? (
              <>
                <label style={{ display: 'grid', gap: 8 }}>
                  <Text strong>Host</Text>
                  <Input
                    value={host}
                    onChange={(event) => {
                      setHost(event.target.value)
                      setImportResult(null)
                    }}
                    placeholder="Người dẫn / đơn vị sản xuất"
                    style={{ borderRadius: 14 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <Text strong>Chủ đề</Text>
                  <Input
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value)
                      setImportResult(null)
                    }}
                    placeholder="Podcast"
                    style={{ borderRadius: 14 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <Text strong>Giấy phép</Text>
                  <Input
                    value={license}
                    onChange={(event) => {
                      setLicense(event.target.value)
                      setImportResult(null)
                    }}
                    placeholder="CC BY 2.5, Public domain..."
                    style={{ borderRadius: 14 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <Text strong>Trang nguồn</Text>
                  <Input
                    value={sourcePage}
                    onChange={(event) => {
                      setSourcePage(event.target.value)
                      setImportResult(null)
                    }}
                    placeholder="https://..."
                    style={{ borderRadius: 14 }}
                  />
                </label>
              </>
            ) : (
              <label style={{ display: 'grid', gap: 8 }}>
                <Text strong>Mood</Text>
                <Input
                  value={mood}
                  onChange={(event) => {
                    setMood(event.target.value)
                    setImportResult(null)
                  }}
                  placeholder="Chill"
                  style={{ borderRadius: 14 }}
                />
              </label>
            )}

            <label style={{ display: 'grid', gap: 8 }}>
              <Text strong>Sort order bắt đầu</Text>
              <Input
                value={sortOrderStart}
                onChange={(event) => {
                  setSortOrderStart(event.target.value)
                  setImportResult(null)
                }}
                inputMode="numeric"
                placeholder="0"
                style={{ borderRadius: 14 }}
              />
            </label>

            <Checkbox
              checked={skipDuplicates}
              onChange={(event) => {
                setSkipDuplicates(event.target.checked)
                setImportResult(null)
              }}
            >
              {duplicateLabel}
            </Checkbox>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Tag color="processing" style={{ borderRadius: 999 }}>
                {previewSummary.total} audio
              </Tag>
              <Tag color="blue" style={{ borderRadius: 999 }}>
                {previewSummary.ready} sẵn sàng
              </Tag>
              <Tag color="success" style={{ borderRadius: 999 }}>
                {previewSummary.withCover} có cover
              </Tag>
              <Tag color="purple" style={{ borderRadius: 999 }}>
                {previewSummary.orderMatched} cover theo thứ tự
              </Tag>
              <Tag color="warning" style={{ borderRadius: 999 }}>
                {previewSummary.missingCover} không cover
              </Tag>
              <Tag color={previewSummary.blocked > 0 ? 'error' : 'success'} style={{ borderRadius: 999 }}>
                {previewSummary.blocked} cần xử lý
              </Tag>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CloudUploadOutlined />}
              loading={submitting}
              disabled={audioFiles.length === 0}
              onClick={() => void handleSubmit()}
              style={{ borderRadius: 14, height: 46 }}
            >
              Bắt đầu import
            </Button>
          </section>
        </div>

        <section
          style={{
            border: `1px solid ${colorBorderSecondary}`,
            borderRadius: 22,
            padding: 18,
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Preview import
              </Title>
              <Text style={{ color: colorTextSecondary }}>
                Xem nhanh title, {isPodcastImport ? 'show' : 'artist'}, cover match và các file đang thiếu thông tin.
              </Text>
            </div>
            <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
              {previewRows.length} dòng
            </Tag>
          </div>

          {previewRows.length === 0 ? (
            <Empty description="Chưa có file audio nào được chọn" />
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {previewRows.slice(0, 24).map((row) => (
                <article
                  key={row.key}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    background: row.errorMessage
                      ? 'rgba(255, 107, 87, 0.08)'
                      : 'rgba(255, 255, 255, 0.035)',
                    border: `1px solid ${
                      row.errorMessage ? 'rgba(255, 107, 87, 0.22)' : colorBorderSecondary
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {row.title || row.audioFilename}
                      </Title>
                      <Text style={{ color: colorTextSecondary }}>
                        {row.ownerName || ownerFallbackText}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Tag style={{ borderRadius: 999, margin: 0 }}>Sort {row.sortOrder}</Tag>
                      <Tag color={row.coverMatched ? 'success' : 'default'} style={{ borderRadius: 999, margin: 0 }}>
                        {row.coverMatched
                          ? row.coverMatchStrategy === 'order'
                            ? 'Cover theo thứ tự'
                            : 'Cover theo tên'
                          : 'Không cover'}
                      </Tag>
                      <Tag color={row.errorMessage ? 'error' : 'processing'} style={{ borderRadius: 999, margin: 0 }}>
                        {row.errorMessage ? 'Cần xử lý' : 'Sẵn sàng'}
                      </Tag>
                    </div>
                  </div>
                  <Text style={{ display: 'block', marginTop: 10, color: colorTextSecondary }}>
                    Audio: {row.audioFilename}
                  </Text>
                  <Text style={{ display: 'block', marginTop: 4, color: colorTextSecondary }}>
                    Cover:{' '}
                    {row.coverFilename ||
                      (row.coverMatchStrategy === 'order'
                        ? 'Được gán theo thứ tự file'
                        : 'Không tìm thấy cover phù hợp')}
                  </Text>
                  {row.errorMessage ? (
                    <Alert
                      type="warning"
                      message={row.errorMessage}
                      showIcon
                      style={{ marginTop: 12, borderRadius: 14 }}
                    />
                  ) : null}
                </article>
              ))}
              {previewRows.length > 24 ? (
                <Text style={{ color: colorTextSecondary }}>
                  Đang hiển thị 24 dòng đầu tiên. Tổng cộng {previewRows.length} dòng sẽ được import.
                </Text>
              ) : null}
            </div>
          )}
        </section>

        {importResult ? (
          <section
            style={{
              border: `1px solid ${colorBorderSecondary}`,
              borderRadius: 22,
              padding: 18,
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Kết quả import
                </Title>
                <Text style={{ color: colorTextSecondary }}>
                  Báo cáo từng file sau khi server upload lên Cloudinary và tạo bản ghi {isPodcastImport ? 'Podcast' : 'Song'}.
                </Text>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Tag color="success" style={{ borderRadius: 999, margin: 0 }}>
                  Tạo mới {importResult.summary?.createdCount || 0}
                </Tag>
                <Tag color="processing" style={{ borderRadius: 999, margin: 0 }}>
                  Cover theo thứ tự {importResult.summary?.orderMatchedCoverCount || 0}
                </Tag>
                <Tag color="warning" style={{ borderRadius: 999, margin: 0 }}>
                  Bỏ qua {importResult.summary?.skippedCount || 0}
                </Tag>
                <Tag color="error" style={{ borderRadius: 999, margin: 0 }}>
                  Lỗi {importResult.summary?.errorCount || 0}
                </Tag>
              </div>
            </div>

            {importIssues.length > 0 ? (
              <Alert
                type={(importResult.summary?.errorCount || 0) > 0 ? 'warning' : 'info'}
                message="Có file chưa được tạo mới"
                description={
                  <div style={{ display: 'grid', gap: 6 }}>
                    {importIssues.slice(0, 6).map((item) => (
                      <Text
                        key={`issue-${item.index}-${item.audioFilename}`}
                        style={{ display: 'block' }}
                      >
                        {formatImportIssueText(item)}
                      </Text>
                    ))}
                    {importIssues.length > 6 ? (
                      <Text style={{ display: 'block', color: colorTextSecondary }}>
                        Còn {importIssues.length - 6} dòng khác trong danh sách kết quả.
                      </Text>
                    ) : null}
                  </div>
                }
                showIcon
                style={{ marginBottom: 16, borderRadius: 14 }}
              />
            ) : null}

            <div style={{ display: 'grid', gap: 12 }}>
              {(importResult.results || []).slice(0, 40).map((item) => (
                <article
                  key={`${item.index}-${item.audioFilename}`}
                  style={{
                    borderRadius: 18,
                    padding: 14,
                    background:
                      item.status === 'skipped'
                        ? 'rgba(250, 173, 20, 0.08)'
                        : item.status === 'error'
                          ? 'rgba(255, 107, 87, 0.08)'
                          : 'rgba(255, 255, 255, 0.035)',
                    border: `1px solid ${
                      item.status === 'skipped'
                        ? 'rgba(250, 173, 20, 0.26)'
                        : item.status === 'error'
                          ? 'rgba(255, 107, 87, 0.24)'
                          : colorBorderSecondary
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {item.title || item.audioFilename}
                      </Title>
                      <Text style={{ color: colorTextSecondary }}>
                        {item.artist || item.showTitle || (isPodcastImport ? 'Không có show' : 'Không có artist')}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Tag
                        color={
                          item.status === 'created'
                            ? 'success'
                            : item.status === 'skipped'
                              ? 'warning'
                              : 'error'
                        }
                        style={{ borderRadius: 999, margin: 0 }}
                      >
                        {getImportStatusLabel(item.status)}
                      </Tag>
                      <Tag color={item.coverMatched ? 'processing' : 'default'} style={{ borderRadius: 999, margin: 0 }}>
                        {item.coverMatched
                          ? item.coverMatchStrategy === 'order'
                            ? 'Cover theo thứ tự'
                            : 'Cover theo tên'
                          : 'Không cover'}
                      </Tag>
                    </div>
                  </div>
                  <Text style={{ display: 'block', marginTop: 10, color: colorTextSecondary }}>
                    Audio: {item.audioFilename}
                  </Text>
                  <Text style={{ display: 'block', marginTop: 4, color: colorTextSecondary }}>
                    Cover:{' '}
                    {item.coverFilename ||
                      (item.coverMatchStrategy === 'order' ? 'Gán theo thứ tự file' : 'Không có')}
                  </Text>
                  <Text style={{ display: 'block', marginTop: 8 }}>
                    <Text strong>{item.status === 'created' ? 'Ghi chú: ' : 'Lý do: '}</Text>
                    {item.message || 'Không có ghi chú.'}
                  </Text>
                </article>
              ))}
              {(importResult.results || []).length > 40 ? (
                <Text style={{ color: colorTextSecondary }}>
                  Đang hiển thị 40 kết quả đầu tiên. Tổng cộng {(importResult.results || []).length} dòng.
                </Text>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default AdminSongImportPageView

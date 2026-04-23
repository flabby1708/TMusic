import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Input,
  Layout,
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
import { requestAdminJson } from '../adminAuthClient.js'
import AdminDashboardHeader from '../dashboard/AdminDashboardHeader.jsx'
import AdminDashboardLoadingState from '../dashboard/AdminDashboardLoadingState.jsx'
import { panelStyle, shellStyles } from '../dashboard/adminDashboardTheme'
import { useAdminSession } from '../useAdminSession.js'

const { Content } = Layout
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
      'Khong tach duoc artist tu ten file. Dung mau "Artist - Title" hoac nhap default artist.',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Text style={{ color: colorTextSecondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.14em' }}>
            {title}
          </Text>
          <Title level={4} style={{ margin: '10px 0 6px' }}>
            {files.length} tep
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
          Xoa danh sach
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
            <Text style={{ color: colorTextSecondary }}>+ {files.length - 6} tep khac</Text>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function AdminSongImportPageView() {
  const { user, loading: sessionLoading, isAuthenticated, logout } = useAdminSession()
  const [audioFiles, setAudioFiles] = useState([])
  const [coverFiles, setCoverFiles] = useState([])
  const [defaultArtist, setDefaultArtist] = useState('')
  const [mood, setMood] = useState('Chill')
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

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      window.location.replace(appPaths.admin.login)
    }
  }, [isAuthenticated, sessionLoading])

  const coverAssignments = assignCoverFilesToAudio(audioFiles, coverFiles)
  const previewRows = audioFiles.map((file, index) => {
    const identity = resolveSongIdentityFromFilename(file.name, defaultArtist)
    const coverAssignment = coverAssignments.get(getFileIdentity(file)) || null
    const matchedCover = coverAssignment?.file || null

    return {
      key: `${file.name}-${file.lastModified}-${index}`,
      sortOrder: parseSortOrder(sortOrderStart) + index,
      title: identity.title || cleanupSongFilenameStem(getFilenameStem(file.name)),
      artist: identity.artist || '',
      errorMessage: identity.errorMessage,
      audioFilename: file.name,
      coverFilename: matchedCover?.name || '',
      coverMatched: Boolean(matchedCover),
      coverMatchStrategy: coverAssignment?.strategy || '',
    }
  })
  const previewSummary = summarizePreviewRows(previewRows)

  const resetInput = (ref) => {
    if (ref.current) {
      ref.current.value = ''
    }
  }

  const handleHeaderMenuClick = ({ key }) => {
    if (key === 'home') {
      window.location.assign(appPaths.home)
      return
    }

    if (key === 'logout') {
      logout()
      window.location.assign(appPaths.admin.login)
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
      setError('Hay chon it nhat mot file audio de import.')
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

      formData.append('defaultArtist', defaultArtist)
      formData.append('mood', mood)
      formData.append('sortOrderStart', sortOrderStart)
      formData.append('skipDuplicates', String(skipDuplicates))

      const payload = await requestAdminJson('/api/admin/songs/import', {
        method: 'POST',
        body: formData,
      })

      setImportResult(payload)
      setNotice(
        `Da xu ly ${payload?.summary?.totalAudioFiles || 0} file. Tao moi ${payload?.summary?.createdCount || 0}, bo qua ${payload?.summary?.skippedCount || 0}, loi ${payload?.summary?.errorCount || 0}.`,
      )
    } catch (submitError) {
      if (submitError?.status === 401 || submitError?.status === 403) {
        logout()
        window.location.assign(appPaths.admin.login)
        return
      }

      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionLoading) {
    return <AdminDashboardLoadingState />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout style={shellStyles}>
      <AdminDashboardHeader user={user} onMenuClick={handleHeaderMenuClick} />

      <Layout style={{ background: 'transparent' }}>
        <Layout style={{ padding: '0 24px 24px', background: 'transparent' }}>
          <div
            style={{
              ...panelStyle({
                colorBgContainer,
                colorBorderSecondary,
                borderRadiusLG,
              }),
              marginTop: 20,
              padding: 24,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015))',
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
                  Import nhac hang loat
                </Title>
                <Paragraph style={{ color: colorTextSecondary, marginBottom: 0, maxWidth: 880 }}>
                  Chon nhieu file audio va nhieu file anh. He thong uu tien ghep cover theo ten file, neu
                  khong thay se fallback theo thu tu file cover. Ten nhac co the dung mau
                  <code>Artist - Title.mp3</code> hoac slug nhu <code>artist-title-12345.mp3</code>.
                  Neu file nhac chi co ten bai, hay nhap <code>default artist</code>.
                </Paragraph>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.location.assign(appPaths.admin.root)}
                  style={{ borderRadius: 12 }}
                >
                  Ve dashboard
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
                  Lam moi form
                </Button>
              </div>
            </div>

            {error ? (
              <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 18 }} />
            ) : null}

            {notice ? (
              <Alert type="success" message={notice} showIcon style={{ marginBottom: 16, borderRadius: 18 }} />
            ) : null}

            <Content style={{ display: 'grid', gap: 20 }}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <div style={{ display: 'grid', gap: 16 }}>
                  <FileSelectionCard
                    actionLabel="Chon file audio"
                    description="Ho tro nhieu file mp3, wav, flac, m4a, aac, ogg."
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
                    actionLabel="Chon file cover"
                    description="Anh se duoc match theo ten file goc. Khong co cover van import duoc."
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
                      Cai dat import
                    </Text>
                    <Title level={4} style={{ margin: '10px 0 6px' }}>
                      Metadata mac dinh
                    </Title>
                    <Text style={{ color: colorTextSecondary }}>
                      Server se suy ra artist/title tu ten file neu co mau <code>Artist - Title</code> hoac
                      slug <code>artist-title-12345</code>.
                    </Text>
                  </div>

                  <label style={{ display: 'grid', gap: 8 }}>
                    <Text strong>Default artist</Text>
                    <Input
                      value={defaultArtist}
                      onChange={(event) => {
                        setDefaultArtist(event.target.value)
                        setImportResult(null)
                      }}
                      placeholder="Dung khi file audio chi co ten bai hat"
                      style={{ borderRadius: 14 }}
                    />
                  </label>

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

                  <label style={{ display: 'grid', gap: 8 }}>
                    <Text strong>Sort order bat dau</Text>
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
                    Bo qua bai trung title + artist da ton tai
                  </Checkbox>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Tag color="processing" style={{ borderRadius: 999 }}>
                      {previewSummary.total} audio
                    </Tag>
                    <Tag color="blue" style={{ borderRadius: 999 }}>
                      {previewSummary.ready} san sang
                    </Tag>
                    <Tag color="success" style={{ borderRadius: 999 }}>
                      {previewSummary.withCover} co cover
                    </Tag>
                    <Tag color="purple" style={{ borderRadius: 999 }}>
                      {previewSummary.orderMatched} cover theo thu tu
                    </Tag>
                    <Tag color="warning" style={{ borderRadius: 999 }}>
                      {previewSummary.missingCover} khong cover
                    </Tag>
                    <Tag color={previewSummary.blocked > 0 ? 'error' : 'success'} style={{ borderRadius: 999 }}>
                      {previewSummary.blocked} can xu ly
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
                    Bat dau import
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
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      Preview import
                    </Title>
                    <Text style={{ color: colorTextSecondary }}>
                      Xem nhanh title, artist, cover match va cac file dang thieu thong tin.
                    </Text>
                  </div>
                  <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
                    {previewRows.length} dong
                  </Tag>
                </div>

                {previewRows.length === 0 ? (
                  <Empty description="Chua co file audio nao duoc chon" />
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <Title level={5} style={{ margin: 0 }}>
                              {row.title || row.audioFilename}
                            </Title>
                            <Text style={{ color: colorTextSecondary }}>
                              {row.artist || 'Chua xac dinh artist'}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <Tag style={{ borderRadius: 999, margin: 0 }}>Sort {row.sortOrder}</Tag>
                            <Tag color={row.coverMatched ? 'success' : 'default'} style={{ borderRadius: 999, margin: 0 }}>
                              {row.coverMatched
                                ? row.coverMatchStrategy === 'order'
                                  ? 'Cover theo thu tu'
                                  : 'Cover theo ten'
                                : 'Khong cover'}
                            </Tag>
                            <Tag color={row.errorMessage ? 'error' : 'processing'} style={{ borderRadius: 999, margin: 0 }}>
                              {row.errorMessage ? 'Can xu ly' : 'San sang'}
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
                              ? 'Duoc gan theo thu tu file'
                              : 'Khong tim thay cover phu hop')}
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
                        Dang hien 24 dong dau tien. Tong cong {previewRows.length} dong se duoc import.
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Ket qua import
                      </Title>
                      <Text style={{ color: colorTextSecondary }}>
                        Bao cao tung file sau khi server upload len Cloudinary va tao ban ghi `Song`.
                      </Text>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Tag color="success" style={{ borderRadius: 999, margin: 0 }}>
                        Tao moi {importResult.summary?.createdCount || 0}
                      </Tag>
                      <Tag color="processing" style={{ borderRadius: 999, margin: 0 }}>
                        Cover theo thu tu {importResult.summary?.orderMatchedCoverCount || 0}
                      </Tag>
                      <Tag color="warning" style={{ borderRadius: 999, margin: 0 }}>
                        Bo qua {importResult.summary?.skippedCount || 0}
                      </Tag>
                      <Tag color="error" style={{ borderRadius: 999, margin: 0 }}>
                        Loi {importResult.summary?.errorCount || 0}
                      </Tag>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    {(importResult.results || []).slice(0, 40).map((item) => (
                      <article
                        key={`${item.index}-${item.audioFilename}`}
                        style={{
                          borderRadius: 18,
                          padding: 14,
                          background: 'rgba(255, 255, 255, 0.035)',
                          border: `1px solid ${colorBorderSecondary}`,
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div>
                            <Title level={5} style={{ margin: 0 }}>
                              {item.title || item.audioFilename}
                            </Title>
                            <Text style={{ color: colorTextSecondary }}>{item.artist || 'Khong co artist'}</Text>
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
                              {item.status}
                            </Tag>
                            <Tag color={item.coverMatched ? 'processing' : 'default'} style={{ borderRadius: 999, margin: 0 }}>
                              {item.coverMatched
                                ? item.coverMatchStrategy === 'order'
                                  ? 'Cover theo thu tu'
                                  : 'Cover theo ten'
                                : 'Khong cover'}
                            </Tag>
                          </div>
                        </div>
                        <Text style={{ display: 'block', marginTop: 10, color: colorTextSecondary }}>
                          Audio: {item.audioFilename}
                        </Text>
                        <Text style={{ display: 'block', marginTop: 4, color: colorTextSecondary }}>
                          Cover:{' '}
                          {item.coverFilename ||
                            (item.coverMatchStrategy === 'order' ? 'Gan theo thu tu file' : 'Khong co')}
                        </Text>
                        <Text style={{ display: 'block', marginTop: 8 }}>
                          {item.message || 'Khong co ghi chu.'}
                        </Text>
                      </article>
                    ))}
                    {(importResult.results || []).length > 40 ? (
                      <Text style={{ color: colorTextSecondary }}>
                        Dang hien 40 ket qua dau tien. Tong cong {(importResult.results || []).length} dong.
                      </Text>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </Content>
          </div>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default AdminSongImportPageView

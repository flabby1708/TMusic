import { useEffect, useState } from 'react'
import { clearAdminSession, requestAdminJson } from './adminAuthClient.js'
import { uploadAdminAsset } from './adminUploadClient.js'
import {
  buildEmptyFormValues,
  resourceDefinitions,
  toFormValues,
} from './adminConfig.js'

const isAdminSessionError = (error) => error?.status === 401 || error?.status === 403

const redirectToAdminLogin = () => {
  clearAdminSession()
  window.location.assign('/admin/login')
}

const normalizeResourceKey = (resource) =>
  resourceDefinitions[resource] ? resource : 'songs'

const formatDurationFromSeconds = (value) => {
  const safeValue = Number.isFinite(Number(value)) && Number(value) > 0 ? Math.floor(Number(value)) : 0

  if (safeValue <= 0) {
    return ''
  }

  const hours = Math.floor(safeValue / 3600)
  const minutes = Math.floor((safeValue % 3600) / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
  }

  return `${minutes}:${seconds}`
}

const isFileTypeAccepted = (assetType, file) => {
  if (!file?.type) {
    return true
  }

  if (assetType === 'audio') {
    return file.type.startsWith('audio/')
  }

  if (assetType === 'video') {
    return file.type.startsWith('video/')
  }

  return file.type.startsWith('image/')
}

export function useAdminDashboard({ enabled = true, initialResource = 'songs' } = {}) {
  const [activeResource, setActiveResource] = useState(() => normalizeResourceKey(initialResource))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formValues, setFormValues] = useState(() => buildEmptyFormValues(normalizeResourceKey(initialResource)))

  const currentResource = resourceDefinitions[activeResource]

  useEffect(() => {
    setActiveResource(normalizeResourceKey(initialResource))
  }, [initialResource])

  useEffect(() => {
    setFormValues(buildEmptyFormValues(activeResource))
    setEditingId('')
    setNotice('')
    setUploadingField('')
  }, [activeResource])

  useEffect(() => {
    let cancelled = false

    if (!enabled) {
      setLoading(false)
      setItems([])
      setError('')
      return undefined
    }

    const loadItems = async () => {
      setLoading(true)
      setError('')

      try {
        const payload = await requestAdminJson(`/api/admin/${activeResource}`)

        if (!cancelled) {
          setItems(payload.items || [])
        }
      } catch (loadError) {
        if (cancelled) {
          return
        }

        if (isAdminSessionError(loadError)) {
          redirectToAdminLogin()
          return
        }

        setItems([])
        setError(loadError.message)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadItems()

    return () => {
      cancelled = true
    }
  }, [activeResource, enabled])

  const handleChange = (fieldName, value) => {
    setFormValues((current) => {
      const nextValues = {
        ...current,
        [fieldName]: value,
      }

      if ((activeResource === 'songs' || activeResource === 'podcasts') && fieldName === 'coverUrl') {
        nextValues.coverPublicId = ''
      }

      if (activeResource === 'songs' && fieldName === 'audioUrl') {
        nextValues.masterAudioPublicId = ''
        nextValues.masterAudioDurationSeconds = ''
        nextValues.masterAudioFormat = ''
        nextValues.masterAudioResourceType = ''
        nextValues.masterAudioOriginalFilename = ''
        nextValues.masterAudioSizeBytes = ''
      }

      if (activeResource === 'podcasts' && fieldName === 'audioUrl') {
        nextValues.audioPublicId = ''
        nextValues.audioDurationSeconds = ''
        nextValues.audioFormat = ''
        nextValues.audioResourceType = ''
        nextValues.audioOriginalFilename = ''
        nextValues.audioSizeBytes = ''
      }

      return nextValues
    })
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setFormValues(toFormValues(activeResource, item))
    setNotice('')
    setError('')
  }

  const handleReset = () => {
    setEditingId('')
    setFormValues(buildEmptyFormValues(activeResource))
    setNotice('')
    setError('')
  }

  const handleArtistWikiImport = async () => {
    if (activeResource !== 'artists') {
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = await requestAdminJson('/api/admin/artists/import-wiki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          sourceUrl: formValues.sourceUrl,
        }),
      })

      await reloadActiveResource()

      if (payload.item) {
        setEditingId(payload.item._id)
        setFormValues(toFormValues('artists', payload.item))
      }

      setNotice(payload.created ? 'Da import artist tu Wiki.' : 'Da cap nhat artist tu Wiki.')
    } catch (importError) {
      if (isAdminSessionError(importError)) {
        redirectToAdminLogin()
        return
      }

      setError(importError.message)
    } finally {
      setSaving(false)
    }
  }

  const reloadActiveResource = async () => {
    if (!enabled) {
      return
    }

    try {
      const payload = await requestAdminJson(`/api/admin/${activeResource}`)
      setItems(payload.items || [])
    } catch (reloadError) {
      if (isAdminSessionError(reloadError)) {
        redirectToAdminLogin()
        return
      }

      throw reloadError
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const endpoint = editingId
        ? `/api/admin/${activeResource}/${editingId}`
        : `/api/admin/${activeResource}`
      const method = editingId ? 'PUT' : 'POST'

      await requestAdminJson(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      })

      await reloadActiveResource()
      handleReset()
      setNotice(editingId ? 'Da cap nhat thanh cong.' : 'Da tao moi thanh cong.')
    } catch (submitError) {
      if (isAdminSessionError(submitError)) {
        redirectToAdminLogin()
        return
      }

      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Xóa "${item[currentResource.titleField]}"?`)

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await requestAdminJson(`/api/admin/${activeResource}/${item._id}`, {
        method: 'DELETE',
      })

      await reloadActiveResource()

      if (editingId === item._id) {
        handleReset()
      }

      setNotice('Da xoa thanh cong.')
    } catch (deleteError) {
      if (isAdminSessionError(deleteError)) {
        redirectToAdminLogin()
        return
      }

      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAssetUpload = async (field, file) => {
    if (!file) {
      throw new Error('Chưa chọn tệp upload.')
    }

    const assetType = field.uploadAssetType || 'image'

    if (!isFileTypeAccepted(assetType, file)) {
      const typeError = new Error(
        assetType === 'audio'
          ? 'Vui lòng chọn đúng tệp âm thanh.'
          : assetType === 'video'
            ? 'Vui lòng chọn đúng tệp video.'
            : 'Vui lòng chọn đúng tệp hình ảnh.',
      )
      setError(typeError.message)
      throw typeError
    }

    setUploadingField(field.name)
    setError('')
    setNotice('')

    try {
      const uploadedAsset = await uploadAdminAsset({
        file,
        resource: activeResource,
        assetType,
      })

      setFormValues((current) => {
        const nextValues = {
          ...current,
          [field.name]: uploadedAsset.secureUrl,
        }

        if (activeResource === 'songs' || activeResource === 'podcasts') {
          if (field.name === 'coverUrl') {
            nextValues.coverPublicId = uploadedAsset.publicId || ''
          }
        }

        if (activeResource === 'songs') {
          if (field.name === 'audioUrl') {
            const formattedDuration = formatDurationFromSeconds(uploadedAsset.durationSeconds)

            nextValues.masterAudioPublicId = uploadedAsset.publicId || ''
            nextValues.masterAudioDurationSeconds =
              uploadedAsset.durationSeconds > 0 ? String(uploadedAsset.durationSeconds) : ''
            nextValues.masterAudioFormat = uploadedAsset.format || ''
            nextValues.masterAudioResourceType = uploadedAsset.resourceType || 'video'
            nextValues.masterAudioOriginalFilename = uploadedAsset.originalFilename || ''
            nextValues.masterAudioSizeBytes = String(uploadedAsset.sizeBytes || 0)

            if (formattedDuration) {
              nextValues.duration = formattedDuration
            }
          }

          if (field.name === 'videoUrl') {
            nextValues.musicVideoPublicId = uploadedAsset.publicId || ''
            nextValues.musicVideoFormat = uploadedAsset.format || ''
            nextValues.musicVideoResourceType = uploadedAsset.resourceType || 'video'
            nextValues.musicVideoOriginalFilename = uploadedAsset.originalFilename || ''
            nextValues.musicVideoSizeBytes = String(uploadedAsset.sizeBytes || 0)
          }
        }

        if (activeResource === 'podcasts' && field.name === 'audioUrl') {
          const formattedDuration = formatDurationFromSeconds(uploadedAsset.durationSeconds)

          nextValues.audioPublicId = uploadedAsset.publicId || ''
          nextValues.audioDurationSeconds =
            uploadedAsset.durationSeconds > 0 ? String(uploadedAsset.durationSeconds) : ''
          nextValues.audioFormat = uploadedAsset.format || ''
          nextValues.audioResourceType = uploadedAsset.resourceType || 'video'
          nextValues.audioOriginalFilename = uploadedAsset.originalFilename || ''
          nextValues.audioSizeBytes = String(uploadedAsset.sizeBytes || 0)

          if (formattedDuration) {
            nextValues.duration = formattedDuration
          }
        }

        return nextValues
      })

      setNotice(
        assetType === 'audio'
          ? 'Tải file âm thanh lên Cloudinary thành công.'
          : assetType === 'video'
            ? 'Tải music video lên Cloudinary thành công.'
            : 'Tải ảnh lên Cloudinary thành công.',
      )

      return uploadedAsset
    } catch (uploadError) {
      if (isAdminSessionError(uploadError)) {
        redirectToAdminLogin()
      } else {
        setError(uploadError.message)
      }

      throw uploadError
    } finally {
      setUploadingField('')
    }
  }

  return {
    activeResource,
    currentResource,
    editingId,
    error,
    formValues,
    handleAssetUpload,
    handleChange,
    handleDelete,
    handleEdit,
    handleArtistWikiImport,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    setActiveResource,
    uploadingField,
  }
}

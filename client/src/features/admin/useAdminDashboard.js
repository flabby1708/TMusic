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

  return file.type.startsWith('image/')
}

export function useAdminDashboard({ enabled = true } = {}) {
  const [activeResource, setActiveResource] = useState('songs')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formValues, setFormValues] = useState(buildEmptyFormValues('songs'))

  const currentResource = resourceDefinitions[activeResource]

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

      if (activeResource === 'songs' && fieldName === 'coverUrl') {
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
    const confirmed = window.confirm(`Xoa "${item[currentResource.titleField]}"?`)

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
      throw new Error('Chua chon tep upload.')
    }

    const assetType = field.uploadAssetType || 'image'

    if (!isFileTypeAccepted(assetType, file)) {
      const typeError = new Error(
        assetType === 'audio'
          ? 'Vui long chon dung tep am thanh.'
          : 'Vui long chon dung tep hinh anh.',
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

        if (activeResource === 'songs') {
          if (field.name === 'coverUrl') {
            nextValues.coverPublicId = uploadedAsset.publicId || ''
          }

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
        }

        return nextValues
      })

      setNotice(
        assetType === 'audio'
          ? 'Tai file nhac len Cloudinary thanh cong.'
          : 'Tai anh len Cloudinary thanh cong.',
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

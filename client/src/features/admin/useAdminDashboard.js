import { useEffect, useState } from 'react'
import { clearAdminSession, requestAdminJson } from './adminAuthClient.js'
import { uploadAdminImage } from './adminUploadClient.js'
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
    setFormValues((current) => ({
      ...current,
      [fieldName]: value,
    }))
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
    } catch (error) {
      if (isAdminSessionError(error)) {
        redirectToAdminLogin()
        return
      }

      throw error
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
      setNotice(editingId ? 'Đã cập nhật thành công.' : 'Đã tạo mới thành công.')
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

      setNotice('Đã xóa thành công.')
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

  const handleImageUpload = async (fieldName, file) => {
    if (!file) {
      throw new Error('Chưa chọn tệp ảnh.')
    }

    if (file.type && !file.type.startsWith('image/')) {
      const typeError = new Error('Vui lòng chọn đúng tệp hình ảnh.')
      setError(typeError.message)
      throw typeError
    }

    setUploadingField(fieldName)
    setError('')
    setNotice('')

    try {
      const uploadedImage = await uploadAdminImage({
        file,
        resource: activeResource,
      })

      setFormValues((current) => ({
        ...current,
        [fieldName]: uploadedImage.secureUrl,
      }))
      setNotice('Tải ảnh lên Cloudinary thành công.')

      return uploadedImage
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
    handleChange,
    handleDelete,
    handleEdit,
    handleImageUpload,
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

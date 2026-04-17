import { useEffect, useState } from 'react'
import { requestJson } from '../../shared/api.js'
import {
  buildEmptyFormValues,
  resourceDefinitions,
  toFormValues,
} from './adminConfig.js'

export function useAdminDashboard() {
  const [activeResource, setActiveResource] = useState('songs')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formValues, setFormValues] = useState(buildEmptyFormValues('songs'))

  const currentResource = resourceDefinitions[activeResource]

  useEffect(() => {
    setFormValues(buildEmptyFormValues(activeResource))
    setEditingId('')
    setNotice('')
  }, [activeResource])

  useEffect(() => {
    let cancelled = false

    const loadItems = async () => {
      setLoading(true)
      setError('')

      try {
        const payload = await requestJson(`/api/admin/${activeResource}`)

        if (!cancelled) {
          setItems(payload.items || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setItems([])
          setError(loadError.message)
        }
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
  }, [activeResource])

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
    const payload = await requestJson(`/api/admin/${activeResource}`)
    setItems(payload.items || [])
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

      await requestJson(endpoint, {
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
      await requestJson(`/api/admin/${activeResource}/${item._id}`, {
        method: 'DELETE',
      })

      await reloadActiveResource()

      if (editingId === item._id) {
        handleReset()
      }

      setNotice('Đã xóa thành công.')
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
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
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    setActiveResource,
  }
}

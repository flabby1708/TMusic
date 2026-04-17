export const resourceDefinitions = {
  songs: {
    label: 'Bài hát',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên bài hát', type: 'text', required: true },
      { name: 'artist', label: 'Nghệ sĩ', type: 'text', required: true },
      { name: 'duration', label: 'Thời lượng', type: 'text' },
      { name: 'mood', label: 'Chủ đề', type: 'text' },
      { name: 'coverUrl', label: 'Link ảnh bìa', type: 'url' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  artists: {
    label: 'Nghệ sĩ',
    titleField: 'name',
    subtitleField: 'meta',
    imageField: 'imageUrl',
    fields: [
      { name: 'name', label: 'Tên nghệ sĩ', type: 'text', required: true },
      { name: 'meta', label: 'Loại', type: 'text' },
      { name: 'initials', label: 'Viết tắt', type: 'text' },
      { name: 'imageUrl', label: 'Link ảnh', type: 'url' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  albums: {
    label: 'Album',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên album', type: 'text', required: true },
      { name: 'artist', label: 'Nghệ sĩ', type: 'text', required: true },
      { name: 'coverUrl', label: 'Link ảnh bìa', type: 'url' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  radios: {
    label: 'Radio',
    titleField: 'title',
    subtitleField: 'description',
    imageField: 'imageUrl',
    fields: [
      { name: 'title', label: 'Tên radio', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', required: true },
      { name: 'imageUrl', label: 'Link ảnh', type: 'url' },
      { name: 'tone', label: 'Gradient nền', type: 'textarea' },
      { name: 'initials', label: 'Avatar fallback', type: 'text', helper: 'Nhập cách nhau bởi dấu phẩy' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  charts: {
    label: 'Bảng xếp hạng',
    titleField: 'title',
    subtitleField: 'subtitle',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên chart', type: 'text', required: true },
      { name: 'subtitle', label: 'Mô tả', type: 'textarea', required: true },
      { name: 'coverUrl', label: 'Link ảnh', type: 'url' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
}

export const resourceKeys = Object.keys(resourceDefinitions)

export const buildEmptyFormValues = (resource) => {
  const fields = resourceDefinitions[resource].fields

  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.name === 'sortOrder' ? '0' : ''
    return accumulator
  }, {})
}

export const toFormValues = (resource, item) => {
  const values = buildEmptyFormValues(resource)

  for (const field of resourceDefinitions[resource].fields) {
    const rawValue = item[field.name]

    if (field.name === 'initials' && Array.isArray(rawValue)) {
      values[field.name] = rawValue.join(', ')
      continue
    }

    values[field.name] = rawValue == null ? values[field.name] : String(rawValue)
  }

  return values
}

export const artistLoginPageContent = {
  mode: 'login',
  title: 'Cổng nghệ sĩ',
  subtitle:
    'Đăng nhập vào bảng điều khiển nghệ sĩ để theo dõi trạng thái duyệt, bản phát hành và lượt tải lên.',
  submitLabel: 'Đăng nhập nghệ sĩ',
  successMessage: 'Đăng nhập nghệ sĩ thành công. Đang chuyển vào bảng điều khiển...',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'artist@tmusic.vn',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Mật khẩu',
      type: 'password',
      placeholder: 'Nhập mật khẩu nghệ sĩ',
      autoComplete: 'current-password',
    },
  ],
  alternatePrompt: 'Chưa có tài khoản nghệ sĩ?',
  alternateAction: 'Đăng ký cổng nghệ sĩ',
  alternateHref: '/artist/register',
}

export const artistRegisterPageContent = {
  mode: 'register',
  title: 'Đăng ký nghệ sĩ',
  subtitle:
    'Tách riêng luồng khởi tạo tài khoản nghệ sĩ khỏi người dùng nghe nhạc để dễ duyệt, dễ mở rộng và dễ quản trị.',
  submitLabel: 'Tạo tài khoản nghệ sĩ',
  successMessage: 'Hồ sơ nghệ sĩ đã được tạo. Đang chuyển vào bảng điều khiển...',
  fields: [
    {
      name: 'displayName',
      label: 'Tên liên hệ',
      type: 'text',
      placeholder: 'Nguyễn Văn A',
      autoComplete: 'name',
    },
    {
      name: 'stageName',
      label: 'Nghệ danh',
      type: 'text',
      placeholder: 'Aster, Mono, ...',
      autoComplete: 'nickname',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'artist@tmusic.vn',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Mật khẩu',
      type: 'password',
      placeholder: 'Tối thiểu 8 ký tự',
      autoComplete: 'new-password',
    },
    {
      name: 'bio',
      label: 'Mô tả ngắn',
      type: 'textarea',
      placeholder: 'Indie pop, biểu diễn live, producer, ...',
      required: false,
    },
  ],
  alternatePrompt: 'Đã có tài khoản nghệ sĩ?',
  alternateAction: 'Đăng nhập cổng nghệ sĩ',
  alternateHref: '/artist/login',
}

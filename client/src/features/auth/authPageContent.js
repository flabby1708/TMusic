export const loginPageContent = {
  mode: 'login',
  title: 'Chào mừng bạn quay trở lại',
  subtitle:
    'Đăng nhập để tiếp tục nghe nhạc, quản lý playlist và đồng bộ trải nghiệm của bạn.',
  submitLabel: 'Đăng nhập',
  successMessage: 'Đăng nhập thành công. Đang chuyển về trang chủ...',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'name@domain.com',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Mật khẩu',
      type: 'password',
      placeholder: 'Nhập mật khẩu của bạn',
      autoComplete: 'current-password',
    },
  ],
  alternatePrompt: 'Bạn chưa có tài khoản?',
  alternateAction: 'Đăng ký',
  alternateHref: '/register',
}

export const registerPageContent = {
  mode: 'register',
  title: 'Tạo tài khoản TMusic',
  subtitle:
    'Đăng ký để lưu nhạc yêu thích, tạo playlist cá nhân và theo dõi nghệ sĩ bạn quan tâm.',
  submitLabel: 'Tạo tài khoản',
  successMessage: 'Đăng ký thành công. Đang chuyển về trang chủ...',
  fields: [
    {
      name: 'displayName',
      label: 'Tên hiển thị',
      type: 'text',
      placeholder: 'Tên của bạn',
      autoComplete: 'name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'name@domain.com',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Mật khẩu',
      type: 'password',
      placeholder: 'Tối thiểu 8 ký tự',
      autoComplete: 'new-password',
    },
  ],
  alternatePrompt: 'Đã có tài khoản?',
  alternateAction: 'Đăng nhập',
  alternateHref: '/login',
}

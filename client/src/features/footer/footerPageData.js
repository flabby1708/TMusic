const sharedContact = 'Nếu bạn cần thêm thông tin, hãy liên hệ đội ngũ TMusic qua email support@tmusic.local. Đây là kênh mô phỏng cho phiên bản phát triển nội bộ.'

const makePage = ({ title, eyebrow = 'TMusic', intro, sections }) => ({ title, eyebrow, intro, sections })

export const footerPageData = {
  about: makePage({
    title: 'Giới thiệu TMusic',
    intro:
      'TMusic là không gian nghe nhạc hiện đại giúp bạn tìm đúng bài hát cho từng khoảnh khắc, từ làm việc, thư giãn đến khám phá nghệ sĩ mới.',
    sections: [
      {
        heading: 'Âm nhạc cho mọi khoảnh khắc',
        body:
          'TMusic tập trung vào trải nghiệm nghe nhanh, thư viện nội dung rõ ràng và giao diện tối dịu mắt. Người nghe có thể khám phá bài hát, album, radio và bảng xếp hạng ngay trên một trang.',
      },
      {
        heading: 'Dành cho người dùng và nghệ sĩ',
        body:
          'Bên cạnh trải nghiệm nghe nhạc, TMusic có khu vực quản trị và cổng nghệ sĩ để hỗ trợ đăng tải, quản lý nội dung và cập nhật tài nguyên âm thanh.',
      },
      {
        heading: 'Hỗ trợ khách hàng',
        body: sharedContact,
      },
    ],
  }),
  jobs: makePage({
    title: 'Việc làm tại TMusic',
    intro:
      'TMusic đang được phát triển như một sản phẩm âm nhạc số với nhiều mảng: giao diện nghe nhạc, quản trị nội dung, artist portal và hệ thống phân phối audio.',
    sections: [
      { heading: 'Cơ hội hiện tại', body: 'Ở phiên bản này, trang tuyển dụng đóng vai trò giới thiệu. Các vị trí thực tế sẽ được cập nhật khi dự án mở rộng đội ngũ.' },
      { heading: 'Nhóm kỹ năng quan tâm', list: ['Frontend React và trải nghiệm người dùng', 'Backend Node.js, API và dữ liệu âm nhạc', 'Thiết kế sản phẩm, nội dung và vận hành cộng đồng'] },
    ],
  }),
  news: makePage({
    title: 'Tin tức TMusic',
    intro:
      'Theo dõi các cập nhật mới nhất về tính năng, trải nghiệm nghe nhạc và những thay đổi trong hệ thống TMusic.',
    sections: [
      { heading: 'Cập nhật sản phẩm', body: 'TMusic đang bổ sung trang hỗ trợ, footer điều hướng, quản lý hiển thị bài hát và các công cụ dành cho admin.' },
      { heading: 'For the Record', body: 'Các ghi chú phát triển sẽ tập trung vào trải nghiệm người nghe, quyền kiểm soát nội dung và chất lượng quản trị bài hát.' },
    ],
  }),
  'for-artists': makePage({
    title: 'Dành cho nghệ sĩ',
    intro:
      'Khu vực nghệ sĩ giúp creator quản lý hồ sơ, theo dõi nội dung và chuẩn bị bản phát hành cho người nghe TMusic.',
    sections: [
      { heading: 'Quản lý nội dung', body: 'Nghệ sĩ có thể dùng artist portal để đăng nhập, theo dõi dashboard và chuẩn bị dữ liệu bài hát trong các bước phát triển tiếp theo.' },
      { heading: 'Phát hành có kiểm soát', body: 'TMusic hỗ trợ trạng thái bản nhạc để admin quyết định bài nào được hiển thị công khai.' },
    ],
  }),
  developers: makePage({
    title: 'Nhà phát triển',
    intro:
      'Trang này dành cho các nhà phát triển muốn hiểu cách TMusic tổ chức client, server và API nội bộ.',
    sections: [
      { heading: 'Công nghệ chính', list: ['React và Vite cho client', 'Node.js và Express cho server', 'MongoDB/Mongoose cho dữ liệu', 'Cloudinary cho tài nguyên ảnh và audio'] },
      { heading: 'API nội bộ', body: 'API hiện phục vụ nội dung trang chủ, xác thực, quản trị bài hát và upload tài nguyên. Tài liệu public API sẽ được hoàn thiện khi sản phẩm ổn định.' },
    ],
  }),
  advertising: makePage({
    title: 'Quảng cáo trên TMusic',
    intro:
      'TMusic có thể hỗ trợ các vị trí quảng bá nội dung âm nhạc, chiến dịch nghệ sĩ và thông điệp thương hiệu trong tương lai.',
    sections: [
      { heading: 'Định hướng quảng cáo', body: 'Mục tiêu là giữ quảng cáo phù hợp ngữ cảnh nghe nhạc, không làm gián đoạn trải nghiệm chính của người dùng.' },
      { heading: 'Liên hệ hợp tác', body: sharedContact },
    ],
  }),
  investors: makePage({
    title: 'Nhà đầu tư',
    intro: 'Trang nhà đầu tư tổng hợp định hướng sản phẩm và các khu vực tăng trưởng của TMusic.',
    sections: [
      { heading: 'Trọng tâm sản phẩm', list: ['Trải nghiệm nghe nhạc cá nhân hóa', 'Cổng quản trị nội dung', 'Công cụ dành cho nghệ sĩ', 'Hạ tầng audio và media asset'] },
      { heading: 'Thông tin liên hệ', body: sharedContact },
    ],
  }),
  vendors: makePage({
    title: 'Nhà cung cấp',
    intro: 'TMusic làm việc với các nhà cung cấp hạ tầng, media, thiết kế và vận hành khi sản phẩm mở rộng.',
    sections: [
      { heading: 'Nguyên tắc hợp tác', body: 'Ưu tiên nhà cung cấp minh bạch, bảo vệ dữ liệu người dùng và hỗ trợ vận hành ổn định.' },
      { heading: 'Đề xuất hợp tác', body: sharedContact },
    ],
  }),
  'mobile-app': makePage({
    title: 'Ứng dụng di động miễn phí',
    intro: 'TMusic hướng tới trải nghiệm nghe nhạc liền mạch trên máy tính, điện thoại và trình duyệt.',
    sections: [
      { heading: 'Trải nghiệm hiện tại', body: 'Phiên bản hiện tại chạy trên web responsive. Người dùng có thể mở bằng trình duyệt di động và dùng giao diện tối ưu theo kích thước màn hình.' },
      { heading: 'Ứng dụng cài đặt', body: 'Luồng cài đặt ứng dụng/PWA sẽ được mở rộng để người dùng truy cập nhanh hơn từ màn hình chính.' },
    ],
  }),
  countries: makePage({
    title: 'TMusic theo quốc gia',
    intro: 'Nội dung phổ biến có thể thay đổi theo thị trường, ngôn ngữ và thói quen nghe nhạc.',
    sections: [
      { heading: 'Bản địa hóa', body: 'TMusic ưu tiên tiếng Việt trong giao diện hiện tại và có thể mở rộng nội dung theo quốc gia khi dữ liệu người nghe đủ lớn.' },
      { heading: 'Bảng xếp hạng', body: 'Các bảng xếp hạng nổi bật sẽ là nơi thể hiện xu hướng nghe nhạc theo từng khu vực.' },
    ],
  }),
  'import-music': makePage({
    title: 'Thêm nhạc vào TMusic',
    intro: 'Admin có thể thêm bài hát, upload audio/cover và quyết định bài nào được hiển thị công khai.',
    sections: [
      { heading: 'Upload bài hát', body: 'Khu vực admin hỗ trợ tạo bài mới, sửa metadata, upload file nhạc, ảnh bìa và import hàng loạt.' },
      { heading: 'Kiểm soát hiển thị', body: 'Trạng thái hiển thị cho phép ẩn bài nháp khỏi trang nghe nhạc cho đến khi nội dung sẵn sàng.' },
    ],
  }),
  'plan-individual': makePage({
    title: 'Gói cá nhân',
    eyebrow: 'Gói dịch vụ',
    intro: 'Gói cá nhân dành cho người nghe muốn trải nghiệm TMusic đầy đủ hơn trong tương lai.',
    sections: [
      { heading: 'Lợi ích dự kiến', list: ['Nghe nhạc ít gián đoạn hơn', 'Ưu tiên chất lượng âm thanh', 'Lưu nội dung yêu thích và đồng bộ thư viện'] },
      { heading: 'Trạng thái', body: 'Gói trả phí đang ở dạng mô phỏng trong phiên bản hiện tại.' },
    ],
  }),
  'plan-student': makePage({
    title: 'Gói sinh viên',
    eyebrow: 'Gói dịch vụ',
    intro: 'Gói sinh viên hướng tới trải nghiệm nghe nhạc tiết kiệm cho người học.',
    sections: [
      { heading: 'Định hướng', body: 'Khi tính năng thanh toán hoàn thiện, TMusic có thể bổ sung cơ chế xác minh sinh viên và ưu đãi riêng.' },
      { heading: 'Hiện tại', body: 'Trang này cung cấp thông tin giới thiệu, chưa kích hoạt đăng ký thanh toán thực tế.' },
    ],
  }),
  'plan-free': makePage({
    title: 'TMusic miễn phí',
    eyebrow: 'Gói dịch vụ',
    intro: 'Gói miễn phí giúp người dùng khám phá thư viện bài hát, nghệ sĩ, album, radio và bảng xếp hạng.',
    sections: [
      { heading: 'Bạn có thể làm gì?', list: ['Khám phá nội dung nổi bật', 'Tìm bài hát và nghệ sĩ', 'Đăng ký tài khoản để mở rộng trải nghiệm nghe'] },
      { heading: 'Nâng cấp sau', body: 'Các quyền lợi premium có thể được bổ sung khi hệ thống gói dịch vụ hoàn thiện.' },
    ],
  }),
  legal: makePage({
    title: 'Pháp lý',
    eyebrow: 'Chính sách',
    intro: 'Trang pháp lý tóm tắt các nguyên tắc sử dụng TMusic trong phiên bản hiện tại.',
    sections: [
      { heading: 'Điều khoản sử dụng', body: 'Người dùng cần sử dụng TMusic đúng mục đích nghe nhạc cá nhân, không khai thác trái phép nội dung hoặc can thiệp vào hệ thống.' },
      { heading: 'Nội dung và bản quyền', body: 'Các bài hát, ảnh bìa và metadata cần được đăng tải bởi người có quyền hoặc trong phạm vi thử nghiệm hợp lệ.' },
    ],
  }),
  'safety-privacy': makePage({
    title: 'Trung tâm an toàn và quyền riêng tư',
    eyebrow: 'An toàn',
    intro: 'TMusic ưu tiên bảo vệ tài khoản, phiên đăng nhập và dữ liệu sử dụng cơ bản của người dùng.',
    sections: [
      { heading: 'Bảo vệ tài khoản', body: 'Không chia sẻ mật khẩu, đăng xuất khỏi thiết bị lạ và báo ngay nếu phát hiện hoạt động bất thường.' },
      { heading: 'Kiểm soát dữ liệu', body: 'Các phần như đăng nhập, hồ sơ và thư viện sẽ tiếp tục được cải thiện để minh bạch hơn với người dùng.' },
    ],
  }),
  privacy: makePage({
    title: 'Chính sách quyền riêng tư',
    eyebrow: 'Quyền riêng tư',
    intro: 'Trang này mô tả cách TMusic dự kiến xử lý dữ liệu người dùng trong phạm vi sản phẩm hiện tại.',
    sections: [
      { heading: 'Dữ liệu tài khoản', body: 'TMusic có thể lưu email, tên hiển thị, trạng thái đăng nhập và thông tin cần thiết để vận hành tài khoản.' },
      { heading: 'Dữ liệu sử dụng', body: 'Dữ liệu nghe nhạc và tương tác có thể được dùng để cải thiện trải nghiệm, phát hiện lỗi và đề xuất nội dung phù hợp hơn.' },
    ],
  }),
  cookies: makePage({
    title: 'Cookie',
    eyebrow: 'Quyền riêng tư',
    intro: 'Cookie và lưu trữ trình duyệt giúp TMusic duy trì phiên đăng nhập và ghi nhớ một số lựa chọn giao diện.',
    sections: [
      { heading: 'Mục đích sử dụng', list: ['Duy trì phiên đăng nhập', 'Ghi nhớ trạng thái phát hoặc lựa chọn người dùng', 'Cải thiện hiệu năng và phát hiện lỗi'] },
      { heading: 'Quản lý cookie', body: 'Bạn có thể xóa cookie trong cài đặt trình duyệt, nhưng một số tính năng đăng nhập có thể cần thiết lập lại.' },
    ],
  }),
  'ads-info': makePage({
    title: 'Giới thiệu quảng cáo',
    eyebrow: 'Quảng cáo',
    intro: 'Trang này mô tả định hướng quảng cáo minh bạch, phù hợp ngữ cảnh và không làm gián đoạn trải nghiệm nghe nhạc.',
    sections: [
      { heading: 'Nguyên tắc', body: 'Quảng cáo nên liên quan đến âm nhạc, nghệ sĩ hoặc trải nghiệm giải trí, đồng thời tôn trọng quyền riêng tư người dùng.' },
      { heading: 'Kiểm soát', body: 'Các lựa chọn cá nhân hóa quảng cáo sẽ được bổ sung khi tính năng quảng cáo thực tế được kích hoạt.' },
    ],
  }),
  accessibility: makePage({
    title: 'Hỗ trợ tiếp cận',
    eyebrow: 'Accessibility',
    intro: 'TMusic hướng tới giao diện dễ đọc, hỗ trợ bàn phím và có trạng thái focus rõ ràng.',
    sections: [
      { heading: 'Thiết kế dễ tiếp cận', list: ['Tương phản màu rõ', 'Kích thước chữ dễ đọc', 'Trạng thái hover/focus cho link và nút', 'Layout responsive trên màn hình nhỏ'] },
      { heading: 'Đóng góp phản hồi', body: sharedContact },
    ],
  }),
}

export const footerPageRoutes = [
  { path: '/about', pageKey: 'about' },
  { path: '/jobs', pageKey: 'jobs' },
  { path: '/news', pageKey: 'news' },
  { path: '/for-artists', pageKey: 'for-artists' },
  { path: '/developers', pageKey: 'developers' },
  { path: '/advertising', pageKey: 'advertising' },
  { path: '/investors', pageKey: 'investors' },
  { path: '/vendors', pageKey: 'vendors' },
  { path: '/mobile-app', pageKey: 'mobile-app' },
  { path: '/countries', pageKey: 'countries' },
  { path: '/import-music', pageKey: 'import-music' },
  { path: '/plans/individual', pageKey: 'plan-individual' },
  { path: '/plans/student', pageKey: 'plan-student' },
  { path: '/plans/free', pageKey: 'plan-free' },
  { path: '/legal', pageKey: 'legal' },
  { path: '/safety-privacy', pageKey: 'safety-privacy' },
  { path: '/privacy', pageKey: 'privacy' },
  { path: '/cookies', pageKey: 'cookies' },
  { path: '/ads-info', pageKey: 'ads-info' },
  { path: '/accessibility', pageKey: 'accessibility' },
]

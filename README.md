# TMusic

TMusic là một nền tảng nghe nhạc full-stack được xây dựng theo hướng Spotify/TMusic clone. Dự án hiện không còn ở mức starter nữa: repo đã có giao diện người nghe, đăng nhập người dùng, cổng nghệ sĩ, dashboard quản trị, quản lý catalog nhạc, upload media lên Cloudinary và pipeline xử lý audio cơ bản.

## Trạng thái hiện tại

| Mảng | Trạng thái | Ghi chú |
| --- | --- | --- |
| UI nghe nhạc | Đã có | Trang chủ, danh sách bài hát, artist, album, radio, chart, player, modal chặn khách chưa đăng nhập. |
| Auth người nghe | Đã có | Đăng ký, đăng nhập, kiểm tra phiên, JWT, bcrypt, social OAuth Google/Facebook/Apple. |
| Auth nghệ sĩ | Đã có | Đăng ký, đăng nhập, trạng thái hồ sơ `pending / approved / rejected`. |
| Artist dashboard | Đã có nền tảng | Xem hồ sơ, danh sách release, tạo track draft, upload master audio, xử lý variant. |
| Admin dashboard | Đã có | CRUD songs, artists, albums, radios, charts; upload ảnh/audio; import bài hát hàng loạt. |
| Database | Đã có | MongoDB + Mongoose models cho User, Song, Artist, Album, Radio, Chart. |
| Upload media | Đã có | Cloudinary signed upload cho admin và upload master audio cho artist. |
| Audio processing | Đã có bản đầu | FFmpeg tạo MP3 normal 128kbps và high 320kbps; high được đánh dấu VIP. |
| Subscription/entitlement | Đã có model + helper | User có subscription và entitlements; chưa thấy luồng thanh toán hoàn chỉnh. |
| Payment | Chưa hoàn thiện | Chưa có integration Stripe/Momo/ZaloPay hoặc webhook thanh toán. |
| Test tự động | Chưa có | Chưa thấy unit/integration/e2e tests trong repo. |
| Production hardening | Cần bổ sung | Cần rà soát env, secrets, rate limit, logging, validation, CORS production. |

## Tech stack

### Frontend

- React 19
- Vite 8
- React Router DOM 7
- Tailwind CSS 4
- Ant Design icons/components
- Swiper

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing
- Cloudinary media storage
- Multer upload middleware
- FFmpeg cho xử lý audio
- Nodemailer dependency đã có, nhưng chưa phải flow chính trong README này

### Monorepo

Repo dùng npm workspaces:

```txt
TMusic/
├── client/      # React/Vite frontend
├── server/      # Express/MongoDB backend
├── package.json # root workspace scripts
└── README.md
```

## Cấu trúc thư mục chính

```txt
client/src/
├── App.jsx
├── app/routes/
│   ├── paths.js
│   └── routeGuards.jsx
├── features/
│   ├── admin/      # admin login, dashboard, upload, import songs
│   ├── artist/     # artist auth, portal, dashboard
│   ├── auth/       # user auth + OAuth callback
│   ├── footer/     # các trang static/footer info
│   ├── home/       # home page, player data, fallback/mock data
│   └── support/    # support pages/articles
├── pages/
└── shared/
```

```txt
server/src/
├── config/
│   ├── cloudinary.js
│   └── db.js
├── controllers/
│   └── uploadController.js
├── features/
│   ├── admin/
│   ├── artist/
│   ├── auth/
│   ├── home/
│   ├── songs/
│   ├── system/
│   └── tracks/
├── middleware/
├── models/
├── routes/
├── scripts/
├── services/
└── utils/
```

## Cách chạy local

### 1. Cài dependencies

Từ thư mục gốc repo:

```bash
npm install
```

### 2. Tạo file môi trường backend

Copy file mẫu:

```bash
cp server/.env.example server/.env
```

Sau đó cập nhật các giá trị thật trong `server/.env`.

Tối thiểu để chạy backend với MongoDB:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-url>/<db_name>?retryWrites=true&w=majority
MONGODB_DB_NAME=tmusic
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

Không commit `server/.env` lên Git.

### 3. Chạy cả frontend và backend

```bash
npm run dev
```

Mặc định:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### 4. Chạy từng phần riêng

```bash
npm run dev:client
npm run dev:server
```

### 5. Mở nhanh theo vai trò

```bash
npm run admin
npm run artist
```

Các script này chạy backend và mở frontend vào route tương ứng.

## Scripts

| Script | Ý nghĩa |
| --- | --- |
| `npm run dev` | Chạy client và server cùng lúc. |
| `npm run fe` | Chạy Vite frontend. |
| `npm run be` | Chạy Express backend bằng nodemon. |
| `npm run admin` | Chạy backend và mở frontend ở `/admin`. |
| `npm run artist` | Chạy backend và mở frontend ở `/artist/login`. |
| `npm run build` | Build frontend production. |
| `npm run start` | Chạy backend bằng Node. |
| `npm run import:song-covers` | Chạy script import/bổ sung cover cho bài hát. |
| `npm run sync:home -w server` | Đồng bộ nội dung home từ dữ liệu seed/script phía server. |

## Biến môi trường quan trọng

### Server cơ bản

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
MONGODB_FALLBACK_URI=
MONGODB_DB_NAME=tmusic
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

### Admin bootstrap/login

```env
ADMIN_DISPLAY_NAME=TMusic Admin
ADMIN_EMAIL=admin@tmusic.local
ADMIN_PASSWORD=change-this-admin-password
```

> Lưu ý: đổi `ADMIN_PASSWORD` trước khi dùng môi trường thật.

### OAuth người dùng

```env
AUTH_CLIENT_CALLBACK_URL=http://localhost:5173/auth/callback

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/oauth/facebook/callback

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/apple/callback
```

### Cloudinary + audio processing

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=tmusic

FFMPEG_PATH=ffmpeg
TRACK_UPLOAD_MAX_MB=100
```

Để xử lý audio, server cần gọi được FFmpeg. Nếu máy chủ không có lệnh `ffmpeg`, hãy cài FFmpeg hoặc trỏ `FFMPEG_PATH` tới binary hợp lệ.

## Routes frontend

| Route | Màn hình |
| --- | --- |
| `/` | Trang nghe nhạc chính. |
| `/login` | Đăng nhập người nghe. |
| `/register` | Đăng ký người nghe. |
| `/auth/callback` | Callback sau OAuth. |
| `/support` | Trang hỗ trợ. |
| `/support/:slug` | Bài viết hỗ trợ. |
| `/artist` | Landing/cổng nghệ sĩ. |
| `/artist/login` | Đăng nhập nghệ sĩ. |
| `/artist/register` | Đăng ký nghệ sĩ. |
| `/artist/dashboard` | Dashboard nghệ sĩ. |
| `/admin/login` | Đăng nhập admin. |
| `/admin` | Dashboard admin. |
| `/admin/import` | Trang import bài hát. |

Ngoài ra còn có nhiều route static/footer như `/about`, `/jobs`, `/news`, `/for-artists`, `/developers`, `/advertising`, `/privacy`, `/cookies`, `/accessibility`, v.v.

## API backend

Tất cả API chính nằm dưới prefix `/api`.

### System/Home

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/api/health` | Kiểm tra server. |
| `GET` | `/api/home` | Lấy dữ liệu trang chủ: songs, artists, albums, radios, charts. |
| `GET` | `/api/songs` | Lấy danh sách bài hát đã publish. |

### Auth người nghe

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Đăng ký user thường. |
| `POST` | `/api/auth/login` | Đăng nhập user thường. |
| `GET` | `/api/auth/me` | Lấy user hiện tại, yêu cầu listener token. |
| `GET` | `/api/auth/oauth/:provider/url` | Lấy URL bắt đầu OAuth. |
| `GET/POST` | `/api/auth/oauth/:provider/callback` | OAuth callback cho Google/Facebook/Apple. |

### Auth admin

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/admin-auth/login` | Đăng nhập admin. |
| `GET` | `/api/admin-auth/me` | Lấy admin hiện tại. |

### Auth/cổng nghệ sĩ

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/artist-auth/register` | Đăng ký tài khoản nghệ sĩ. |
| `POST` | `/api/artist-auth/login` | Đăng nhập nghệ sĩ. |
| `GET` | `/api/artist-auth/me` | Lấy phiên nghệ sĩ. |
| `GET` | `/api/artists/me` | Lấy hồ sơ nghệ sĩ hiện tại. |
| `GET` | `/api/releases` | Lấy danh sách release của nghệ sĩ. |

### Track nghệ sĩ

Các endpoint này yêu cầu artist đã được duyệt (`approved`).

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/tracks` | Tạo track draft. |
| `POST` | `/api/tracks/upload` | Tạo signed upload cho master audio. |
| `POST` | `/api/tracks/:trackId/confirm-upload` | Xác nhận file master đã upload lên Cloudinary. |
| `POST` | `/api/tracks/:trackId/upload-file` | Upload master audio qua server. |
| `POST` | `/api/tracks/:trackId/process` | Bắt đầu xử lý audio variant bằng FFmpeg. |

### Admin

Các endpoint này yêu cầu admin token.

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/admin/uploads/sign` | Tạo signed upload cho media admin. |
| `POST` | `/api/admin/songs/import` | Import nhiều bài hát. |
| `GET` | `/api/admin/:resource` | List resource. |
| `POST` | `/api/admin/:resource` | Tạo resource. |
| `PUT` | `/api/admin/:resource/:id` | Cập nhật resource. |
| `DELETE` | `/api/admin/:resource/:id` | Xóa resource. |

`resource` hiện hỗ trợ:

- `songs`
- `artists`
- `albums`
- `radios`
- `charts`

## Luồng dữ liệu chính

### Trang chủ người nghe

1. Frontend gọi `/api/home`.
2. Backend đọc dữ liệu từ MongoDB thông qua `contentService`.
3. Chỉ bài hát có `releaseStatus = published` mới xuất hiện.
4. Nếu API lỗi hoặc DB chưa có dữ liệu, frontend dùng fallback data trong `client/src/features/home/homeData.js`.
5. Người dùng chưa đăng nhập khi bấm phát nhạc sẽ thấy modal yêu cầu đăng nhập/đăng ký.

### Admin quản lý catalog

1. Admin đăng nhập qua `/api/admin-auth/login`.
2. Frontend lưu token admin ở local storage.
3. Admin CRUD các resource qua `/api/admin/:resource`.
4. Khi upload ảnh/audio, frontend xin signed upload từ `/api/admin/uploads/sign` rồi upload lên Cloudinary.
5. Metadata như URL, publicId, duration, format, size được lưu vào MongoDB.

### Artist upload track

1. Artist đăng ký tài khoản, mặc định `artistStatus = pending`.
2. Chỉ artist có trạng thái `approved` mới được tạo/upload/process track.
3. Artist tạo track draft qua `/api/tracks`.
4. Artist upload master audio bằng signed upload hoặc upload qua server.
5. Track được lưu với `sourceType = artist`, `releaseStatus = draft`, `processingStatus = uploaded`.
6. Gọi `/api/tracks/:trackId/process` để FFmpeg tạo variants.
7. Variant hiện tại:
   - `normal`: MP3 128kbps, không VIP.
   - `high`: MP3 320kbps, dành cho VIP.

## Database models chính

### User

Dùng cho cả listener, artist và admin.

Các field quan trọng:

- `displayName`
- `email`
- `passwordHash`
- `role`: `user`, `artist`, `admin`
- `artistStatus`: `none`, `pending`, `approved`, `rejected`
- `artistProfile`
- `subscription`
- `authProviders`
- `lastLoginAt`

### Song

Dùng cho catalog/admin và track của artist.

Các field quan trọng:

- `title`
- `artist`
- `coverUrl`
- `duration`
- `mood`
- `audioUrl`
- `masterAudio`
- `audioVariants`
- `processingStatus`: `draft`, `uploaded`, `processing`, `ready`, `failed`
- `ownerUserId`
- `sourceType`: `catalog`, `artist`
- `releaseStatus`: `draft`, `pending`, `published`
- `sortOrder`

### Artist / Album / Radio / Chart

Các model phục vụ catalog hiển thị trên home và quản lý trong admin dashboard.

## Những phần đã hoàn thiện tốt

- Cấu trúc feature-based rõ ràng ở cả frontend và backend.
- Có phân quyền riêng cho user, artist, admin.
- Có dashboard admin có thể quản lý nội dung thật từ MongoDB.
- Có Cloudinary signed upload, tránh phải upload media lớn qua backend trong admin flow.
- Có pipeline xử lý audio cho artist bằng FFmpeg.
- Có fallback data giúp UI vẫn demo được khi database trống hoặc chưa kết nối.
- Có routes static/support/footer để app trông giống sản phẩm hoàn chỉnh hơn.

## Những phần cần làm tiếp

### Ưu tiên cao

- Bổ sung flow duyệt artist trong admin dashboard: chuyển `artistStatus` từ `pending` sang `approved/rejected`.
- Hoàn thiện payment/subscription để unlock audio `high`/VIP.
- Bảo vệ playback/audio high quality theo entitlement ở cả frontend và backend.
- Thêm validation chặt hơn cho payload admin/artist.
- Thêm rate limit cho login, register, OAuth callback và upload endpoints.
- Rà soát CORS, cookie/storage strategy và secret management cho production.

### Ưu tiên trung bình

- Thêm test tự động cho service/controller quan trọng.
- Thêm logging chuẩn cho upload, auth, audio processing.
- Thêm queue/background worker cho xử lý FFmpeg thay vì xử lý trực tiếp trong process web server.
- Thêm trạng thái publish/review cho track của artist.
- Thêm trang chi tiết album/artist/playlist.
- Thêm search, playlist cá nhân, liked songs, history.

### Ưu tiên thấp

- Làm sạch text bị lỗi dấu/encoding trong một số file comment/env mẫu.
- Đồng bộ tiếng Việt có dấu trong nhãn admin UI.
- Bổ sung ảnh chụp màn hình vào README.
- Tách README thành docs chi tiết hơn nếu dự án tiếp tục lớn.

## Lưu ý bảo mật

- Không commit `server/.env` hoặc bất kỳ secret thật nào.
- Đổi `JWT_SECRET` và `ADMIN_PASSWORD` trước khi deploy.
- Không dùng credentials demo ở production.
- Giới hạn kích thước upload theo `TRACK_UPLOAD_MAX_MB`.
- Cloudinary API secret chỉ nằm ở backend.
- Với OAuth, callback URL phải khớp chính xác cấu hình trên Google/Facebook/Apple developer console.

## Build và deploy

Build frontend:

```bash
npm run build
```

Chạy backend production:

```bash
npm run start
```

Khi deploy cần chuẩn bị:

- MongoDB Atlas hoặc MongoDB server.
- Cloudinary account.
- FFmpeg trên server nếu dùng xử lý audio.
- Các biến môi trường production.
- Cấu hình reverse proxy/static hosting cho frontend build.

## Ghi chú cho người phát triển tiếp

- `client/src/features/home/homeData.js` là fallback/mock data, không phải nguồn dữ liệu chính.
- Nguồn dữ liệu thật của home nằm ở MongoDB, qua `/api/home`.
- `Song` là model trung tâm cho cả bài hát admin và track artist.
- Artist track cần `ownerUserId` và `sourceType = artist` để phân biệt với catalog.
- Audio high quality đã có field `vipOnly`, nhưng cần hoàn thiện enforcement theo subscription.
- Admin import songs có logic suy luận artist/title từ filename, nên nên đặt file theo dạng `Artist - Title.ext` để kết quả tốt hơn.

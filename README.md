# TMusic

Starter fullstack cho `TMusic` với:

- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose

## Chạy dự án

```bash
npm install
npm run dev
```

Frontend chạy mặc định tại `http://localhost:5173`.
Backend chạy mặc định tại `http://localhost:5000`.

## Cấu hình MongoDB

Tạo file `server/.env` từ `server/.env.example`:

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-url>/<db_name>?retryWrites=true&w=majority
```

Replace all placeholder values with your own MongoDB Atlas configuration and never commit `server/.env`.

Thay `<db_password>` bằng mật khẩu Mongo Atlas của bạn.

Nếu MongoDB chưa chạy, API vẫn khởi động nhưng route dữ liệu bài hát sẽ trả về trạng thái chưa kết nối DB.

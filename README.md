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
MONGODB_URI=mongodb://127.0.0.1:27017/tmusic
```

Nếu MongoDB chưa chạy, API vẫn khởi động nhưng route dữ liệu bài hát sẽ trả về trạng thái chưa kết nối DB.

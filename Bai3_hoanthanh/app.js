const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Thiết lập EJS làm view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Tạo thư mục lưu ảnh nếu chưa tồn tại
const uploadDir = './public/img-laptop';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Import routes
const laptopRoutes = require('./routes/laptops');

// Routes
app.use('/', laptopRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Không tìm thấy trang' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

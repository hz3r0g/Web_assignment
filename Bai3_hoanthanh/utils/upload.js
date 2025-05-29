const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img-laptop');
  },
  filename: function (req, file, cb) {
    // Lưu file ảnh tạm thời bằng timestamp để tránh trùng lặp
    cb(null, "temp_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Kiểm tra loại file
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Chỉ cho phép file hình ảnh!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;

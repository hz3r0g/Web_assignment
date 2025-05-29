const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Hiển thị danh sách laptop
exports.getAllLaptops = async (req, res) => {
  try {
    const [laptops] = await pool.query('SELECT ID_LT, Title, ImageUrl, Price, Number FROM LapTop WHERE Stautus = 1 OR Stautus IS NULL');
    res.render('index', { laptops, title: 'Danh sách laptop' });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách laptop:', error);
    res.status(500).render('error', { 
      title: 'Lỗi server', 
      message: 'Đã xảy ra lỗi khi lấy danh sách laptop' 
    });
  }
};

// Hiển thị form thêm laptop
exports.showAddForm = (req, res) => {
  res.render('add', { title: 'Thêm laptop mới' });
};

// Thêm laptop mới
exports.createLaptop = async (req, res) => {
  try {
    const { id_lt, title, summary, price, number } = req.body;
    let imageUrl = null;
    let tempImagePath = null;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn hình ảnh' });
    }
    
    // Đường dẫn tạm thời của file upload
    tempImagePath = path.join(__dirname, '..', 'public', 'img-laptop', req.file.filename);
    
    // Kiểm tra ID đã tồn tại chưa
    const [existing] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ?', [id_lt]);
    
    if (existing.length > 0) {
      // Xóa file ảnh vừa upload nếu ID đã tồn tại
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      return res.status(400).json({ message: 'ID laptop đã tồn tại!' });
    }
    
    // Lấy phần mở rộng của file gốc
    const fileExtension = path.extname(req.file.originalname);
    
    // Tạo tên file mới theo ID sản phẩm
    const newFileName = id_lt + fileExtension;
    const newFilePath = path.join(__dirname, '..', 'public', 'img-laptop', newFileName);
    
    // Đổi tên file
    fs.renameSync(tempImagePath, newFilePath);
    
    // Cập nhật đường dẫn trong database
    imageUrl = `/img-laptop/${newFileName}`;
    
    await pool.query(
      'INSERT INTO LapTop (ID_LT, Title, Summary, ImageUrl, Price, Number, Stautus) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [id_lt, title, summary, imageUrl, price, number]
    );
    
    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi thêm laptop:', error);
    res.status(500).json({ message: 'Lỗi khi thêm laptop' });
  }
};

// API lấy danh sách laptop
exports.getLaptopsAPI = async (req, res) => {
  try {
    const [laptops] = await pool.query('SELECT ID_LT, Title, ImageUrl, Price, Number FROM LapTop WHERE Stautus = 1 OR Stautus IS NULL');
    res.json(laptops);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách laptop:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hiển thị chi tiết laptop
exports.getLaptopDetail = async (req, res) => {
  try {
    const [laptop] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ? AND (Stautus = 1 OR Stautus IS NULL)', [req.params.id]);
    
    if (laptop.length === 0) {
      return res.status(404).render('404', { title: 'Không tìm thấy laptop' });
    }
    
    res.render('detail', { laptop: laptop[0], title: laptop[0].Title });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết laptop:', error);
    res.status(500).render('error', { 
      title: 'Lỗi server', 
      message: 'Đã xảy ra lỗi khi lấy chi tiết laptop' 
    });
  }
};

// API lấy chi tiết laptop
exports.getLaptopDetailAPI = async (req, res) => {
  try {
    const [laptop] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ? AND (Stautus = 1 OR Stautus IS NULL)', [req.params.id]);
    
    if (laptop.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy laptop' });
    }
    
    res.json(laptop[0]);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết laptop:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hiển thị form sửa laptop
exports.showEditForm = async (req, res) => {
  try {
    const [laptop] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ? AND (Stautus = 1 OR Stautus IS NULL)', [req.params.id]);
    
    if (laptop.length === 0) {
      return res.status(404).render('404', { title: 'Không tìm thấy laptop' });
    }
    
    res.render('edit', { laptop: laptop[0], title: `Sửa ${laptop[0].Title}` });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin laptop để sửa:', error);
    res.status(500).render('error', { 
      title: 'Lỗi server', 
      message: 'Đã xảy ra lỗi khi lấy thông tin laptop' 
    });
  }
};

// Cập nhật laptop
exports.updateLaptop = async (req, res) => {
  try {
    const { title, summary, price, number } = req.body;
    const { id } = req.params;
    
    // Lấy thông tin laptop hiện tại
    const [currentLaptop] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ? AND (Stautus = 1 OR Stautus IS NULL)', [id]);
    
    if (currentLaptop.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy laptop' });
    }
    
    let imageUrl = currentLaptop[0].ImageUrl;
    
    // Nếu có upload ảnh mới
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (currentLaptop[0].ImageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', currentLaptop[0].ImageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Đổi tên file theo ID sản phẩm
      const fileExtension = path.extname(req.file.originalname);
      const newFileName = id + fileExtension;
      const tempImagePath = path.join(__dirname, '..', 'public', 'img-laptop', req.file.filename);
      const newFilePath = path.join(__dirname, '..', 'public', 'img-laptop', newFileName);
      
      // Đổi tên file
      fs.renameSync(tempImagePath, newFilePath);
      
      // Cập nhật đường dẫn trong database
      imageUrl = `/img-laptop/${newFileName}`;
    }
    
    await pool.query(
      'UPDATE LapTop SET Title = ?, Summary = ?, ImageUrl = ?, Price = ?, Number = ?, Stautus = 1 WHERE ID_LT = ?',
      [title, summary, imageUrl, price, number, id]
    );
    
    res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi cập nhật laptop:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật laptop' });
  }
};

// Xóa laptop (cập nhật trạng thái thành ẩn)
exports.deleteLaptop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin laptop để kiểm tra
    const [laptop] = await pool.query('SELECT * FROM LapTop WHERE ID_LT = ?', [id]);
    
    if (laptop.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy laptop' });
    }
    
    // Cập nhật trạng thái laptop thành ẩn (0) thay vì xóa
    await pool.query('UPDATE LapTop SET Stautus = 0 WHERE ID_LT = ?', [id]);
    
    res.json({ message: 'Đã ẩn laptop thành công' });
  } catch (error) {
    console.error('Lỗi khi ẩn laptop:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

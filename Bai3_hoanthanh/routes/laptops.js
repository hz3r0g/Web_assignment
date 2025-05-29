const express = require('express');
const router = express.Router();
const laptopController = require('../controllers/laptopController');
const upload = require('../utils/upload');

// Trang chủ - Hiển thị danh sách laptop
router.get('/', laptopController.getAllLaptops);

// Trang thêm laptop mới - Form
router.get('/add', laptopController.showAddForm);

// API Thêm laptop mới
router.post('/api/laptops', upload.single('image'), laptopController.createLaptop);

// API Lấy danh sách laptop (chỉ ID, Title, Price, Number)
router.get('/api/laptops', laptopController.getLaptopsAPI);

// Trang chi tiết laptop
router.get('/laptop/:id', laptopController.getLaptopDetail);

// API Lấy chi tiết một laptop
router.get('/api/laptops/:id', laptopController.getLaptopDetailAPI);

// Trang sửa laptop - Form
router.get('/edit/:id', laptopController.showEditForm);

// API Sửa laptop
router.post('/api/laptops/:id', upload.single('image'), laptopController.updateLaptop);

// API Xóa laptop
router.delete('/api/laptops/:id', laptopController.deleteLaptop);

module.exports = router;

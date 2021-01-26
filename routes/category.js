const express = require('express');

// 컨트롤러 경로
const Category_controller = require('../controllers/category');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카테고리 리스트 보여주기
router.get('/get-categorylist', isLoggedIn, Category_controller.get_categorylist);

// 새 카테고리 생성하기
router.post('/create-category', isLoggedIn, Category_controller.create_category);

// 카테고리 삭제하기
router.post('/delete-category', isLoggedIn, Category_controller.delete_category);

// 카테고리 순서변경하기
router.post('/change-category-order', isLoggedIn, Category_controller.change_category_order);

// 카테고리 이름 변경하기
router.post('/change-category-name', isLoggedIn, Category_controller.change_category_name);



module.exports = router;

const express = require('express');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book');
const Card = require('../models/card');

// 컨트롤러 경로
const Index_controller = require('../controllers/index');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 인덱스 목록을 보여줍니다.
router.post('/get-indexlist', isLoggedIn, Index_controller.get_indexList);

// 인덱스를 추가합니다.
router.post('/create-index', isLoggedIn, Index_controller.create_index);

// 인덱스를 이름을 변경합니다.
router.post('/change-index-name', isLoggedIn, Index_controller.change_index_name);

// 인덱스를 이름을 변경합니다.
router.post('/change-index-level', isLoggedIn, Index_controller.change_index_level);

// 인덱스를 순서를 변경합니다.
router.post('/change-index-order', isLoggedIn, Index_controller.change_index_order);










module.exports = router;
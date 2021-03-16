const express = require('express');

// 컨트롤러 경로
const Pagetype_controller = require('../controllers/pagetype');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카드타입 리스트 보여주기
router.post('/get-pagetype', isLoggedIn, Pagetype_controller.get_pagetype);

// 카드타입 리스트 보여주기
router.post('/update-pagetype', isLoggedIn, Pagetype_controller.update_pagetype);


module.exports = router;
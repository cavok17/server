const express = require('express');

// 컨트롤러 경로
const Card_controller = require('../controllers/card');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카드 리스트 보여주기
router.get('/get-cardlist', isLoggedIn, Card_controller.get_cardlist);

// 카드타입 리스트 보여주기
router.get('/create-card', isLoggedIn, Card_controller.create_card);


module.exports = router;
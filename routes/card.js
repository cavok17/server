const express = require('express');

// 컨트롤러 경로
const Card_controller = require('../controllers/card');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카드 리스트 보여주기
router.post('/get-cardlist', isLoggedIn, Card_controller.get_cardlist);

// 카드 생성하기
router.post('/create-card', isLoggedIn, Card_controller.create_card);

// 카드 수정하기
router.get('/change-card', isLoggedIn, Card_controller.change_card);



module.exports = router;
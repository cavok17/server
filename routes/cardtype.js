const express = require('express');

// 컨트롤러 경로
const Cardtype_controller = require('../controllers/cardtype');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카드타입 리스트 보여주기
router.get('/get-cardtypelist', isLoggedIn, Cardtype_controller.get_cardtypeList);

// 카드타입 생성하기
router.post('/create-cardtype', isLoggedIn, Cardtype_controller.create_cardtype);

// 카드타입 닉 변경하기
router.get('/change-cardtype-nick', isLoggedIn, Cardtype_controller.change_cardtype_nick);

// 카드타입 순서 변경하기
router.get('/change-cardtype-order', isLoggedIn, Cardtype_controller.change_cardtype_order);

module.exports = router;
const express = require('express');

// 컨트롤러 경로
const Cardtype_controller = require('../controllers/cardtype');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카드타입 리스트 보여주기
router.post('/get-cardtype', isLoggedIn, Cardtype_controller.get_cardtypelist);

// 카드타입 생성하기
router.post('/create-cardtype', isLoggedIn, Cardtype_controller.create_cardtype);

// 카드타입 닉 변경하기
router.post('/change-cardtype-name', isLoggedIn, Cardtype_controller.change_cardtype_name);

// 카드타입 순서 변경하기
router.post('/change-cardtype-order', isLoggedIn, Cardtype_controller.change_cardtype_order);

module.exports = router;
const express = require('express');

// 컨트롤러 경로
const Study_execute_controller = require('../controllers/study_execute');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();


// 카드리스트만 받아옵니다..
router.post('/get-cardlist', isLoggedIn, Study_execute_controller.get_cardlist);

// 카드리스트만 받아옵니다..
router.post('/get-cardlist-for-continue', isLoggedIn, Study_execute_controller.get_cardlist_for_continue);

// 카드를 보내줍니다.
router.post('/get-studying-cards',Study_execute_controller.get_studying_cards);

// 표준 읽기 모드에서 카드를 보내드립니다.
router.post('/get-studying-cards-in-read-mode',Study_execute_controller.get_studying_cards_in_read_mode);

// 선택된 카드와 투입된 카드 갯수를 보여줍니다.
router.post('/get-num-cards',Study_execute_controller.get_num_cards);

// 미투입 카드 일부에 대한 카드리스트를 보내줍니다.
router.post('/get-additional-cardlist',Study_execute_controller.get_additional_cardlist);

module.exports = router;
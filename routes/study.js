const express = require('express');


// 컨트롤러 경로
const Study_controller = require('../controllers/study');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 선택한 책 정보를 저장합니다.
router.post('/save-booklist', Study_controller.save_booklist);

// 인덱스를 보내줍니다.
router.post('/get-index', Study_controller.get_index);

// 학습을 시작합니다.
router.post('/start-study', isLoggedIn, Study_controller.start_study);

// 목차를 선택합니다.
router.post('/click-index', Study_controller.click_index);

// 책을 위로 올립니다.
router.post('/click-up', isLoggedIn, Study_controller.click_up);

// 책을 아래로 내립니다.
router.post('/click-down', isLoggedIn, Study_controller.click_down);



module.exports = router;
const express = require('express');


// 컨트롤러 경로
const Study_setup_controller = require('../controllers/study_setup');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// // 선택한 책 정보를 저장합니다.
// router.post('/save-booklist', isLoggedIn, Study_setup_controller.save_booklist);

// 인덱스를 보내줍니다.
router.post('/get-index', isLoggedIn, Study_setup_controller.get_index);

// // 목차를 선택합니다.
// router.post('/click-index', isLoggedIn, Study_setup_controller.click_index);

// // 책을 위로 올립니다.
// router.post('/click-up', isLoggedIn, Study_setup_controller.click_up);

// // 책을 아래로 내립니다.
// router.post('/click-down', isLoggedIn, Study_setup_controller.click_down);

// 학습을 시작합니다.
router.post('/start-study', isLoggedIn, Study_setup_controller.start_study);

// 카드를 보내줍니다.
router.post('/get-studying-cards',Study_setup_controller.get_studying_cards);

// 카드를 보내줍니다.
router.post('/get-study-configuration',Study_setup_controller.get_study_configuration);

// 학습 설정을 수정합니다.
router.post('/set-study-configuration',Study_setup_controller.set_study_configuration);

// 카드를 보내줍니다.
router.post('/get-all-study-configurations',Study_setup_controller.get_all_study_configurations);

module.exports = router;
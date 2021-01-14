const express = require('express');


// 컨트롤러 경로
const Study_setup_controller = require('../controllers/study_setup');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// // 선택한 책 정보를 저장합니다.
// router.post('/save-booklist', isLoggedIn, Study_setup_controller.save_booklist);

// 인덱스를 보내줍니다.
router.post('/get-index', isLoggedIn, Study_setup_controller.get_index);

// 학습 콘피그값을 보내줍니다.
router.post('/get-study-config', isLoggedIn, Study_setup_controller.get_study_config);

// 세션을 생성합니다.
router.post('/create-session', isLoggedIn, Study_setup_controller.create_session);

// // 목차를 선택합니다.
// router.post('/click-index', isLoggedIn, Study_setup_controller.click_index);

// // 책을 위로 올립니다.
// router.post('/click-up', isLoggedIn, Study_setup_controller.click_up);

// // 책을 아래로 내립니다.
// router.post('/click-down', isLoggedIn, Study_setup_controller.click_down);

// 카드리스트만 받아옵니다..
router.post('/get-cardlist', isLoggedIn, Study_setup_controller.get_cardlist);

// 고급 필터를 적용하여 카드 갯수를 다시 산출합니다.
router.post('/apply-advanced-filter', isLoggedIn, Study_setup_controller.apply_advanced_filter);

// 카드를 보내줍니다.
router.post('/get-studying-cards',Study_setup_controller.get_studying_cards);

// 표준 읽기 모드에서 카드를 보내드립니다.
router.post('/get-studying-cards-in-read-mode',Study_setup_controller.get_studying_cards_in_read_mode);

// 카드를 보내줍니다.
router.post('/get-study-configuration',Study_setup_controller.get_study_configuration);

// 학습 설정을 수정합니다.
router.post('/set-study-configuration',Study_setup_controller.set_study_configuration);

// 카드를 보내줍니다.
router.post('/get-all-study-configurations',Study_setup_controller.get_all_study_configurations);

module.exports = router;
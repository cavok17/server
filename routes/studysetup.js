const express = require('express');


// 컨트롤러 경로
const Studysetup_controller = require('../controllers/studysetup');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 선택한 책 정보를 저장합니다.
router.post('/save-booklist', isLoggedIn, Studysetup_controller.save_booklist);

// 인덱스를 보내줍니다.
router.post('/get-index', isLoggedIn, Studysetup_controller.get_index);

// 목차를 선택합니다.
router.post('/click-index', isLoggedIn, Studysetup_controller.click_index);

// 책을 위로 올립니다.
router.post('/click-up', isLoggedIn, Studysetup_controller.click_up);

// 책을 아래로 내립니다.
router.post('/click-down', isLoggedIn, Studysetup_controller.click_down);

// 학습을 시작합니다.
router.post('/start-study', isLoggedIn, Studysetup_controller.start_study);

// 카드를 보내줍니다.
router.post('/get-studying-cards',Studysetup_controller.get_studying_cards);

// 학습 설정을 수정합니다.
router.post('/set-study-configuration',Studysetup_controller.set_study_configuration);

// 카드를 보내줍니다.
router.post('/get-study-configuration',Studysetup_controller.get_study_configuration);

module.exports = router;
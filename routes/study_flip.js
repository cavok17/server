const express = require('express');


// 컨트롤러 경로
const Study_flip_controller = require('../controllers/study_flip');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 난이도 평가를 반영합니다.
// router.post('/click-difficulty', isLoggedIn, Study_flip_controller.click_difficulty);
router.post('/click-difficulty', Study_flip_controller.click_difficulty);

// 학습 결과를 보내드릴겝쇼
router.post('/get-study-result', Study_flip_controller.get_study_result);

// 상세한 학습 결과를 보내드릴겝쇼
// router.post('/get-study-result-detail', Study_flip_controller.get_study_result_detail);




module.exports = router;
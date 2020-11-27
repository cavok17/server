const express = require('express');


// 컨트롤러 경로
const Study_controller = require('../controllers/study');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 인덱스를 보내줍니다.
router.post('/get-index', isLoggedIn, Study_controller.get_index);

// 학습을 시작합니다.
router.post('/start-study', Study_controller.start_study);
// router.post('/start-study', isLoggedIn, Study_controller.start_study);


module.exports = router;
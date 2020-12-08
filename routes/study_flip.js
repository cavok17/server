const express = require('express');


// 컨트롤러 경로
const Study_flip_controller = require('../controllers/study_flip');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 난이도 평가를 반영합니다.
router.post('/click-difficulty', isLoggedIn, Study_flip_controller.click_difficulty);


module.exports = router;
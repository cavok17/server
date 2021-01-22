const express = require('express');

// 컨트롤러 경로
const Study_result_controller = require('../controllers/study_result');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();


// 카드리스트만 받아옵니다..
router.post('/create-studyresult', isLoggedIn, Study_result_controller.create_studyresult);

// 카드리스트만 받아옵니다..
router.post('/req-session-studyresult', isLoggedIn, Study_result_controller.req_session_studyresult);


module.exports = router;
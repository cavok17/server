const express = require('express');

// 컨트롤러 경로
const Mentoring_controller = require('../controllers/mentoring');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 인덱스 목록을 보여줍니다.
// router.post('/enter-mentoring-req', isLoggedIn, Mentoring_controller.enter_mentoring_req);
router.post('/enter-mentoring-req', Mentoring_controller.enter_mentoring_req);


// 인덱스 목록을 보여줍니다.
router.post('/request-mentoring', Mentoring_controller.request_mentoring);



// 인덱스 목록을 보여줍니다.
router.post('/enter-mentoring-req-management', Mentoring_controller.enter_mentoring_req_management);

// 인덱스 목록을 보여줍니다.
router.post('/accept-mentoring-req', Mentoring_controller.accept_mentoring_req);


module.exports = router;
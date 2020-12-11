const express = require('express');

// 컨트롤러 경로
const Mentoring_controller = require('../controllers/mentoring');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 인덱스 목록을 보여줍니다.
// router.post('/enter-mentoring-req', isLoggedIn, Mentoring_controller.enter_mentoring_req);
router.post('/get-mentoringlist', Mentoring_controller.get_mentoringlist);


// 멘토링 요청한 거 목록하고, 책 목록을 보여줍니다.
router.post('/enter-mentoring-req', Mentoring_controller.enter_mentoring_req);

// 멘토의 개인 정보를 보여줍니다.
router.post('/get-user-info', Mentoring_controller.get_user_info);

// 멘토링을 요청합니다.
router.post('/request-mentoring', Mentoring_controller.request_mentoring);

// 멘토링 요청을 취소합니다.
router.post('/cancel-mentoring-req', Mentoring_controller.cancel_mentoring_req);

// 멘토링 수락/거절 화면으로 들어갑니다.
router.post('/enter-mentoring-req_management', Mentoring_controller.enter_mentoring_req_management);

// 멘토링 요청을 수락합니다.
router.post('/accept-mentoring-req', Mentoring_controller.accept_mentoring_req);

// 멘토링 요청을 거절합니다.
router.post('/deny-mentoring-req', Mentoring_controller.deny_mentoring_req);

// 멘토링 관계를 취소합니다.
router.post('/cancel-mentee-role', Mentoring_controller.cancel_mentee_role);



module.exports = router;
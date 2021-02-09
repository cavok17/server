const express = require('express');

// 컨트롤러 경로
const Bookstore_controller = require('../controllers/bookstore');
const { isLoggedIn, isNotLoggedIn, upload} = require('./middlewares');
const router = express.Router();



// 책 판매를 요청합니다.
router.post('/req-book-sell', isLoggedIn, Bookstore_controller.req_book_sell);

// 책 판매를 요청합니다.
router.get('/show-candibooklist', isLoggedIn, Bookstore_controller.show_candibooklist);

// 책 판매를 허가합니다.
router.post('/permit-book-sell', Bookstore_controller.permit_book_sell);

// 책 판매를 허가합니다.
router.get('/get-sellbooklist', Bookstore_controller.get_sellbooklist);

// 책 판매를 허가합니다.
router.post('/add-sellbook-to-mybook', Bookstore_controller.add_sellbook_to_mybook);


module.exports = router;
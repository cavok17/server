const express = require('express');
const fs = require("fs").promises;
const path = require('path')
const multer = require('multer')
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')


// 컨트롤러 경로
const Bookstore_controller = require('../controllers/book_store');
const Bookcomment_controller = require('../controllers/book_comment');
const Bookcart_controller = require('../controllers/book_cart');
const Payment_controller = require('../controllers/payment');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const router = express.Router();

AWS.config.update({
    accessKeyId : process.env.S3_ACCESS_KEY_ID,    
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,    
    region: 'ap-northeast-2'
})
const upload = multer({
    storage : multerS3({
        s3: new AWS.S3(),
        bucket: 'bookcoverofcogbook',
        key(req, file, cb){
            // cb(null, `bookcover/original/${Date.now()}${path.basename(file.originalname)}`)
            cb(null, `original/${Date.now()}${path.basename(file.originalname)}`)
        },
    }),
    limits : {fileSize : 5*1024*1024},
});
// const upload = multer({
//     storage : multer.diskStorage({
//         destination(req, file, done){            
//             done(null, 'uploads/thumbnail/');
//         },
//         filename(req,file,done){    
//             const ext = path.extname(file.originalname);            
//             done(null, path.basename(file.originalname, ext) + Date.now() + ext);
//         },
//     }),
//     limits : {fileSize : 5*1024*1024},
// });



// thumbnail을 등록합니다.
router.post('/upload-thumbnail', isLoggedIn, upload.single('file'), Bookstore_controller.upload_thumbnail);

// 책 판매를 요청합니다.
router.post('/create-sellbook', isLoggedIn, Bookstore_controller.create_sellbook);


// 책 판매를 요청합니다.
router.post('/update-sellbook-info', isLoggedIn, Bookstore_controller.update_sellbook_info);




// 책 판매를 허가합니다.
router.get('/get-sellbooklist', Bookstore_controller.get_sellbooklist);

// 책 정보를 받아옵니다.
router.post('/get-book-info', isLoggedIn, Bookstore_controller.get_book_info);



//-------------------------------------------------------------------------------
// // 북코멘트를 가져옵니다.
// router.post('/get-book-comment', isLoggedIn, Bookstore_controller.get_book_comment);

// 북코멘트를 생성합니다.
router.post('/create-book-comment', isLoggedIn, Bookcomment_controller.create_book_comment);

// 북코멘트를 수정합니다.
router.post('/update-book-comment', isLoggedIn, Bookcomment_controller.update_book_comment);

// 북코멘트를 삭제합니다.
router.post('/delete-book-comment', isLoggedIn, Bookcomment_controller.delete_book_comment);

//-------------------------------------------------------------------------------
// 북카트 정보를 가져옵니다.
router.post('/get-book-cart', isLoggedIn, Bookcart_controller.get_book_cart);

// // 북카트를 생성합니다.
// router.post('/create-book-cart', isLoggedIn, Bookcart_controller.create_book_cart);

// 북카트를 수정합니다.
router.post('/update-book-cart', isLoggedIn, Bookcart_controller.update_book_cart);

// // 북카트를 삭제합니다.
// router.post('/delete-book-cart', isLoggedIn, Bookcart_controller.delete_book_cart);

//-------------------------------------------------------------------------------


// 결제 정보를 생성합니다.
router.post('/create-payment',isLoggedIn, Payment_controller.create_payment);

// 결제 정보를 가져옵니다.
router.post('/get-payment',isLoggedIn, Payment_controller.get_payment);

// 책 구매 정보를 가져옵니다.
router.post('/get-purchase-book',isLoggedIn, Payment_controller.get_purchase_book);


module.exports = router;
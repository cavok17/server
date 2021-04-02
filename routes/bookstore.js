const express = require('express');
const fs = require("fs").promises;
const path = require('path')
const multer = require('multer')
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')


// 컨트롤러 경로
const Bookstore_controller = require('../controllers/bookstore');
const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const router = express.Router();

AWS.config.update({
    accessKeyId : process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2'
})
// const upload = multer({
//     storage : multerS3({
//         s3: new AWS.S3(),
//         bucket: 'cogbookofopensky',
//         key(req, file, cb){
//             cb(null, `book_info0017/${Date.now()}${path.basename(file.originalname)}`)
//         },
//     }),
//     limits : {fileSize : 5*1024*1024},
// });
const upload = multer({
    storage : multer.diskStorage({
        destination(req, file, done){            
            done(null, 'uploads/thumbnail/');
        },
        filename(req,file,done){    
            const ext = path.extname(file.originalname);            
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits : {fileSize : 5*1024*1024},
});



// thumbnail을 등록합니다.
router.post('/upload-thumbnail', isLoggedIn, upload.single('file'), Bookstore_controller.upload_thumbnail);

// 책 판매를 요청합니다.
router.post('/create-sellbook', isLoggedIn, Bookstore_controller.create_sellbook);


// 책 판매를 요청합니다.
router.post('/update-sellbook-info', isLoggedIn, Bookstore_controller.update_sellbook_info);

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
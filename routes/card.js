const express = require('express');
// const fs = require("fs");
// const multer = require('multer');
// const path = require("path");

// 컨트롤러 경로
const Card_controller = require('../controllers/card');
const { isLoggedIn, isNotLoggedIn, upload} = require('./middlewares');
const router = express.Router();



// 카드 리스트 보여주기
router.post('/get-cardlist', isLoggedIn, Card_controller.get_cardlist);

// 카드 생성하기
router.post('/create-card', isLoggedIn, Card_controller.create_card);

// 엑셀 파일로 카드 생성하기
router.post('/create-card-by-excel', isLoggedIn, upload.single('file'), Card_controller.create_card_by_excel);

// 카드 내용 변경하기
router.post('/update-card', isLoggedIn, Card_controller.update_card);

// 카드 순서 변경하기
router.post('/change-card-order', isLoggedIn, Card_controller.change_card_order);

// 카드 삭제하기
router.post('/delete-card', isLoggedIn, Card_controller.delete_card);

// 복수 카드 삭제하기
router.post('/delete-many-card', isLoggedIn, Card_controller.delete_many_card);

// 다른 인덱스로 복수 카드 이동하기
router.post('/move-many-card', isLoggedIn, Card_controller.move_many_card);

// 이미지 업로드
router.post('/upload_image', isLoggedIn, Card_controller.upload_image);


module.exports = router;
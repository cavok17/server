const express = require('express');

// // 모델 경로
// const User = require('../models/user');
// const Book = require('../models/book');
// const Card = require('../models/card');

// 컨트롤러 경로
const Book_controller = require('../controllers/book');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

// 카테고리 리스트 보여주기
router.get('/get-categorylist', isLoggedIn, Book_controller.get_categorylist);

// 보유한 책 리스트 보여주기
router.get('/get-booklist', isLoggedIn, Book_controller.get_booklist);

// 새 책 생성하기
router.post('/create-book', isLoggedIn, Book_controller.create_book);

// 새 카테고리 생성하기
router.post('/create-category', isLoggedIn, Book_controller.create_category);

// 카테고리 삭제하기
router.post('/delete-category', isLoggedIn, Book_controller.delete_category);

// 카테고리 순서변경하기
router.post('/change-category-order', isLoggedIn, Book_controller.change_category_order);

// 책 삭제하기
router.post('/delete-book', isLoggedIn, Book_controller.delete_book);

// 책 순서변경하기
router.post('/change-book-order', isLoggedIn, Book_controller.change_book_order);

// 책의 카테고리 변경하기
router.post('/move-book-between-category', isLoggedIn, Book_controller.move_book_between_category);

// 즐겨찾기 추가/삭제
router.post('/apply-likebook', isLoggedIn, Book_controller.apply_likebook);

// 즐겨찾기 순서변경하기
router.post('/change-likebook-order', isLoggedIn, Book_controller.change_likebook_order);

// 책 숨김처리하기
router.post('/change-hide-or-show', isLoggedIn, Book_controller.change_hide_or_show);

// 책 이름 변경하기
router.post('/change-book-title', isLoggedIn, Book_controller.change_book_title);

// 카테고리 이름 변경하기
router.post('/change-category-name', isLoggedIn, Book_controller.change_category_name);

// 카테고리 이름 변경하기
router.post('/change-like-config', isLoggedIn, Book_controller.change_like_config);

// 카테고리 이름 변경하기
router.post('/change-hide-config', isLoggedIn, Book_controller.change_hide_config);

// 책 선택하여 시작하기
router.post('/start-write', isLoggedIn, Book_controller.start_write);

module.exports = router;

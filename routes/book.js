const express = require('express');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book');
const Card = require('../models/card');

// 컨트롤러 경로
const Booklist = require('../controllers/book');
const Write = require('../controllers/write');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const category = require('../models/category');


const router = express.Router();

// 카테고리 리스트 보여주기
router.get('/get-categorylist', isLoggedIn, Booklist.get_categorylist);

// 보유한 책 리스트 보여주기
router.get('/get-booklist', isLoggedIn, Booklist.get_booklist);

// 새 책 생성하기
router.post('/create-book', isLoggedIn, Booklist.create_book);

// 새 카테고리 생성하기
router.post('/create-category', isLoggedIn, Booklist.create_category);

// 카테고리 삭제하기
router.post('/delete-category', isLoggedIn, Booklist.delete_category);

// 카테고리 순서변경하기
router.post('/change-category-order', isLoggedIn, Booklist.change_category_order);

// 책 삭제하기
router.post('/delete-book', isLoggedIn, Booklist.delete_book);

// 책 순서변경하기
router.post('/change-book-order', isLoggedIn, Booklist.change_book_order);

// 책의 카테고리 변경하기
router.post('/move-book-between-category', isLoggedIn, Booklist.move_book_between_category);

// 즐겨찾기 추가/삭제
router.post('/apply-likebook', isLoggedIn, Booklist.apply_likebook);

// 즐겨찾기 순서변경하기
router.post('/change-likebook-order', isLoggedIn, Booklist.change_likebook_order);


// // 보유한 책 리스트 보여주기
// router.get('/', isLoggedIn, Write.showbooklist);

// // 새 책 생성 화면 렌더링
// router.get('/newbook', isLoggedIn, (req, res) => res.render('write_newbook'));

// // 새 책 생성 실행
// router.post('/newbook', isLoggedIn, Write.makenewbook);

// // 선택한 책 내용 보여주기 --> 현재 목차 변경으로 redirect
// router.get('/:book_id', isLoggedIn, Write.setindexes);
// router.get('/:book_id/:index_id', isLoggedIn, Write.showcontents);

// // // 새 목차 추가
// router.post('/:book_id/new_index', isLoggedIn, Write.makenewindex);


// // 카드 종류 추가

// // 카드 추가
// router.get('/:book_id/:index_id/newcard', isLoggedIn, async (req, res) => {
//     console.log('새 카드 추가를 요청합니다.');
//     let book_id = req.params.book_id;
//     let index_id = req.params.index_id;
//     let card_position = req.query.card_position;
//     console.log(card_position);
//     res.render('write_newcard',{book_id, index_id, card_position});
// });

// router.post('/:book_id/:index_id/newcard', isLoggedIn, Write.makenewcard);
// //     async (req, res) => {
// //     console.log('새 카드를 추가합니다.');
// //     let tmp_book = await Book.findOne({book_id: req.params.book_id});    

// //     let new_card = new Card();        
// //     new_card.card_id = tmp_book.noofcreatedcard+1;
// //     new_card.book_id = req.params.book_id;
// //     new_card.index_id = req.params.index_id;
// //     new_card.cardtype_id = 'two-face';
// //     // new_card.level = 0;
// //     // new_card.created_date = new Date(),
// //     new_card.recent_study_time = null,
// //     new_card.willstudy_time = null,
// //     new_card.contents = [req.body.front, req.body.back];

// //     tmp_book.noofcreatedcard = tmp_book.noofcreatedcard + 1;
// //     tmp_book = await tmp_book.save()
// //     new_card = await new_card.save();     
// //     res.redirect('/write/'+req.params.book_id+'/'+req.params.index_id);
// // });




module.exports = router;

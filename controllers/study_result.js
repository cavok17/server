const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Mentoring_req = require('../models/mentoring_req');
const Session = require('../models/session');
const Study_result = require('../models/study_result');
const { session } = require("passport");
const study_result = require("../models/study_result");

// 세션 결과를 정리합니다.
exports.create_studyresult= async (req, res) => {    
    console.log("세션 결과를 정리합니다.");
    console.log('body', req.body);

    // 일단 카드리스트를 받아온다규
    let cardlist_studied = req.body.cardlist_studyied
    // 세션 받아와서 일단 저장해부러봐바
    let session = await Session
        .find({_id : req.body.session_id})
        .select('cardlist_total, study_result')    
    session.cardlist_studying = session.cardlist_studying.concat(cardlist_studied)
    

    // 결과를 만들어 보자
    // 시간 데이터를 날짜 데이터로 보정
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_study_time = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_time.setHours(0,0,0,0)
    }

    console.log(cardlist_studied)

    // // 책 종류와 날짜 종류를 발라냄
    // let book_ids = cardlist_studyied.map((cardlist) => cardlist.book_id)
    // book_ids = new Set(book_ids)
    // book_ids = [...book_ids]
    // let study_dates = cardlist_studyied.map((cardlist) => cardlist.recent_study_time)    
    // study_dates = new Set(study_dates)
    // study_dates = [...study_dates]

    // for (book_id of book_ids){
    //     for (study_date of study_dates){
    //         let single_result = {
    //             session_id : null,
    //             book_id : null,
    //             study_date : null,
    //             study_cards : {
    //                 yet : 0,
    //                 ing : 0,
    //                 hold : 0,
    //                 completed : 0                    
    //             },
    //             study_times : {
    //                 total : 0,
    //                 diffi1 : 0,
    //                 diffi2 : 0,
    //                 diffi3 : 0,
    //                 diffi4 : 0,
    //                 diffi5 : 0,
    //             },
    //             study_hour : 0,
    //             exp : 0,
    //             recent_study_time : new Date(0)
    //         }
    //         for(i=0; i<cardlist_studied.lenght; i++){
    //             if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_study_time == study_date ){
    //                 single_result.study_times.total += 1                    
    //                 single_result.study_times[cardlist_studied[i].detail_status.difficulty] += 1                    
    //                 single_result.study_hour += cardlist_studied[i].detail_status.study_hour
    //                 single_result.exp += cardlist_studied[i].detail_status.exp
    //                 if (single_result.recent_study_time < cardlist_studied[i].detail_status.recent_study_time){
    //                     single_result.recent_study_time = cardlist_studied[i].detail_status.recent_study_time
    //                 }
    //                 if (cardlist_studied[i].detail_status.session_study_times === 1){
    //                     let position = session.cardlist_studying.findIndex((cardlist_original) => cardlist_studied[i].card_id == cardlist_original.card_id)
    //                     single_result.study_cards[session.cardlist_studying.status] +=1
    //                 }
    //             }
    //         }

    //         // 해당 세션, 북, 날짜로 스터디리절트가 생성되었으면 업데이트 하고 아니면 생성한다.
    //         let result_by_book = await Study_result.findOne({session_id : req.body.session_id, book_id, study_date})
    //         if (result_by_book){
    //             result_by_book.study_times.total += result.study_times.total
    //             result_by_book.study_times.diffi1 += result.study_times.diffi1
    //             result_by_book.study_times.diffi2 += result.study_times.diffi2
    //             result_by_book.study_times.diffi3 += result.study_times.diffi3
    //             result_by_book.study_times.diffi4 += result.study_times.diffi4
    //             result_by_book.study_times.diffi5 += result.study_times.diffi5
    //             result_by_book.study_hour = result.study_hour
    //             result_by_book.exp = result.exp
    //             result_by_book = await result_by_book.save()
    //         } else {
    //             single_result.session_id = req.body.session_id
    //             single_result.book_id = book_id
    //             single_result.study_date = study_date
    //             let result_of_new = await Study_result.create(single_result)
    //         }

    //         // 북에도 업데이트
    //         let book = await Book.updateOne({_id : book_id},
    //             {$inc : {}})

    //         // 마지막으로 세션 데이터를 업데이트 한다.
    //         session.study_result.study_times.total += result.study_times.total
    //         session.study_result.study_times.diffi1 += result.study_times.diffi1
    //         session.study_result.study_times.diffi2 += result.study_times.diffi2
    //         session.study_result.study_times.diffi3 += result.study_times.diffi3
    //         session.study_result.study_times.diffi4 += result.study_times.diffi4
    //         session.study_result.study_times.diffi5 += result.study_times.diffi5
    //         session.study_result.study_times.study_hour += result.study_hour
    //         session.study_result.study_times.exp += result.exp            
    //     }
    // }

    // session = await session.save()

    // // 카드 정보 업데이트
    // req.body.cardlist_studying.reverse()
    // for (i=1; i<req.body.cardlist_studying.length; i++){
    //     let dup = []
    //     for(j=0; j<i; j++){
    //         if(req.body.cardlist_studying[i]._id === req.body.cardlist_studying[j]._id){
    //             dup.push(i)
    //             break
    //         }
    //     }        
    // }
    // dup.reverse()
    // for (i=0; i<dup.length; i++){
    //     delete req.body.cardlist_studying[i]
    // }
    
    // // 카드 업데이트
    // for (i=0; i<req.body.cardlist_studying.length; i++){
    //     let card = await Card.updateOne(
    //         {_id : req.body.cardlist_studying[i]._id},
    //         {status : req.body.cardlist_studying[i].status,
    //         detail_status : req.body.cardlist_studying[i].detail_status}
    //     )
    // }

    res.json({isloggedIn : true, msg : '성공적'});
}

// 세션 스터디 결과를 보내줍니다.
exports.req_session_studyresult= async (req, res) => {    
    console.log("세션 스터디 결과를 보내줍니다.");
    console.log('body', req.body);
    
    let session = await Session.find({session_id : req.body.session_id})
        .select('study_result')
    let study_results_by_book = await Study_result.find({session_id : req.body.session_id})
    res.json({isloggedIn : true, session, study_results_by_book });
}

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
    let cardlist_studied = req.body.cardlist_studied

    // 세션 받아와서 일단 저장해부러봐바
    let session = await Session
        .findOne({_id : req.body.session_id})
        // .select('cardlist_total, cardlist_studied, study_result')
    // console.log('session.study_result', session)

    if (session.cardlist_studied){
        session.cardlist_studied = session.cardlist_studied.concat(cardlist_studied)
    } else {
        session.cardlist_studied = cardlist_studied
    }
    

    // 결과를 만들어 보자
    // 시간 데이터를 날짜 데이터로 보정
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_study_time = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_time.setHours(0,0,0,0)
        cardlist_studied[i].detail_status.recent_study_time = cardlist_studied[i].detail_status.recent_study_time.toString()        
    }

    // console.log('cardlist_studied', cardlist_studied)

    // 책 종류와 날짜 종류를 발라냄
    let book_ids = cardlist_studied.map((cardlist) => cardlist.book_id)
    book_ids = new Set(book_ids)
    book_ids = [...book_ids]
    let study_dates = cardlist_studied.map((cardlist) => cardlist.detail_status.recent_study_time)    
    study_dates = new Set(study_dates)
    study_dates = [...study_dates]
    
    console.log('book_ids', book_ids)
    console.log('study_dates', study_dates)

    for (book_id of book_ids){
        for (study_date of study_dates){            
            let single_result = {
                session_id : null,
                book_id : null,
                study_date : null,
                study_cards : {
                    yet : 0,
                    ing : 0,
                    hold : 0,
                    completed : 0                    
                },
                study_times : {
                    total : 0,
                    diffi1 : 0,
                    diffi2 : 0,
                    diffi3 : 0,
                    diffi4 : 0,
                    diffi5 : 0,
                },
                study_hour : 0,
                exp : 0,
                recent_study_time : new Date(0)
            }
            // console.log(session.cardlist_total)
            for(i=0; i<cardlist_studied.length; i++){                
                if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_study_time == study_date ){                
                    single_result.study_times.total += 1                                        
                    single_result.study_times[cardlist_studied[i].detail_status.recent_difficulty] += 1                    
                    single_result.study_hour += cardlist_studied[i].detail_status.recent_study_hour
                    single_result.exp += cardlist_studied[i].detail_status.exp
                    if (single_result.recent_study_time < cardlist_studied[i].detail_status.recent_study_time){
                        single_result.recent_study_time = cardlist_studied[i].detail_status.recent_study_time
                    }
                    if (cardlist_studied[i].detail_status.session_study_times === 1){
                        let position = session.cardlist_total.findIndex((cardlist_total) => cardlist_studied[i].card_id == cardlist_total.card_id)
                                        //  let position = cards.findIndex((card) => card._id == req.body.card_ids[i]);            
                        single_result.study_cards[session.cardlist_total[position].status] +=1
                    }
                }
            }

            // console.log(single_result)

            // 해당 세션, 북, 날짜로 스터디리절트가 생성되었으면 업데이트 하고 아니면 생성한다.
            let studyresult_of_book = await Study_result.findOne({session_id : req.body.session_id, book_id, study_date})
            // console.log(studyresult_of_book)
            if (studyresult_of_book){
                studyresult_of_book.study_times.total += single_result.study_times.total
                studyresult_of_book.study_times.diffi1 += single_result.study_times.diffi1
                studyresult_of_book.study_times.diffi2 += single_result.study_times.diffi2
                studyresult_of_book.study_times.diffi3 += single_result.study_times.diffi3
                studyresult_of_book.study_times.diffi4 += single_result.study_times.diffi4
                studyresult_of_book.study_times.diffi5 += single_result.study_times.diffi5
                studyresult_of_book.study_hour = single_result.study_hour
                studyresult_of_book.exp = single_result.exp
                // console.log('1번이냐')
                studyresult_of_book = await result_by_book.save()
            } else {
                // 없으면 single_result에 기본 정보를 생성해서 크리에이트한다.
                // console.log(single_result)
                single_result.session_id = req.body.session_id
                single_result.book_id = book_id
                single_result.study_date = study_date
                // console.log('2번이냐')
                // console.log(single_result)
                studyresult_of_book = await Study_result.create(single_result)
            }

            // // 북에도 업데이트
            // let book = await Book.updateOne({_id : book_id},
            //     {$inc : {}})

            // 마지막으로 세션 데이터를 업데이트 한다.
            session.study_result.study_times.total += single_result.study_times.total
            session.study_result.study_times.diffi1 += single_result.study_times.diffi1
            session.study_result.study_times.diffi2 += single_result.study_times.diffi2
            session.study_result.study_times.diffi3 += single_result.study_times.diffi3
            session.study_result.study_times.diffi4 += single_result.study_times.diffi4
            session.study_result.study_times.diffi5 += single_result.study_times.diffi5
            session.study_result.study_times.study_hour += single_result.study_hour
            session.study_result.study_times.exp += single_result.exp            
        }
    }

    session = await session.save()

    // // 카드 정보 업데이트
    // req.body.cardlist_studied.reverse()
    // let dup = []
    // console.log('111',req.body.cardlist_studied)
    // for (i=1; i< req.body.cardlist_studied.length; i++){
    //     for(j=0; j<i; j++){
    //         if(req.body.cardlist_studied[i]._id === req.body.cardlist_studied[j]._id){
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

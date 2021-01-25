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

    // 처음 저장하면 undefined일 것임
    if (session.cardlist_studied){
        console.log('session.cardlist_studied', session.cardlist_studied)
        session.cardlist_studied = session.cardlist_studied.concat(cardlist_studied)
    } else {
        console.log('session.cardlist_studied', session.cardlist_studied)
        session.cardlist_studied = cardlist_studied
    }
    
    // 시간 데이터를 날짜 데이터로 보정
    // Date로 하니까 중복 제거가 안 됨. 그래서 스트링으로 바꿈
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_study_time = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date.setHours(0,0,0,0)
        cardlist_studied[i].detail_status.recent_study_date = cardlist_studied[i].detail_status.recent_study_date.toString()        
    }

    // 책 종류와 날짜 종류를 발라냄
    let book_ids = cardlist_studied.map((cardlist) => cardlist.book_id)
    book_ids = new Set(book_ids)
    book_ids = [...book_ids]
    let study_dates = cardlist_studied.map((cardlist) => cardlist.detail_status.recent_study_date)    
    study_dates = new Set(study_dates)
    study_dates = [...study_dates]
    
    console.log('book_ids', book_ids)
    console.log('study_dates', study_dates)

    // 책 및 날짜 단위로 데이터를 추출하여 저장함
    for (book_id of book_ids){
        for (study_date of study_dates){            
            let single_result = {
                session_id : null,
                book_id : null,
                study_date : null,
                total : {
                    num_cards : {
                        yet : 0,
                        ing : 0,
                        hold : 0,
                        completed : 0                    
                    },
                    study_cards : {
                        total : 0,
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
                },
                read : {
                    num_cards : {
                        yet : 0,
                        ing : 0,
                        hold : 0,
                        completed : 0                    
                    },
                    study_cards : {
                        total : 0,
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
                },
                flip : {
                    num_cards : {
                        yet : 0,
                        ing : 0,
                        hold : 0,
                        completed : 0                    
                    },
                    study_cards : {
                        total : 0,
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
                },
                
                recent_study_time : new Date(0)
            }
            // console.log(session.cardlist_total)
            for(i=0; i<cardlist_studied.length; i++){                
                if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_study_time == study_date ){                
                    let type
                    switch (cardlist_studied[i].type){
                        case 'read' :
                            type = 'read'
                            break
                        case 'flip-normal' :
                        case 'flip-select' :
                            type = 'flip'
                            break                        
                    }
                    // num_cards를 수정한다.
                    single_result[type].num_cards[cardlist_studied[i].former_status] -= 1
                    single_result[type].num_cards[cardlist_studied[i].status] += 1
                    // 세션 스터디 타임즈가 1인 경우에만 스터디_카드스가 올라간다.
                    if (cardlist_studied[i].detail_status.session_study_times === 1){                        
                        single_result[type].study_cards.total +=1
                        single_result[type].study_cards[cardlist_studied[i].former_status] +=1
                    }
                    single_result[type].study_times.total += 1                                        
                    single_result[type].study_times[cardlist_studied[i].detail_status.recent_difficulty] += 1                    
                    single_result[type].study_hour += cardlist_studied[i].detail_status.recent_study_hour
                    single_result[type].exp += cardlist_studied[i].detail_status.exp
                    // recent_study_time의 최대값을 찾는다.
                    if (single_result.recent_study_time < cardlist_studied[i].detail_status.recent_study_time){
                        single_result.recent_study_time = cardlist_studied[i].detail_status.recent_study_time
                    }
                    
                }
            }
            // 토탈값을 만든다.
            single_result.total.num_cards.yet = single_result.read.num_cards.yet + single_result.flip.num_cards.yet
            single_result.total.num_cards.ing = single_result.read.num_cards.ing + single_result.flip.num_cards.ing
            single_result.total.num_cards.hold = single_result.read.num_cards.hold + single_result.flip.num_cards.hold
            single_result.total.num_cards.completed = single_result.read.num_cards.completed + single_result.flip.num_cards.completed
            single_result.total.study_cards.total = single_result.read.study_cards.total + single_result.flip.study_cards.total
            single_result.total.study_cards.yet = single_result.read.study_cards.yet + single_result.flip.study_cards.yet
            single_result.total.study_cards.ing = single_result.read.study_cards.ing + single_result.flip.study_cards.ing
            single_result.total.study_cards.hold = single_result.read.study_cards.hold + single_result.flip.study_cards.hold
            single_result.total.study_cards.completed = single_result.read.study_cards.completed + single_result.flip.study_cards.completed
            single_result.total.study_times.total = single_result.read.study_times.total + single_result.flip.study_times.total
            single_result.total.study_times.diffi1 = single_result.read.study_times.diffi1 + single_result.flip.study_times.diffi1
            single_result.total.study_times.diffi2 = single_result.read.study_times.diffi2 + single_result.flip.study_times.diffi2
            single_result.total.study_times.diffi3 = single_result.read.study_times.diffi3 + single_result.flip.study_times.diffi3
            single_result.total.study_times.diffi4 = single_result.read.study_times.diffi4 + single_result.flip.study_times.diffi4
            single_result.total.study_times.diffi5 = single_result.read.study_times.diffi5 + single_result.flip.study_times.diffi5
            single_result.total.study_hour = single_result.read.study_hour + single_result.flip.study_hour
            single_result.total.exp = single_result.read.exp + single_result.flip.exp

            // console.log(single_result)

            // 해당 세션, 북, 날짜로 스터디리절트가 생성되어 있으면 업데이트 하고 아니면 생성한다.
            let studyresult_of_book = await Study_result.findOne({session_id : req.body.session_id, book_id, study_date})
            // console.log(studyresult_of_book)
            if (studyresult_of_book){
                studyresult_of_book.total.num_cards.yet += single_result.total.num_cards.yet
                studyresult_of_book.total.num_cards.ing += single_result.total.num_cards.ing
                studyresult_of_book.total.num_cards.hold += single_result.total.num_cards.hold
                studyresult_of_book.total.num_cards.completed += single_result.total.num_cards.completed
                studyresult_of_book.total.study_cards.total += single_result.total.study_cards.total
                studyresult_of_book.total.study_cards.yet += single_result.total.study_cards.yet
                studyresult_of_book.total.study_cards.ing += single_result.total.study_cards.ing
                studyresult_of_book.total.study_cards.hold += single_result.total.study_cards.hold
                studyresult_of_book.total.study_cards.completed += single_result.total.study_cards.completed
                studyresult_of_book.total.study_times.total += single_result.total.study_times.total
                studyresult_of_book.total.study_times.diffi1 += single_result.total.study_times.diffi1
                studyresult_of_book.total.study_times.diffi2 += single_result.total.study_times.diffi2
                studyresult_of_book.total.study_times.diffi3 += single_result.total.study_times.diffi3
                studyresult_of_book.total.study_times.diffi4 += single_result.total.study_times.diffi4
                studyresult_of_book.total.study_times.diffi5 += single_result.total.study_times.diffi5
                studyresult_of_book.total.study_hour += single_result.total.study_hour
                studyresult_of_book.total.exp += single_result.total.exp
                studyresult_of_book.read.num_cards.yet += single_result.read.num_cards.yet
                studyresult_of_book.read.num_cards.ing += single_result.read.num_cards.ing
                studyresult_of_book.read.num_cards.hold += single_result.read.num_cards.hold
                studyresult_of_book.read.num_cards.completed += single_result.read.num_cards.completed
                studyresult_of_book.read.study_cards.total += single_result.read.study_cards.total
                studyresult_of_book.read.study_cards.yet += single_result.read.study_cards.yet
                studyresult_of_book.read.study_cards.ing += single_result.read.study_cards.ing
                studyresult_of_book.read.study_cards.hold += single_result.read.study_cards.hold
                studyresult_of_book.read.study_cards.completed += single_result.read.study_cards.completed
                studyresult_of_book.read.study_times.total += single_result.read.study_times.total
                studyresult_of_book.read.study_times.diffi1 += single_result.read.study_times.diffi1
                studyresult_of_book.read.study_times.diffi2 += single_result.read.study_times.diffi2
                studyresult_of_book.read.study_times.diffi3 += single_result.read.study_times.diffi3
                studyresult_of_book.read.study_times.diffi4 += single_result.read.study_times.diffi4
                studyresult_of_book.read.study_times.diffi5 += single_result.read.study_times.diffi5
                studyresult_of_book.read.study_hour += single_result.read.study_hour
                studyresult_of_book.read.exp += single_result.read.exp
                studyresult_of_book.flip.num_cards.yet += single_result.flip.num_cards.yet
                studyresult_of_book.flip.num_cards.ing += single_result.flip.num_cards.ing
                studyresult_of_book.flip.num_cards.hold += single_result.flip.num_cards.hold
                studyresult_of_book.flip.num_cards.completed += single_result.flip.num_cards.completed
                studyresult_of_book.flip.study_cards.total += single_result.flip.study_cards.total
                studyresult_of_book.flip.study_cards.yet += single_result.flip.study_cards.yet
                studyresult_of_book.flip.study_cards.ing += single_result.flip.study_cards.ing
                studyresult_of_book.flip.study_cards.hold += single_result.flip.study_cards.hold
                studyresult_of_book.flip.study_cards.completed += single_result.flip.study_cards.completed
                studyresult_of_book.flip.study_times.total += single_result.flip.study_times.total
                studyresult_of_book.flip.study_times.diffi1 += single_result.flip.study_times.diffi1
                studyresult_of_book.flip.study_times.diffi2 += single_result.flip.study_times.diffi2
                studyresult_of_book.flip.study_times.diffi3 += single_result.flip.study_times.diffi3
                studyresult_of_book.flip.study_times.diffi4 += single_result.flip.study_times.diffi4
                studyresult_of_book.flip.study_times.diffi5 += single_result.flip.study_times.diffi5
                studyresult_of_book.flip.study_hour += single_result.flip.study_hour
                studyresult_of_book.flip.exp += single_result.flip.exp
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

            // 북에도 업데이트
            let book = await Book.updateOne({_id : book_id},
                {$inc : {
                    'num_cards.total.yet' : single_result.total.num_cards.yet,
                    'num_cards.total.ing' : single_result.total.num_cards.ing,
                    'num_cards.total.hold' : single_result.total.num_cards.hold,
                    'num_cards.total.completed' : single_result.total.num_cards.completed,
                    'result.total.study_times.total' : single_result.total.study_times.total,
                    'result.total.study_times.diff1' : single_result.total.study_times.diff1,
                    'result.total.study_times.diff2' : single_result.total.study_times.diff2,
                    'result.total.study_times.diff3' : single_result.total.study_times.diff3,
                    'result.total.study_times.diff4' : single_result.total.study_times.diff4,
                    'result.total.study_times.diff5' : single_result.total.study_times.diff5,
                    'num_cards.read.yet' : single_result.read.num_cards.yet,
                    'num_cards.read.ing' : single_result.read.num_cards.ing,
                    'num_cards.read.hold' : single_result.read.num_cards.hold,
                    'num_cards.read.completed' : single_result.read.num_cards.completed,
                    'result.read.study_times.total' : single_result.read.study_times.total,
                    'result.read.study_times.diff1' : single_result.read.study_times.diff1,
                    'result.read.study_times.diff2' : single_result.read.study_times.diff2,
                    'result.read.study_times.diff3' : single_result.read.study_times.diff3,
                    'result.read.study_times.diff4' : single_result.read.study_times.diff4,
                    'result.read.study_times.diff5' : single_result.read.study_times.diff5,
                    'num_cards.flip.yet' : single_result.flip.num_cards.yet,
                    'num_cards.flip.ing' : single_result.flip.num_cards.ing,
                    'num_cards.flip.hold' : single_result.flip.num_cards.hold,
                    'num_cards.flip.completed' : single_result.flip.num_cards.completed,
                    'result.flip.study_times.total' : single_result.flip.study_times.total,
                    'result.flip.study_times.diff1' : single_result.flip.study_times.diff1,
                    'result.flip.study_times.diff2' : single_result.flip.study_times.diff2,
                    'result.flip.study_times.diff3' : single_result.flip.study_times.diff3,
                    'result.flip.study_times.diff4' : single_result.flip.study_times.diff4,
                    'result.flip.study_times.diff5' : single_result.flip.study_times.diff5,
                    'result.total.study_hour' : single_result.total.study_hour,
                    'result.read.study_hour' : single_result.read.study_hour,
                    'result.flip.study_hour' : single_result.flip.study_hour,
                    'result.total.exp' : single_result.total.exp,
                    'result.read.exp' : single_result.read.exp,
                    'result.flip.exp' : single_result.flip.exp,
                }}, {recent_study_time : new Date(study_date)})

            // 마지막으로 세션 데이터를 업데이트 한다.
            session.study_result.total.study_cards.total += single_result.total.study_cards.total
            session.study_result.total.study_cards.yet += single_result.total.study_cards.yet
            session.study_result.total.study_cards.ing += single_result.total.study_cards.ing
            session.study_result.total.study_cards.hold += single_result.total.study_cards.hold
            session.study_result.total.study_cards.completed += single_result.total.study_cards.completed
            session.study_result.read.study_cards.total += single_result.read.study_cards.total
            session.study_result.read.study_cards.yet += single_result.read.study_cards.yet
            session.study_result.read.study_cards.ing += single_result.read.study_cards.ing
            session.study_result.read.study_cards.hold += single_result.read.study_cards.hold
            session.study_result.read.study_cards.completed += single_result.read.study_cards.completed
            session.study_result.flip.study_cards.total += single_result.flip.study_cards.total
            session.study_result.flip.study_cards.yet += single_result.flip.study_cards.yet
            session.study_result.flip.study_cards.ing += single_result.flip.study_cards.ing
            session.study_result.flip.study_cards.hold += single_result.flip.study_cards.hold
            session.study_result.flip.study_cards.completed += single_result.flip.study_cards.completed
            session.study_result.total.study_times.total += single_result.total.study_times.total
            session.study_result.total.study_times.diffi1 += single_result.total.study_times.diffi1
            session.study_result.total.study_times.diffi2 += single_result.total.study_times.diffi2
            session.study_result.total.study_times.diffi3 += single_result.total.study_times.diffi3
            session.study_result.total.study_times.diffi4 += single_result.total.study_times.diffi4
            session.study_result.total.study_times.diffi5 += single_result.total.study_times.diffi5
            session.study_result.read.study_times.total += single_result.read.study_times.total
            session.study_result.read.study_times.diffi1 += single_result.read.study_times.diffi1
            session.study_result.read.study_times.diffi2 += single_result.read.study_times.diffi2
            session.study_result.read.study_times.diffi3 += single_result.read.study_times.diffi3
            session.study_result.read.study_times.diffi4 += single_result.read.study_times.diffi4
            session.study_result.read.study_times.diffi5 += single_result.read.study_times.diffi5
            session.study_result.flip.study_times.total += single_result.flip.study_times.total
            session.study_result.flip.study_times.diffi1 += single_result.flip.study_times.diffi1
            session.study_result.flip.study_times.diffi2 += single_result.flip.study_times.diffi2
            session.study_result.flip.study_times.diffi3 += single_result.flip.study_times.diffi3
            session.study_result.flip.study_times.diffi4 += single_result.flip.study_times.diffi4
            session.study_result.flip.study_times.diffi5 += single_result.flip.study_times.diffi5
            session.study_result.total.study_hour += single_result.total.study_hour
            session.study_result.read.study_hour += single_result.read.study_hour
            session.study_result.flip.study_hour += single_result.flip.study_hour
            session.study_result.total.exp += single_result.total.exp            
            session.study_result.read.exp += single_result.read.exp            
            session.study_result.flip.exp += single_result.flip.exp            
        }
    }

    session = await session.save()

    // 카드 정보 업데이트
        // 중복부터 제거함
    req.body.cardlist_studied.reverse()
    let dup = []
    console.log('111',req.body.cardlist_studied)
    for (i=1; i< req.body.cardlist_studied.length; i++){
        for(j=0; j<i; j++){
            if(req.body.cardlist_studied[i]._id === req.body.cardlist_studied[j]._id){
                dup.push(i)
                break
            }
        }        
    }
    dup.reverse()
    for (i=0; i<dup.length; i++){
        delete req.body.cardlist_studied[i]
    }
    
    // 카드 업데이트
    for (i=0; i<req.body.cardlist_studied.length; i++){
        let card = await Card.updateOne(
            {_id : req.body.cardlist_studied[i]._id},
            {status : req.body.cardlist_studied[i].status,
            detail_status : req.body.cardlist_studied[i].detail_status}
        )
    }

    res.json({isloggedIn : true, msg : '성공적'});
}

// 세션 스터디 결과를 보내줍니다.
exports.req_session_studyresult= async (req, res) => {    
    console.log("세션 스터디 결과를 보내줍니다.");
    console.log('body', req.body);
    
    let session = await Session.find({session_id : req.body.session_id})
        .select('study_result')
    let study_results_by_book = await Study_result.find({session_id : req.body.session_id})
        .sort({session_id : 1})
    res.json({isloggedIn : true, session, study_results_by_book });
}

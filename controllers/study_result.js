const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Mentoring_req = require('../models/mentoring_req');
const Session = require('../models/session');
const { session } = require("passport");

// 세션 결과를 정리합니다.
exports.create_study_result= async (req, res) => {    
    console.log("세션 결과를 정리합니다.");
    console.log('body', req.body);

    let session = await Session
        .find({_id : req.body.session_id})
        .select({cardlist_studying, study_result})
    
    session.cardlist_studying = session.cardlist_studying.concat(req.body.cardlist_studying)

    // 북에 업데이트
    let booklist = session.cardlist_studying.map((cardlist) => cardlist.book_id)
    booklist = new Set(booklist)
    booklist = [...booklist]

    for (book_id of booklist){
        let result = {
            study_times = {
                total : 0,
                diffi1 : 0,
                diffi2 : 0,
                diffi3 : 0,
                diffi4 : 0,
                diffi5 : 0,
            },
            study_hour = 0,
            exp = 0
        }
        for (i=0; i<req.body.cardlist_studying.length; i++){
            result.study_times.total += 1
            result.study_times[req.body.cardlist_studying[i].detail_status.recent_difficulty] +=1
            result.study_hour += req.body.cardlist_studying[i].detail_status.study_hour
            result.exp += req.body.cardlist_studying[i].detail_status.exp
        }

        let book = await Book.update({_id : book_id},{result})
        
        session.study_result.study_times.total += result.study_times.total
        session.study_result.study_times.diffi1 += result.study_times.diffi1
        session.study_result.study_times.diffi2 += result.study_times.diffi2
        session.study_result.study_times.diffi3 += result.study_times.diffi3
        session.study_result.study_times.diffi4 += result.study_times.diffi4
        session.study_result.study_times.diffi5 += result.study_times.diffi5
        session.study_result.study_times.study_hour += result.study_hour
        session.study_result.study_times.exp += result.exp
    }

    // 카드 정보 업데이트
    // 중복 제거
    req.body.cardlist_studying.reverse()
    for (i=1; i<req.body.cardlist_studying.length; i++){
        let dup = []
        for(j=0; j<i; j++){
            if(req.body.cardlist_studying[i]._id === req.body.cardlist_studying[j]._id){
                dup.push(i)
                break
            }
        }        
    }
    dup.reverse()
    for (i=0; i<dup.length; i++){
        delete req.body.cardlist_studying[i]
    }
    
    // 세션 업데이트
    session = await session.save()

    // 카드 업데이트
    for (i=0; i<req.body.cardlist_studying.length; i++){
        let card = await Card.updateOne(
            {_id : req.body.cardlist_studying[i]._id},
            {status : req.body.cardlist_studying[i].status,
            detail_status : req.body.cardlist_studying[i].detail_status}
        )
    }
}

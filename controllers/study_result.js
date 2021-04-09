const mongoose = require("mongoose");
const regression = require('regression')
const fetch = require('node-fetch')


// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Mentoring_req = require('../models/mentoring_req');
const Session = require('../models/session');
const Level_config = require('../models/level_config');
const Study_result = require('../models/study_result');
const { session } = require("passport");
const study_result = require("../models/study_result");
const { result } = require("lodash");

// 회귀분석하는 거
// 책 단위로 해야 함
const execute_regression =  async (book_id, regression_array) => {   

    // 일단 데이터를 저장해야 하는데... 레벨 콘피그를 받고
    let level_config = await Level_config.findOne({book_id : book_id})
    
    let body = {book_id, regression_array, level_config}
    fetch('https://n2e7kwpfb2.execute-api.ap-northeast-2.amazonaws.com/default/regression',{
        method : 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    .then (res => res.json())
    .then (json => {
        console.log(json)
        level_config = json.level_config
    })
    console.log(level_config)
    await level_config.save()
    return    
}

const original_update =  async (cardlist_studied) => {   
    for (i=0 ; i<cardlist_studied.length; i++){        
        let contact_history = {
            recent_select_time : cardlist_studied[i].detail_status.recent_select_time,
            recent_selection  : cardlist_studied[i].detail_status.recent_selection,
            recent_stay_hour : cardlist_studied[i].detail_status.recent_stay_hour
        }
        let card = await Card.updateOne(        
            {_id : cardlist_studied[i]._id},
            {status : cardlist_studied[i].status,
            detail_status : cardlist_studied[i].detail_status,
            $push : {contact_history : contact_history}}
        )               
    }
    return
}



// 세션 결과를 분석합니다.
exports.create_studyresult= async (req, res) => {    
    console.log("세션 결과를 정리합니다.");
    console.log('body', req.body);

    // 원본을 바꿔줌
    await original_update(req.body.cardlist_studied)    

    // 만약 학습 완료가 아니면 저장만 하고 탈출한다.
    if (req.body.status !='finished') {
        let cardlist_studied_upload = await Session.updateOne(
            {_id : req.body.session_id},
            {$push : {cardlist_studied : {$each : req.body.cardlist_studied}}}
        )
        
        res.json({isloggedIn : true, msg : '성공적'});
        return
    }

    // 세션에서 전체 카드리스트 스터디드를 받아와서 미반영분만 발라낸다.
    let session = await Session
        .findOne({_id : req.body.session_id})
        .select('cardlist_studied')
    session.cardlist_studied = session.cardlist_studied.concat(req.body.cardlist_studied)    
    let cardlist_studied = session.cardlist_studied.filter((cardlist) => cardlist.result_include_yeobu === 'no')

    // 임시로 저장을 좀 허자
    await session.save()



// -----------------------카드리스트 스터디드 편집 ---------------------------------    
    // 날짜 단위로 학습 결과가 정리되어야 하므로 날짜 데이터를 생성해줌        
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_select_time = new Date(cardlist_studied[i].detail_status.recent_select_time)
        cardlist_studied[i].detail_status.recent_select_date = new Date(cardlist_studied[i].detail_status.recent_select_time)
        cardlist_studied[i].detail_status.recent_select_date.setHours(0,0,0,0)        
    }

    // 학습 결과를 정리할 단위(책, 날짜)를 만들어줍니다. 
    // object_id, date 객체는 set으로 중복제거가 안 됨. string으로 변환함
    let book_ids = cardlist_studied.map((cardlist) => cardlist.book_id)
    for (i=0; i<book_ids.length; i++){
        book_ids[i] = String(book_ids[i])
    }
    book_ids = [...new Set(book_ids)]    

    let select_dates = cardlist_studied.map((cardlist) => cardlist.detail_status.recent_select_date)    
    for (i=0; i<select_dates.length; i++){
        select_dates[i] = String(select_dates[i])
    }    
    select_dates = [...new Set(select_dates)]
    


    let single_result = new Study_result
    // 책 및 날짜 단위로 데이터를 추출하여 저장함
    for (book_id of book_ids){        
        for (select_date of select_dates){   
            for (i=0; i<cardlist_studied.length; i++){
                // book_id 및 날짜가 일치하는 데이터만 집계한다.
                if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_select_date == select_date ){                                
                    // 클릭 횟수를 집계한다.
                    single_result.num_click.total +=1
                    single_result.stay_hour.total += cardlist_studied[i].detail_status.recent_stay_hour                    
                    single_result.num_click[cardlist_studied[i].detail_status.recent_selection] +=1
                    single_result.stay_hour[cardlist_studied[i].detail_status.recent_selection] += cardlist_studied[i].detail_status.recent_stay_hour
                    // if(['short', 'long', 'know', 'pass', 'hold', 'completed'].includes(cardlist_studied[i].detail_status.recent_selection)){
                    // }
                    
                    // status 변화를 집계한다. 포머 상태와 현재 상태가 다른 경우만
                    if (cardlist_studied[i].former_status != cardlist_studied[i].status){
                        single_result.num_cards.status_change[cardlist_studied[i].former_status].minus -= 1
                        single_result.num_cards.status_change[cardlist_studied[i].status].plus += 1
                    }
                    // 학습 시작된 카드를 집계한다. 선택-투입-시작-완료(탈출, 패스, 완료전환, 보류전환)
                    if (cardlist_studied[i].detail_status.session_study_times === 1){                        
                        single_result.num_cards.started[cardlist_studied[i].original_status]+= 1
                    }
                    if (cardlist_studied[i].detail_status.status_in_session === 'off'){                        
                        single_result.num_cards.finished[cardlist_studied[i].original_status]+= 1
                    }
                        // 복구되는 경우가 조금 애매하다.
                        // recent_study_time이 null이면 yet으로 복구, 아니면 ing으로 복구
                    if (cardlist_studied[i].detail_status.recent_selection === 'restore'){
                        if (cardlist_studied[i].detail_status.recent_study_time == null){
                            single_result.num_cards.finished.yet -= 1
                        } else {
                            single_result.num_cards.finished.ing -= 1
                        }                    
                    }

                    // 레벨 변화도 집계하고
                    if (cardlist_studied[i].detail_status.recent_selection === 'know'||cardlist_studied[i].detail_status.recent_selection === 'completed'){                    
                        single_result.total_level_change += cardlist_studied[i].detail_status.level-cardlist_studied[i].detail_status.formal_level
                    }
                }
            }  
            
            console.log(single_result)
    
            // 단일 조건(book_id, 날짜)에 대한 집계가 완료되면 저장한다.
            let studyresult_of_book = await Study_result.findOne(
                {session_id : req.body.session_id, book_id, select_date},
                {select : 'session_id'})
                
            if (studyresult_of_book === null){
                single_result.session_id = req.body.session_id
                single_result.book_id = book_id
                single_result.study_date = select_date
                studyresult_of_book = await Study_result.create(single_result)
            } else {
                studyresult_of_book = await Study_result.updateOne(
                    {session_id : req.body.session_id, book_id, select_date},
                    {$inc : {
                        // 'num_cards.status_change.total.plus' : single_result.status_change.total.plus,
                        // 'num_cards.status_change.total.minus' : single_result.status_change.total.minus,
                        'num_cards.status_change.yet.plus' : single_result.status_change.yet.plus,
                        'num_cards.status_change.yet.minus' : single_result.status_change.yet.minus,
                        'num_cards.status_change.ing.plus' : single_result.status_change.ing.plus,
                        'num_cards.status_change.ing.minus' : single_result.status_change.ing.minus,
                        'num_cards.status_change.hold.plus' : single_result.status_change.hold.plus,
                        'num_cards.status_change.hold.minus' : single_result.status_change.hold.minus,
                        'num_cards.status_change.completed.plus' : single_result.status_change.completed.plus,
                        'num_cards.status_change.completed.minus' : single_result.status_change.completed.minus,
                        'num_cards.started.yet' : single_result.num_cards.started.yet,
                        'num_cards.started.ing' : single_result.num_cards.started.ing,
                        'num_cards.started.hold' : single_result.num_cards.started.hold,
                        'num_cards.started.completed' : single_result.num_cards.started.completed,
                        'num_cards.finished.yet' : single_result.num_cards.finished.yet,
                        'num_cards.finished.ing' : single_result.num_cards.finished.ing,
                        'num_cards.finished.hold' : single_result.num_cards.finished.hold,
                        'num_cards.finished.completed' : single_result.num_cards.finished.completed,
                        'num_click.total' : single_result.num_click.total ,
                        'num_click.short' : single_result.num_click.short ,
                        'num_click.long' : single_result.num_click.long ,
                        'num_click.know' : single_result.num_click.know ,
                        'num_click.hold' : single_result.num_click.hold ,
                        'num_click.completed' : single_result.num_click.completed ,
                        'num_click.pass' : single_result.num_click.pass ,
                        'num_click.restore' : single_result.num_click.restore ,
                        'num_click.back' : single_result.num_click.back ,
                        'num_click.move' : single_result.num_click.move ,
                        'num_click.finish' : single_result.num_click.finish ,
                        'stay_hour.total' : single_result.stay_hour.total ,
                        'stay_hour.short' : single_result.stay_hour.short ,
                        'stay_hour.long' : single_result.stay_hour.long ,
                        'stay_hour.know' : single_result.stay_hour.know ,
                        'stay_hour.hold' : single_result.stay_hour.hold ,
                        'stay_hour.completed' : single_result.stay_hour.completed ,
                        'stay_hour.pass' : single_result.stay_hour.pass ,
                        'stay_hour.restore' : single_result.stay_hour.restore ,
                        'stay_hour.back' : single_result.stay_hour.back ,
                        'stay_hour.move' : single_result.stay_hour.move ,
                        'stay_hour.finish' : single_result.stay_hour.finish ,                
                        'level_change' : single_result.level_change
                    }}
                )
            }

            // 북에도 업데이트 한다.
            let book = await Book.updateOne({_id : book_id},
                {$inc : 
                    {
                        'result.num_click.total' : single_result.num_click.total ,
                        'result.num_click.short' : single_result.num_click.short ,
                        'result.num_click.long' : single_result.num_click.long ,
                        'result.num_click.know' : single_result.num_click.know ,
                        'result.num_click.hold' : single_result.num_click.hold ,
                        'result.num_click.completed' : single_result.num_click.completed ,
                        'result.num_click.pass' : single_result.num_click.pass ,
                        'result.num_click.restore' : single_result.num_click.restore ,
                        'result.num_click.back' : single_result.num_click.back ,
                        'result.num_click.move' : single_result.num_click.move ,
                        'result.num_click.finish' : single_result.num_click.finish ,
                        'result.stay_hour.total' : single_result.stay_hour.total ,
                        'result.stay_hour.short' : single_result.stay_hour.short ,
                        'result.stay_hour.long' : single_result.stay_hour.long ,
                        'result.stay_hour.know' : single_result.stay_hour.know ,
                        'result.stay_hour.hold' : single_result.stay_hour.hold ,
                        'result.stay_hour.completed' : single_result.stay_hour.completed ,
                        'result.stay_hour.pass' : single_result.stay_hour.pass ,
                        'result.stay_hour.restore' : single_result.stay_hour.restore ,
                        'result.stay_hour.back' : single_result.stay_hour.back ,
                        'result.stay_hour.move' : single_result.stay_hour.move ,
                        'result.stay_hour.finish' : single_result.stay_hour.finish ,                
                        'result.level_change' : single_result.level_change
                    }
                }, {
                recent_study_time : new Date(select_date)
            })
        }
    }    

    res.json({isloggedIn : true, msg : '성공적'});
    
    // 카드리스트 스터디드에 결과 반영 여부를 yes로 바까준다.
    session = await session.updateOne(
        {_id : req.body.session_id},
        {$set : {"cardlist_studied.$[].result_include_yeobu" : 'yes'}}
    )

    ////////////////////////////////////// 회귀분석 //////////////////////////////////////    
    for (book_id of book_ids){   
        let regression_array = []
        for (i=0; i<cardlist_studied.length; i++){
            if (cardlist_studied[i].detail_status.recent_selection === 'know'){
                let single_array = [cardlist_studied[i].detail_status.retention_for_regression, cardlist_studied[i].detail_status.studytimes_for_regression]
                regression_array.push(single_array)
            }
        }
        // console.log(regression_array)
    await execute_regression(book_id, regression_array)
    }    
}



// 세션 스터디 결과를 보내줍니다.
exports.req_session_studyresult= async (req, res) => {    
    console.log("세션 스터디 결과를 보내줍니다.");
    console.log('body', req.body);
    
    // let session = await Session.findOne({_id : req.body.session_id})
    //     .select('study_result')
    let study_results_by_book = await Study_result.find({session_id : req.body.session_id})
        .sort({session_id : 1})
        .populate({path : 'book_id', select : 'title'})

    let study_results_by_session = new Study_result()
    // let study_results_by_session = {}

    for (i=0; i<study_results_by_book.length; i++){        
        // study_results_by_session.status_change.total.plus +=  study_results_by_book[i].status_change.total.plus,
        // study_results_by_session.status_change.total.minus +=  study_results_by_book[i].status_change.total.minus,
        study_results_by_session.num_cards.status_change.yet.plus +=  study_results_by_book[i].num_cards.status_change.yet.plus,
        study_results_by_session.num_cards.status_change.yet.minus +=  study_results_by_book[i].num_cards.status_change.yet.minus,
        study_results_by_session.num_cards.status_change.ing.plus +=  study_results_by_book[i].num_cards.status_change.ing.plus,
        study_results_by_session.num_cards.status_change.ing.minus +=  study_results_by_book[i].num_cards.status_change.ing.minus,
        study_results_by_session.num_cards.status_change.hold.plus +=  study_results_by_book[i].num_cards.status_change.hold.plus,
        study_results_by_session.num_cards.status_change.hold.minus +=  study_results_by_book[i].num_cards.status_change.hold.minus,
        study_results_by_session.num_cards.status_change.completed.plus +=  study_results_by_book[i].num_cards.status_change.completed.plus,
        study_results_by_session.num_cards.status_change.completed.minus +=  study_results_by_book[i].num_cards.status_change.completed.minus,
        study_results_by_session.num_cards.started.yet +=  study_results_by_book[i].num_cards.started.yet,
        study_results_by_session.num_cards.started.ing +=  study_results_by_book[i].num_cards.started.ing,
        study_results_by_session.num_cards.started.hold +=  study_results_by_book[i].num_cards.started.hold,
        study_results_by_session.num_cards.started.completed +=  study_results_by_book[i].num_cards.started.completed,
        study_results_by_session.num_cards.finished.yet +=  study_results_by_book[i].num_cards.finished.yet,
        study_results_by_session.num_cards.finished.ing +=  study_results_by_book[i].num_cards.finished.ing,
        study_results_by_session.num_cards.finished.hold +=  study_results_by_book[i].num_cards.finished.hold,
        study_results_by_session.num_cards.finished.completed +=  study_results_by_book[i].num_cards.finished.completed,
        study_results_by_session.num_click.total +=  study_results_by_book[i].num_click.total,
        study_results_by_session.num_click.short +=  study_results_by_book[i].num_click.short,
        study_results_by_session.num_click.long +=  study_results_by_book[i].num_click.long,
        study_results_by_session.num_click.know +=  study_results_by_book[i].num_click.know,
        study_results_by_session.num_click.hold +=  study_results_by_book[i].num_click.hold,
        study_results_by_session.num_click.completed +=  study_results_by_book[i].num_click.completed,
        study_results_by_session.num_click.pass +=  study_results_by_book[i].num_click.pass,
        study_results_by_session.num_click.restore +=  study_results_by_book[i].num_click.restore,
        study_results_by_session.num_click.back +=  study_results_by_book[i].num_click.back,
        study_results_by_session.num_click.move +=  study_results_by_book[i].num_click.move,
        study_results_by_session.num_click.finish +=  study_results_by_book[i].num_click.finish,
        study_results_by_session.stay_hour.total +=  study_results_by_book[i].stay_hour.total,
        study_results_by_session.stay_hour.short +=  study_results_by_book[i].stay_hour.short,
        study_results_by_session.stay_hour.long +=  study_results_by_book[i].stay_hour.long,
        study_results_by_session.stay_hour.know +=  study_results_by_book[i].stay_hour.know,
        study_results_by_session.stay_hour.hold +=  study_results_by_book[i].stay_hour.hold,
        study_results_by_session.stay_hour.completed +=  study_results_by_book[i].stay_hour.completed,
        study_results_by_session.stay_hour.pass +=  study_results_by_book[i].stay_hour.pass,
        study_results_by_session.stay_hour.restore +=  study_results_by_book[i].stay_hour.restore,
        study_results_by_session.stay_hour.back +=  study_results_by_book[i].stay_hour.back,
        study_results_by_session.stay_hour.move +=  study_results_by_book[i].stay_hour.move,
        study_results_by_session.stay_hour.finish +=  study_results_by_book[i].stay_hour.finish,
        study_results_by_session.level_change +=  study_results_by_book[i].level_change
    }
    
    res.json({isloggedIn : true, session, study_results_by_book, study_results_by_session });
}

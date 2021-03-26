const mongoose = require("mongoose");

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
const level_config = require("../models/level_config");
const { result } = require("lodash");

// 회귀분석하는 거
// 책 단위로 해야 함
const execute_regression =  async (book_id, regression_array) => {   
        
    // 일단 데이터를 저장해야 하는데... 레벨 콘피그를 받고
    let level_config = await Level_config.findOne({book_id : book_id})

    // 처음에는 regression 돌릴 데이터가 없으므로 데이터를 생성해준다.
    if (level_config.regression_data.length === []) {
        let regression_basis
        for (i=1; i<level_config.retention_count_curve.b; i++){
            let single_array = [(i-level_config.retention_count_curve.b)/level_config.retention_count_curve.a,i]
            regression_basis.push(single_array)
        }
        for (i=0; i<Math.ceil(500/(level_config.retention_count_curve.b-1)); i++) {
            level_config.regression_data.push(regression_basis)
        }        
    }
    console.log(level_config.regression_data)
    
    // 그 다음 regression 돌릴 데이터만 남긴다.
    level_config.regression_data = level_config.regression_data.concat(regression_array)
    if (level_config.regression_data.length >level_config.regression_sample_count) {
        level_config.regression_data.splice(0,level_config.regression_data.length-level_config.regression_sample_count)
    }

    // 이제 regression을 돌린다.
    // original
    let result = regression.linear(level_config.regression_source.data.length)
    regression_result.original ={
        a : result.equation[0],
        b : result.equation[1],
        r_value : result.r2
    }
    // log
    result = regression.logarithmic(level_config.regression_source.data.length)
    regression_result.log ={
        gradient : result.equation[0],
        yintercept : result.equation[1],
        r_value : result.r2
    }
    // exponential
    result = regression.exponential(level_config.regression_source.data.length)
    regression_result.exp ={
        gradient : result.equation[0],
        yintercept : result.equation[1],
        r_value : result.r2
    }


    // 최소값을 찾아 retention_count_curve를 확정한다.    
    if (regression_object.original.r_value > regression_object.log.r_value){
        retention_count_curve.type = 'original'
    } else {
        retention_count_curve.type = 'log'
    }
    if (regression_object[retention_count_curve.type].r_value > regression_object.exp.r_value){        
    } else {
        retention_count_curve.type = 'exp'
    }
    retention_count_curve.a = regression_result[retention_count_curve.type].a
    retention_count_curve.b = regression_result[retention_count_curve.type].b
    retention_count_curve.r_value = regression_result[retention_count_curve.type].r_value

    level_config.save()
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

    // 카드리스트 스터디드를 업로드 한다.
    // 만약 학습 완료가 아니면 저장만 하고 탈출한다.
    if (req.body.status !='finished') {
        let cardlist_studied_upload = await Session.updateOne(
            {_id : req.body.session_id},
            {$push : {cardlist_studied : {$each : req.body.cardlist_studied}}}
        )
        
        // 원본을 바꾸는 작업이 필요함
        await original_update(req.body.cardlist_studied)    
    
        return
    }

    // 세션에서 전체 카드리스트 스터디드를 받아와서 미반영분만 발라낸다.
    let session = await Session
        .findOne({_id : req.body.session_id})
        .select('cardlist_studied')
    session.cardlist_studied = session.cardlist_studied.concat(req.body.cardlist_studied)    
    let cardlist_studied = session.cardlist_studied.filter((cardlist) => cardlist.result_include_yeobu === 'no')



// -----------------------카드리스트 스터디드 편집 ---------------------------------    
    // 날짜 단위로 학습 결과가 정리되어야 하므로 날짜 데이터를 생성해줌    
    // Date 객체로 하니까 중복 제거가 안 됨. 그래서 스트링으로 바꿈
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_study_time = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date.setHours(0,0,0,0)
        cardlist_studied[i].detail_status.recent_study_date = cardlist_studied[i].detail_status.recent_study_date.toString()
    }

    // 학습 결과를 정리할 단위(책, 날짜)를 만들어줍니다.
    let book_ids = cardlist_studied.map((cardlist) => cardlist.book_id)
    book_ids = [...new Set(book_ids)]    
    let study_dates = cardlist_studied.map((cardlist) => cardlist.detail_status.recent_study_date)    
    study_dates = [...new Set(study_dates)]


    let single_result = new Study_result
    // 책 및 날짜 단위로 데이터를 추출하여 저장함
    for (book_id of book_ids){        
        for (study_date of study_dates){   
        
            // book_id 및 날짜가 일치하는 데이터만 집계한다.
            if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_study_date == study_date ){                                
                // status 변화를 집계한다. 포머 상태와 현재 상태가 다른 경우만
                if (cardlist_studied[i].former_status != cardlist_studied[i].status){
                    single_result.status_change[cardlist_studied[i].former_status].minus -= 1
                    single_result.status_change[cardlist_studied[i].status].plus += 1
                }
                // 학습 시작된 카드를 집계한다. 선택-투입-시작-완료(탈출, 패스, 완료전환, 보류전환)
                if (cardlist_studied[i].detail_status.session_study_times === 1){                        
                    single_result.num_cards.started +=1                        
                }
                
                // 완료된 카드를 집계한다.
                if(['know', 'hold', 'completed'].includes(cardlist_studied[i].detail_status.recent_selection)){
                    single_result.num_cards.finished.total +=1
                    single_result.num_cards.finished[cardlist_studied[i].detail_status.recent_selection] +=1
                }

                // 클릭 횟수를 집계한다.
                // if(['short', 'long', 'know', 'pass', 'hold', 'completed'].includes(cardlist_studied[i].detail_status.recent_selection)){
                    single_result.num_click.total +=1
                    single_result.num_click.[cardlist_studied[i].detail_status.recent_selection] +=1
                                    
                // }
                
                // 학습 시간을 집계하고
                if (cardlist_studied[i].detail_status.recent_selection != 'restore'){
                    single_result.selection_stats.total.count +=1
                    single_result.selection_stats[cardlist_studied[i].detail_status.recent_selection].count +=1
                    single_result.selection_stats.total.hour += cardlist_studied[i].detail_status.study_hour
                    single_result.selection_stats[cardlist_studied[i].detail_status.recent_selection].count +=cardlist_studied[i].detail_status.study_hour
                }

                // 레벨 변화도 집계하고
                if (cardlist_studied[i].detail_status.recent_selection != 'know'){                    
                    single_result.level_change += cardlist_studied[i].detail_status.level-cardlist_studied[i].detail_status.formal_level
                }
            }
        }
    }
//         // 단일 조건(book_id, 날짜)에 대한 집계가 완료되면 저장한다.
//         let studyresult_of_book = await Study_result.updateOne(
//             {session_id : req.body.session_id, book_id, study_date},
//             {$inc : {
//                 'status_change.total.plus' : single_result.status_change.total.plus,
//                 'status_change.total.minus' : single_result.status_change.total.minus,
//                 'status_change.yet.plus' : single_result.status_change.yet.plus,
//                 'status_change.yet.minus' : single_result.status_change.yet.minus,
//                 'status_change.ing.plus' : single_result.status_change.ing.plus,
//                 'status_change.ing.minus' : single_result.status_change.ing.minus,
//                 'status_change.hold.plus' : single_result.status_change.hold.plus,
//                 'status_change.hold.minus' : single_result.status_change.hold.minus,
//                 'status_change.completed.plus' : single_result.status_change.completed.plus,
//                 'status_change.completed.minus' : single_result.status_change.completed.minus,
//                 'num_cards.selected' : single_result.num_cards.selected,
//                 'num_cards.inserted' : single_result.num_cards.inserted,
//                 'num_cards.started' : single_result.num_cards.started,
//                 'num_cards.finished.total' : single_result.num_cards.finished.total,
//                 'num_cards.finished.know' : single_result.num_cards.finished.know,
//                 'num_cards.finished.pass' : single_result.num_cards.finished.pass,
//                 'num_cards.finished.hold' : single_result.num_cards.finished.hold,
//                 'num_cards.finished.completed' : single_result.num_cards.finished.completed,
//                 'selection_stats.total.count' : single_result.selection_stats.total.count,
//                 'selection_stats.total.hour' : single_result.selection_stats.total.hour,
//                 'selection_stats.short.count' : single_result.selection_stats.short.count,
//                 'selection_stats.short.hour' : single_result.selection_stats.short.hour,
//                 'selection_stats.long.count' : single_result.selection_stats.long.count,
//                 'selection_stats.long.hour' : single_result.selection_stats.long.hour,
//                 'selection_stats.know.count' : single_result.selection_stats.know.count,
//                 'selection_stats.know.hour' : single_result.selection_stats.know.hour,
//                 'selection_stats.pass.count' : single_result.selection_stats.pass.count,
//                 'selection_stats.pass.hour' : single_result.selection_stats.pass.hour,
//                 'selection_stats.hold.count' : single_result.selection_stats.hold.count,
//                 'selection_stats.hold.hour' : single_result.selection_stats.hold.hour,
//                 'selection_stats.completed.count' : single_result.selection_stats.completed.count,
//                 'selection_stats.completed.hour' : single_result.selection_stats.completed.hour,
//                 'selection_stats.back_mode.count' : single_result.selection_stats.back_mode.count,
//                 'selection_stats.back_mode.hour' : single_result.selection_stats.back_mode.hour,
//                 'level_change' : single_result.level_change
//             }}
//         )
//         if (studyresult_of_book === undefined){
//             single_result.session_id = req.body.session_id
//             single_result.book_id = book_id
//             single_result.study_date = study_date
//             studyresult_of_book = await Study_result.create(single_result)
//         }


//         // 북에도 업데이트 한다.
//         let book = await Book.updateOne({_id : book_id},
//             {$inc : 
//                 {
//                     'status_change.total.plus' : single_result.status_change.total.plus,
//                     'status_change.total.minus' : single_result.status_change.total.minus,
//                     'status_change.yet.plus' : single_result.status_change.yet.plus,
//                     'status_change.yet.minus' : single_result.status_change.yet.minus,
//                     'status_change.ing.plus' : single_result.status_change.ing.plus,
//                     'status_change.ing.minus' : single_result.status_change.ing.minus,
//                     'status_change.hold.plus' : single_result.status_change.hold.plus,
//                     'status_change.hold.minus' : single_result.status_change.hold.minus,
//                     'status_change.completed.plus' : single_result.status_change.completed.plus,
//                     'status_change.completed.minus' : single_result.status_change.completed.minus,
//                     'num_cards.selected' : single_result.num_cards.selected,
//                     'num_cards.inserted' : single_result.num_cards.inserted,
//                     'num_cards.started' : single_result.num_cards.started,
//                     'num_cards.finished.total' : single_result.num_cards.finished.total,
//                     'num_cards.finished.know' : single_result.num_cards.finished.know,
//                     'num_cards.finished.pass' : single_result.num_cards.finished.pass,
//                     'num_cards.finished.hold' : single_result.num_cards.finished.hold,
//                     'num_cards.finished.completed' : single_result.num_cards.finished.completed,
//                     'selection_stats.total.count' : single_result.selection_stats.total.count,
//                     'selection_stats.total.hour' : single_result.selection_stats.total.hour,
//                     'selection_stats.short.count' : single_result.selection_stats.short.count,
//                     'selection_stats.short.hour' : single_result.selection_stats.short.hour,
//                     'selection_stats.long.count' : single_result.selection_stats.long.count,
//                     'selection_stats.long.hour' : single_result.selection_stats.long.hour,
//                     'selection_stats.know.count' : single_result.selection_stats.know.count,
//                     'selection_stats.know.hour' : single_result.selection_stats.know.hour,
//                     'selection_stats.pass.count' : single_result.selection_stats.pass.count,
//                     'selection_stats.pass.hour' : single_result.selection_stats.pass.hour,
//                     'selection_stats.hold.count' : single_result.selection_stats.hold.count,
//                     'selection_stats.hold.hour' : single_result.selection_stats.hold.hour,
//                     'selection_stats.completed.count' : single_result.selection_stats.completed.count,
//                     'selection_stats.completed.hour' : single_result.selection_stats.completed.hour,
//                     'selection_stats.back_mode.count' : single_result.selection_stats.back_mode.count,
//                     'selection_stats.back_mode.hour' : single_result.selection_stats.back_mode.hour,
//                     'level_change' : single_result.level_change
//                 }
//             }, {
//             recent_study_time : new Date(study_date)
//         })
//     }       

//     ////////////////////////////////////// 회귀분석 //////////////////////////////////////    
//     let regression_array = []
//     for (i=0; i<cardlist_studied.length; i++){
//         if (cardlist_studied[i].detail_status.recent_selection === 'know'){
//             single_data = [cardlist_studied[i].detail_status.retention_for_regression, cardlist_studied[i].detail_status.studytimes_for_regression]
//             regression_array.push(single_data)
//         }
//     }    
//     execute_regression(req.body.book_id, regression_array)

//     // 카드리스트 스터디드에 결과 반영 여부를 yes로 바까준다.
//     session = await session.update(
//         {_id : req.body.session_id},
//         {$set : {"cardlist_studied.$[].result_include_yeobu" : 'yes'}}
//     )

    res.json({isloggedIn : true, msg : '성공적'});
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

    let study_results_by_session = {}

    for (i=0; i<study_results_by_book.length; i++){        
        study_results_by_session.status_change.total.plus +=  study_relts_by_book[i].status_change.total.plus,
        study_results_by_session.status_change.total.minus +=  study_relts_by_book[i].status_change.total.minus,
        study_results_by_session.status_change.yet.plus +=  study_relts_by_book[i].status_change.yet.plus,
        study_results_by_session.status_change.yet.minus +=  study_relts_by_book[i].status_change.yet.minus,
        study_results_by_session.status_change.ing.plus +=  study_relts_by_book[i].status_change.ing.plus,
        study_results_by_session.status_change.ing.minus +=  study_relts_by_book[i].status_change.ing.minus,
        study_results_by_session.status_change.hold.plus +=  study_relts_by_book[i].status_change.hold.plus,
        study_results_by_session.status_change.hold.minus +=  study_relts_by_book[i].status_change.hold.minus,
        study_results_by_session.status_change.completed.plus +=  study_relts_by_book[i].status_change.completed.plus,
        study_results_by_session.status_change.completed.minus +=  study_relts_by_book[i].status_change.completed.minus,
        study_results_by_session.num_cards.selected +=  study_relts_by_book[i].num_cards.selected,
        study_results_by_session.num_cards.inserted +=  study_relts_by_book[i].num_cards.inserted,
        study_results_by_session.num_cards.started +=  study_relts_by_book[i].num_cards.started,
        study_results_by_session.num_cards.finished.total +=  study_relts_by_book[i].num_cards.finished.total,
        study_results_by_session.num_cards.finished.know +=  study_relts_by_book[i].num_cards.finished.know,
        study_results_by_session.num_cards.finished.pass +=  study_relts_by_book[i].num_cards.finished.pass,
        study_results_by_session.num_cards.finished.hold +=  study_relts_by_book[i].num_cards.finished.hold,
        study_results_by_session.num_cards.finished.completed +=  study_relts_by_book[i].num_cards.finished.completed,
        study_results_by_session.selection_stats.total.count +=  study_relts_by_book[i].selection_stats.total.count,
        study_results_by_session.selection_stats.total.hour +=  study_relts_by_book[i].selection_stats.total.hour,
        study_results_by_session.selection_stats.short.count +=  study_relts_by_book[i].selection_stats.short.count,
        study_results_by_session.selection_stats.short.hour +=  study_relts_by_book[i].selection_stats.short.hour,
        study_results_by_session.selection_stats.long.count +=  study_relts_by_book[i].selection_stats.long.count,
        study_results_by_session.selection_stats.long.hour +=  study_relts_by_book[i].selection_stats.long.hour,
        study_results_by_session.selection_stats.know.count +=  study_relts_by_book[i].selection_stats.know.count,
        study_results_by_session.selection_stats.know.hour +=  study_relts_by_book[i].selection_stats.know.hour,
        study_results_by_session.selection_stats.pass.count +=  study_relts_by_book[i].selection_stats.pass.count,
        study_results_by_session.selection_stats.pass.hour +=  study_relts_by_book[i].selection_stats.pass.hour,
        study_results_by_session.selection_stats.hold.count +=  study_relts_by_book[i].selection_stats.hold.count,
        study_results_by_session.selection_stats.hold.hour +=  study_relts_by_book[i].selection_stats.hold.hour,
        study_results_by_session.selection_stats.completed.count +=  study_relts_by_book[i].selection_stats.completed.count,
        study_results_by_session.selection_stats.completed.hour +=  study_relts_by_book[i].selection_stats.completed.hour,
        study_results_by_session.selection_stats.back_mode.count +=  study_relts_by_book[i].selection_stats.back_mode.count,
        study_results_by_session.selection_stats.back_mode.hour +=  study_relts_by_book[i].selection_stats.back_mode.hour,
        study_results_by_session.level_change +=  study_relts_by_book[i].level_change
    }

    
    res.json({isloggedIn : true, session, study_results_by_book, study_results_by_session });
}

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

    // 세션을 받아오고... 카드리스트 스터디드나 토탈은 저장할 필요가 있는지 검토 필요혀요
    let session = await Session
        .findOne({_id : req.body.session_id})
        // .select('num_cards cardlist_total cardlist_studied study_result')
        // .select('num_cards cardlist_studied study_result')
        .select('cardlist_studied study_result')

    // 카드리스트 스터디를 저장인지 업데이트인지 보고.. 처음 저장하면 undefined일 것임
    if (session.cardlist_studied){        
        session.cardlist_studied = session.cardlist_studied.concat(cardlist_studied)
    } else {        
        session.cardlist_studied = cardlist_studied
    }
    
// -----------------------카드리스트 스터디드 편집 ---------------------------------
    // 데이트를 생성해줍시다.
    // Date로 하니까 중복 제거가 안 됨. 그래서 스트링으로 바꿈
    for (i=0; i<cardlist_studied.length; i++){
        cardlist_studied[i].detail_status.recent_study_time = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date = new Date(cardlist_studied[i].detail_status.recent_study_time)
        cardlist_studied[i].detail_status.recent_study_date.setHours(0,0,0,0)
        cardlist_studied[i].detail_status.recent_study_date = cardlist_studied[i].detail_status.recent_study_date.toString()
    }

    // 책과 날짜의 고유값을 꺼내고
    let book_ids = cardlist_studied.map((cardlist) => cardlist.book_id)
    book_ids = new Set(book_ids)
    book_ids = [...book_ids]
    let study_dates = cardlist_studied.map((cardlist) => cardlist.detail_status.recent_study_date)    
    study_dates = new Set(study_dates)
    study_dates = [...study_dates]
    
    // console.log('book_ids', book_ids)
    // console.log('study_dates', study_dates)

    // 책 및 날짜 단위로 데이터를 추출하여 저장함
    for (book_id of book_ids){
        for (study_date of study_dates){   
            
            let single_result = new Study_result            
            for(i=0; i<cardlist_studied.length; i++){ 
                if (cardlist_studied[i].book_id == book_id && cardlist_studied[i].detail_status.recent_study_date == study_date ){                
                    
                    // 문제는 hold나 completed로 날라오는 거,
                    // 이거는 학습 결과가 아니거든
                    // 데이터 구조만 정리해주고, for문을 skip하자고
                    if((cardlist_studied[i].status === 'hold' || cardlist_studied[i].status === 'completed') && (cardlist_studied[i].former_status === 'yet' || cardlist_studied[i].former_status === 'ing')){
                        let prev_status
                        // 먼저 yet에서 삭제를 시도해보고
                        let sepa_yet_change = await Session.updateOne(
                            {_id : req.body.session_id},
                            {$pull : {'cardlist_sepa.yet' : {_id : cardlist_studied[i]._id }}}
                        )
                        
                        // yet에서 삭제 됐으면, 기존 상태는 yet이고 아니면 ing에서 삭제 시도한다.
                        if (sepa_yet_change.modifiedCount === 1){
                            prev_status = 'yet'
                        } else if (sepa_yet_change.modifiedCount === 0){
                            let sepa_ing_change = await Session.updateOne(
                                {_id : req.body.session_id},
                                {$pull : {'cardlist_sepa.ing' : {_id : cardlist_studied[i]._id}}}
                            )
                        }

                        // ing에서 삭제 됐으면, 기존 상태는 ing이고 그것도 아니면 그냥 끝낸다.
                        if (sepa_ing_change.modifiedCount === 1){
                            prev_status = 'ing'
                        } else {
                            continue
                        }

                        // hold, completed에 카드 추가, 카드 갯수 수정, total 수정
                        if(cardlist_studied[i].status === 'hold'){
                            if(prev_status = 'yet'){        
                                let sepa_change = await Session.updateOne(
                                    {_id : req.body.session_id},
                                    {
                                        $push : {
                                            'cardlist_sepa.hold' : {
                                                $each : [cardlist_studied[i]],
                                                $position : session.num_cards.hold.selected
                                            },
                                        },
                                        $inc : {
                                            'num_cards.yet.total' : -1,
                                            'num_cards.yet.selected' : -1,
                                            'num_cards.hold.total' : 1,
                                            'num_cards.hold.selected' : 1,
                                        }
                                    }
                                )
                            } else if (prev_status = 'ing'){
                                let sepa_change = await Session.updateOne(
                                    {_id : req.body.session_id},
                                    {
                                        $push : {
                                            'cardlist_sepa.hold' : {
                                                $each : [cardlist_studied[i]],
                                                $position : session.num_cards.hold.selected
                                            },
                                        },
                                        $inc : {
                                            'num_cards.ing.total' : -1,
                                            'num_cards.ing.selected' : -1,
                                            'num_cards.hold.total' : 1,
                                            'num_cards.hold.selected' : 1,
                                        }
                                    }
                                )
                            }
                            // 카드리스트 토탈 수정
                            let total_change = await Session.updateOne(
                                {_id : req.body.session_id, 'cardlist_total._id' : cardlist_studied[i]._id},
                                {'cardlist_total.$.status' : 'hold'}
                            )
                        } else if (cardlist_studied[i].status === 'completed'){
                            if(prev_status = 'yet'){        
                                let sepa_change = await Session.updateOne(
                                    {_id : req.body.session_id},
                                    {
                                        $push : {
                                            'cardlist_sepa.completed' : {
                                                $each : [cardlist_studied[i]],
                                                $position : session.num_cards.completed.selected
                                            },
                                        },
                                        $inc : {
                                            'num_cards.yet.total' : -1,
                                            'num_cards.yet.selected' : -1,
                                            'num_cards.completed.total' : 1,
                                            'num_cards.completed.selected' : 1,
                                        }
                                    }
                                )
                            } else if (prev_status = 'ing'){
                                let sepa_change = await Session.updateOne(
                                    {_id : req.body.session_id},
                                    {
                                        $push : {
                                            'cardlist_sepa.completed' : {
                                                $each : [cardlist_studied[i]],
                                                $position : session.num_cards.completed.selected
                                            },
                                        },
                                        $inc : {
                                            'num_cards.ing.total' : -1,
                                            'num_cards.ing.selected' : -1,
                                            'num_cards.completed.total' : 1,
                                            'num_cards.completed.selected' : 1,
                                        }
                                    }
                                )
                            }
                            // 카드리스트 토탈 수정
                            let total_change = await Session.updateOne(
                                {_id : req.body.session_id, 'cardlist_total._id' : cardlist_studied[i]._id},
                                {'cardlist_total.$.status' : 'completed'}
                            )
                        }
                            
                        continue;
                    }
                    
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
                    // status 기준으로 num_cards를 집계한다.
                    single_result[type].num_cards_change[cardlist_studied[i].former_status] -= 1
                    single_result[type].num_cards_change[cardlist_studied[i].status] += 1
                    // 세션 스터디 타임즈가 1인 경우에만 스터디_카드스가 올라간다.
                    if (cardlist_studied[i].detail_status.session_study_times === 1){                        
                        single_result[type].studied_cards.total +=1
                        single_result[type].studied_cards[cardlist_studied[i].former_status] +=1
                    }
                    // 학습 횟수를 집계한다.
                    single_result[type].study_times.total += 1                                        
                    single_result[type].study_times[cardlist_studied[i].detail_status.recent_difficulty] += 1                    
                    // 학습 시간을 집계하고
                    single_result[type].study_hour += cardlist_studied[i].detail_status.recent_study_hour
                    // 경험치도 집계하고
                    single_result[type].exp_gained += cardlist_studied[i].detail_status.exp_gained
                    // recent_study_time의 최대값을 찾는다.
                    if (single_result.recent_study_time < cardlist_studied[i].detail_status.recent_study_time){
                        single_result.recent_study_time = cardlist_studied[i].detail_status.recent_study_time
                    }
                    
                }
            }
            
            // 토탈값을 만든다.
            single_result.total.num_cards_change.yet = single_result.read.num_cards_change.yet + single_result.flip.num_cards_change.yet
            single_result.total.num_cards_change.ing = single_result.read.num_cards_change.ing + single_result.flip.num_cards_change.ing
            single_result.total.num_cards_change.hold = single_result.read.num_cards_change.hold + single_result.flip.num_cards_change.hold
            single_result.total.num_cards_change.completed = single_result.read.num_cards_change.completed + single_result.flip.num_cards_change.completed
            single_result.total.studied_cards.total = single_result.read.studied_cards.total + single_result.flip.studied_cards.total
            single_result.total.studied_cards.yet = single_result.read.studied_cards.yet + single_result.flip.studied_cards.yet
            single_result.total.studied_cards.ing = single_result.read.studied_cards.ing + single_result.flip.studied_cards.ing
            single_result.total.studied_cards.hold = single_result.read.studied_cards.hold + single_result.flip.studied_cards.hold
            single_result.total.studied_cards.completed = single_result.read.studied_cards.completed + single_result.flip.studied_cards.completed
            single_result.total.study_times.total = single_result.read.study_times.total + single_result.flip.study_times.total
            single_result.total.study_times.diffi1 = single_result.read.study_times.diffi1 + single_result.flip.study_times.diffi1
            single_result.total.study_times.diffi2 = single_result.read.study_times.diffi2 + single_result.flip.study_times.diffi2
            single_result.total.study_times.diffi3 = single_result.read.study_times.diffi3 + single_result.flip.study_times.diffi3
            single_result.total.study_times.diffi4 = single_result.read.study_times.diffi4 + single_result.flip.study_times.diffi4
            single_result.total.study_times.diffi5 = single_result.read.study_times.diffi5 + single_result.flip.study_times.diffi5
            single_result.total.study_hour = single_result.read.study_hour + single_result.flip.study_hour
            single_result.total.exp_gained = single_result.read.exp_gained + single_result.flip.exp_gained

            // 해당 세션, 북, 날짜로 스터디리절트가 생성되어 있으면 업데이트 하고 아니면 생성한다.
            let studyresult_of_book = await Study_result.findOne({session_id : req.body.session_id, book_id, study_date})

            if (studyresult_of_book){
                studyresult_of_book.total.num_cards_change.yet += single_result.total.num_cards_change.yet
                studyresult_of_book.total.num_cards_change.ing += single_result.total.num_cards_change.ing
                studyresult_of_book.total.num_cards_change.hold += single_result.total.num_cards_change.hold
                studyresult_of_book.total.num_cards_change.completed += single_result.total.num_cards_change.completed
                studyresult_of_book.total.studied_cards.total += single_result.total.studied_cards.total
                studyresult_of_book.total.studied_cards.yet += single_result.total.studied_cards.yet
                studyresult_of_book.total.studied_cards.ing += single_result.total.studied_cards.ing
                studyresult_of_book.total.studied_cards.hold += single_result.total.studied_cards.hold
                studyresult_of_book.total.studied_cards.completed += single_result.total.studied_cards.completed
                studyresult_of_book.total.study_times.total += single_result.total.study_times.total
                studyresult_of_book.total.study_times.diffi1 += single_result.total.study_times.diffi1
                studyresult_of_book.total.study_times.diffi2 += single_result.total.study_times.diffi2
                studyresult_of_book.total.study_times.diffi3 += single_result.total.study_times.diffi3
                studyresult_of_book.total.study_times.diffi4 += single_result.total.study_times.diffi4
                studyresult_of_book.total.study_times.diffi5 += single_result.total.study_times.diffi5
                studyresult_of_book.total.study_hour += single_result.total.study_hour
                studyresult_of_book.total.exp_gained += single_result.total.exp_gained
                studyresult_of_book.read.num_cards_change.yet += single_result.read.num_cards_change.yet
                studyresult_of_book.read.num_cards_change.ing += single_result.read.num_cards_change.ing
                studyresult_of_book.read.num_cards_change.hold += single_result.read.num_cards_change.hold
                studyresult_of_book.read.num_cards_change.completed += single_result.read.num_cards_change.completed
                studyresult_of_book.read.studied_cards.total += single_result.read.studied_cards.total
                studyresult_of_book.read.studied_cards.yet += single_result.read.studied_cards.yet
                studyresult_of_book.read.studied_cards.ing += single_result.read.studied_cards.ing
                studyresult_of_book.read.studied_cards.hold += single_result.read.studied_cards.hold
                studyresult_of_book.read.studied_cards.completed += single_result.read.studied_cards.completed
                studyresult_of_book.read.study_times.total += single_result.read.study_times.total
                studyresult_of_book.read.study_times.diffi1 += single_result.read.study_times.diffi1
                studyresult_of_book.read.study_times.diffi2 += single_result.read.study_times.diffi2
                studyresult_of_book.read.study_times.diffi3 += single_result.read.study_times.diffi3
                studyresult_of_book.read.study_times.diffi4 += single_result.read.study_times.diffi4
                studyresult_of_book.read.study_times.diffi5 += single_result.read.study_times.diffi5
                studyresult_of_book.read.study_hour += single_result.read.study_hour
                studyresult_of_book.read.exp_gained += single_result.read.exp_gained
                studyresult_of_book.flip.num_cards_change.yet += single_result.flip.num_cards_change.yet
                studyresult_of_book.flip.num_cards_change.ing += single_result.flip.num_cards_change.ing
                studyresult_of_book.flip.num_cards_change.hold += single_result.flip.num_cards_change.hold
                studyresult_of_book.flip.num_cards_change.completed += single_result.flip.num_cards_change.completed
                studyresult_of_book.flip.studied_cards.total += single_result.flip.studied_cards.total
                studyresult_of_book.flip.studied_cards.yet += single_result.flip.studied_cards.yet
                studyresult_of_book.flip.studied_cards.ing += single_result.flip.studied_cards.ing
                studyresult_of_book.flip.studied_cards.hold += single_result.flip.studied_cards.hold
                studyresult_of_book.flip.studied_cards.completed += single_result.flip.studied_cards.completed
                studyresult_of_book.flip.study_times.total += single_result.flip.study_times.total
                studyresult_of_book.flip.study_times.diffi1 += single_result.flip.study_times.diffi1
                studyresult_of_book.flip.study_times.diffi2 += single_result.flip.study_times.diffi2
                studyresult_of_book.flip.study_times.diffi3 += single_result.flip.study_times.diffi3
                studyresult_of_book.flip.study_times.diffi4 += single_result.flip.study_times.diffi4
                studyresult_of_book.flip.study_times.diffi5 += single_result.flip.study_times.diffi5
                studyresult_of_book.flip.study_hour += single_result.flip.study_hour
                studyresult_of_book.flip.exp_gained += single_result.flip.exp_gained
                
                studyresult_of_book = await studyresult_of_book.save()
            } else {
                // 없으면 single_result에 기본 정보를 생성해서 크리에이트한다.
                single_result.session_id = req.body.session_id
                single_result.book_id = book_id
                single_result.study_date = study_date
                studyresult_of_book = await Study_result.create(single_result)
            }

            // 북에도 업데이트
            let book = await Book.updateOne({_id : book_id},
                {$inc : {
                    'num_cards.total.yet' : single_result.total.num_cards_change.yet,
                    'num_cards.total.ing' : single_result.total.num_cards_change.ing,
                    'num_cards.total.hold' : single_result.total.num_cards_change.hold,
                    'num_cards.total.completed' : single_result.total.num_cards_change.completed,
                    'num_cards.read.yet' : single_result.read.num_cards_change.yet,
                    'num_cards.read.ing' : single_result.read.num_cards_change.ing,
                    'num_cards.read.hold' : single_result.read.num_cards_change.hold,
                    'num_cards.read.completed' : single_result.read.num_cards_change.completed,
                    'num_cards.flip.yet' : single_result.flip.num_cards_change.yet,
                    'num_cards.flip.ing' : single_result.flip.num_cards_change.ing,
                    'num_cards.flip.hold' : single_result.flip.num_cards_change.hold,
                    'num_cards.flip.completed' : single_result.flip.num_cards_change.completed,
                    'result.total.study_times.total' : single_result.total.study_times.total,
                    'result.total.study_times.diff1' : single_result.total.study_times.diff1,
                    'result.total.study_times.diff2' : single_result.total.study_times.diff2,
                    'result.total.study_times.diff3' : single_result.total.study_times.diff3,
                    'result.total.study_times.diff4' : single_result.total.study_times.diff4,
                    'result.total.study_times.diff5' : single_result.total.study_times.diff5,
                    'result.read.study_times.total' : single_result.read.study_times.total,
                    'result.read.study_times.diff1' : single_result.read.study_times.diff1,
                    'result.read.study_times.diff2' : single_result.read.study_times.diff2,
                    'result.read.study_times.diff3' : single_result.read.study_times.diff3,
                    'result.read.study_times.diff4' : single_result.read.study_times.diff4,
                    'result.read.study_times.diff5' : single_result.read.study_times.diff5,
                    'result.flip.study_times.total' : single_result.flip.study_times.total,
                    'result.flip.study_times.diff1' : single_result.flip.study_times.diff1,
                    'result.flip.study_times.diff2' : single_result.flip.study_times.diff2,
                    'result.flip.study_times.diff3' : single_result.flip.study_times.diff3,
                    'result.flip.study_times.diff4' : single_result.flip.study_times.diff4,
                    'result.flip.study_times.diff5' : single_result.flip.study_times.diff5,
                    'result.total.study_hour' : single_result.total.study_hour,
                    'result.read.study_hour' : single_result.read.study_hour,
                    'result.flip.study_hour' : single_result.flip.study_hour,
                    // book에는 exp_stacked로 누적시킴
                    'result.total.exp_stacked' : single_result.total.exp_gained,
                    'result.read.exp_stacked' : single_result.read.exp_gained,
                    'result.flip.exp_stacked' : single_result.flip.exp_gained,
                }}, {recent_study_time : new Date(study_date)})

            // 마지막으로 세션 데이터를 업데이트 한다.
            session.study_result.total.studied_cards.total += single_result.total.studied_cards.total
            session.study_result.total.studied_cards.yet += single_result.total.studied_cards.yet
            session.study_result.total.studied_cards.ing += single_result.total.studied_cards.ing
            session.study_result.total.studied_cards.hold += single_result.total.studied_cards.hold
            session.study_result.total.studied_cards.completed += single_result.total.studied_cards.completed
            session.study_result.read.studied_cards.total += single_result.read.studied_cards.total
            session.study_result.read.studied_cards.yet += single_result.read.studied_cards.yet
            session.study_result.read.studied_cards.ing += single_result.read.studied_cards.ing
            session.study_result.read.studied_cards.hold += single_result.read.studied_cards.hold
            session.study_result.read.studied_cards.completed += single_result.read.studied_cards.completed
            session.study_result.flip.studied_cards.total += single_result.flip.studied_cards.total
            session.study_result.flip.studied_cards.yet += single_result.flip.studied_cards.yet
            session.study_result.flip.studied_cards.ing += single_result.flip.studied_cards.ing
            session.study_result.flip.studied_cards.hold += single_result.flip.studied_cards.hold
            session.study_result.flip.studied_cards.completed += single_result.flip.studied_cards.completed
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
            session.study_result.total.exp_gained += single_result.total.exp_gained            
            session.study_result.read.exp_gained += single_result.read.exp_gained            
            session.study_result.flip.exp_gained += single_result.flip.exp_gained            
        }
    }

    session = await session.save()

    // 카드 정보 업데이트
        // 중복부터 제거함
    req.body.cardlist_studied.reverse()
    let dup = []    
    
    for (i=1; i< req.body.cardlist_studied.length; i++){
        for(j=0; j<i; j++){
            if(req.body.cardlist_studied[i]._id === req.body.cardlist_studied[j]._id){
                dup.push(i)
                break
            }
        }        
    }
    console.log('dup', dup)
    dup.reverse()
    for (i=0; i<dup.length; i++){
        req.body.cardlist_studied.splice(i,1)
    }
    
    // 카드 업데이트    
    for (i=0; i<req.body.cardlist_studied.length; i++){                
        let card = await Card.updateOne(        
            {_id : req.body.cardlist_studied[i]._id},
            {status : req.body.cardlist_studied[i].status,
            detail_status : req.body.cardlist_studied[i].detail_status}
        )
        
        // // 임시로~
        // let tmp = req.body.cardlist_studied[i].detail_status.recent_study_time +'/'+ req.body.cardlist_studied[i].detail_status.recent_difficulty + '/' +req.body.cardlist_studied[i].detail_status.need_study_time       
        
        // let tmp_card = await Card.findOne({_id : req.body.cardlist_studied[i]._id})
        //         .select('contents status detail_status')
        // tmp_card.contents.face1[1]= tmp
        // tmp_card.status = req.body.cardlist_studied[i].status,
        // tmp_card.detail_status = req.body.cardlist_studied[i].detail_status        
        // tmp_card = await tmp_card.save()
        // console.log(tmp_card.contents)
    }

    res.json({isloggedIn : true, msg : '성공적'});
}

// 세션 스터디 결과를 보내줍니다.
exports.req_session_studyresult= async (req, res) => {    
    console.log("세션 스터디 결과를 보내줍니다.");
    console.log('body', req.body);
    
    let session = await Session.findOne({_id : req.body.session_id})
        .select('study_result')
    let study_results_by_book = await Study_result.find({session_id : req.body.session_id})
        .sort({session_id : 1})
        .populate({path : 'book_id', select : 'title'})
    console.log('session', session)
    console.log('study_results_by_book', study_results_by_book)
    res.json({isloggedIn : true, session, study_results_by_book });
}

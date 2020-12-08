const mongoose = require("mongoose");
const fs = require("fs").promises;
const multer = require('multer');
const readXlsxFile = require('read-excel-file/node');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Card_external = require('../models/card_external');
const Content = require('../models/content');
const Index = require('../models/index');
const Category = require('../models/category');
const Cardtype = require('../models/cardtype');
const Session = require('../models/session');
const Selected_bookNindex = require('../models/selected_bookNindex');
const Studyingcard_total = require('../models/studyingcard_total');
const Studyingcard_current = require('../models/studyingcard_current');
const { session } = require("passport");
const Study_configuration = require("../models/study_configuration");
// const { Session } = require("inspector");

// 난이도 평가를 반영합니다.
exports.click_difficulty= async (req, res) => {
    console.log("선택된 책 정보를 DB에 저장합니다.");
    console.log(req.body);

    req.body.difficulty = 'lev_1'
    req.body.session_id = ''
    req.body.book_id = ''
    req.body.card_id = ''
    req.body.study_hour = ''


    // 일단 북 아이디로 학습 설정을 찾고, 
    let study_configuration = await Study_configuration.findOne({book_id : req.body.book_id})
    

    // 카드 아이디로 카드를 찾고
    let card = await Card.findOne({_id : req.body.card_id})
    // 미학습인 카드는 학습중으로 수정해주고
    if (card.status === 'yet') {card.status = 're'}
    // 최근 학습 시점은 지금으로 수정해주고
    card.study_result.recent_study_time = Date.now();
    // 최근 난이도도 수정해주고
    card.study_result.recent_difficulty = req.body.difficulty    
    // 경험치를 더해주고
    if(req.body.difficulty === 'lev_5') {
        switch(card.study_result.current_lev_study_times){
            case 0 : let exp = study_configuration.exp_setting.one_time; break;
            case 1 : let exp = study_configuration.exp_setting.two_times; break;
            case 2 : let exp = study_configuration.exp_setting.three_times; break;
            case 3 : let exp = study_configuration.exp_setting.four_times; break;
            default : let exp = study_configuration.exp_setting.five_times; break;
        }
        card.study_result.exp += exp
    }
    // 레벨도 다시 설정해주고
    card.study_result.level = Math.floor(card.study_result.exp/1000) + 1
    // 복습 필요 시점도 다시 잡아주고
    // 알겠음을 선택했을 때랑, 아닐 때랑 복습 주기를 다르게 적용해줌
    if (req.body.difficulty === 'lev_5'){
        let interval = study_configuration.lev_setting['lev_'+card.study_result.level]['interval']
        let time_unit = study_configuration.lev_setting['lev_'+card.study_result.level]['time_unit']
        if (time_unit === 'min'){
            let restudy_term = interval*60*1000
        } else if (time_unit === 'hour') {
            let restudy_term = interval*60*60*1000
        } else if (time_unit === 'day') {
            let restudy_term = interval*24*60*60*1000
        }
        card.need_study_time = Date.now() + restudy_term    
    } else {
        let interval = study_configuration.difficulty_setting[req.body.difficulty]['interval']
        let time_unit = study_configuration.difficulty_setting[req.body.difficulty]['time_unit']
        if (time_unit === 'min'){
            let restudy_term = interval*60*1000
        } else if (time_unit === 'hour') {
            let restudy_term = interval*60*60*1000
        } else if (time_unit === 'day') {
            let restudy_term = interval*24*60*60*1000
        }
        card.need_study_time = Date.now() + restudy_term
    }
    

    // 총 학습 횟수도 수정해주고
    card.study_result.total_study_times +=1
    // 선택 난이도가 알겠음이면 현레벨 학습횟수를 0으로 바꿔주고
    // 아니면 1 더해주고
    if(req.body.difficulty === 'lev_5') {
        card.study_result.current_lev_study_times = 0
    } else {
        card.study_result.current_lev_study_times += 1
    }
    // 총학습시간도 더해주고
    // 시간으로 바꿔줘야 함요
    card.study_result.total_study_hour += req.body.study_hour
    // 최근 학습 시간도 바꿔주고
    card.study_result.recent_study_hour = req.body.study_hour
    
    // ------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------
    // 세션 아이디로 세션을 찾는다.
    let session = await Session.findOne({_id : req.body.session_id}, {cardlist_working : 1})

    // need_study_time이 oo보다 큰 첫번째 녀석을 찾아야 하는데
    let current_card = session.cardlist_working[req.body.current_seq]
    
    current_card.need_study_time = card.study_result.need_study_time
    dy_time
    // seq_in_working을 관리하는 것은 무지 귀찮을 것 같으엄.
    // 음 그르므로 날려줄 때 스윽 집어넣는 것은 어떨까함
    target_position = session.cardlist_working.findIndex((single_card) => {
        single_card.need_study_time > card.study_result.need_study_time
    })

    
    







}
// const mongoose = require("mongoose");
// const fs = require("fs").promises;
// const multer = require('multer');
// const readXlsxFile = require('read-excel-file/node');

// // 모델 경로
// const Card = require('../models/card');
// const Session = require('../models/session');
// // const { session } = require("passport");
// const Level_config = require("../models/level_config");

// // 난이도 평가를 반영합니다.
// exports.click_difficulty= async (req, res) => {
//     console.log("선택된 책 정보를 DB에 저장합니다.");
//     console.log(req.body);

//     // 일단 북 아이디로 학습 설정을 찾고, 
//     let level_config = await Level_config.findOne({book_id : req.body.book_id})
//     console.log(level_config)

//     // 카드 아이디로 카드를 찾고
//     let card = await Card.findOne({_id : req.body.card_id})
//     console.log(card)
//     // 미학습인 카드는 학습중으로 수정해주고
//     if (card.status === 'yet') {card.status = 're'}
//     // 최근 학습 시점은 지금으로 수정해주고
//     card.study_result.recent_study_time = Date.now();
//     // 최근 난이도도 수정해주고
//     card.study_result.recent_difficulty = req.body.difficulty    
//     // 경험치를 더해주고
    
//     let exp_acquisition
//     if(req.body.difficulty === 'lev_5') {
//         switch(card.study_result.current_lev_study_times){
//             case 0 : exp_acquisition = level_config.exp_setting.one_time; break;
//             case 1 : exp_acquisition = level_config.exp_setting.two_times; break;
//             case 2 : exp_acquisition = level_config.exp_setting.three_times; break;
//             case 3 : exp_acquisition = level_config.exp_setting.four_times; break;
//             default : exp_acquisition = level_config.exp_setting.five_times; break;
//         }
//         card.study_result.exp += exp_acquisition

//         // 단 경험치가 마이너스면 0으로 잡아준다.
//         if (card.study_result.exp < 0){
//             card.study_result.exp = 0
//         }
//     }
//     // 레벨도 다시 설정해주고
//     card.study_result.level = Math.floor(card.study_result.exp/1000) + 1

//     // 복습 필요 시점도 다시 잡아주고
//     // 알겠음을 선택했을 때랑, 아닐 때랑 복습 주기를 다르게 적용해줌
//     if (req.body.difficulty === 'lev_5'){
//         let interval = level_config.lev_setting[req.body.difficulty]['interval']
//         let time_unit = level_config.lev_setting[req.body.difficulty]['time_unit']
//         let restudy_term
//         if (time_unit === 'min'){
//             restudy_term = interval*60*1000
//         } else if (time_unit === 'hour') {
//             restudy_term = interval*60*60*1000
//         } else if (time_unit === 'day') {
//             restudy_term = interval*24*60*60*1000
//         }
//         card.need_study_time = Date.now() + restudy_term    
//     } else {
//         let interval = level_config.difficulty_setting[req.body.difficulty]['interval']
//         let time_unit = level_config.difficulty_setting[req.body.difficulty]['time_unit']
//         let restudy_term
//         if (time_unit === 'min'){
//             restudy_term = interval*60*1000
//         } else if (time_unit === 'hour') {
//             restudy_term = interval*60*60*1000
//         } else if (time_unit === 'day') {
//             restudy_term = interval*24*60*60*1000
//         }
//         card.need_study_time = Date.now() + restudy_term
//     }
    
//     // 총 학습 횟수도 수정해주고
//     card.study_result.total_study_times +=1
//     // 현 레벨 학습 횟수는... 선택 난이도가 lev_5(알겠음)이면 현레벨 학습횟수를 0으로 바꿔주고 아니면 1 더하기만 해주고
//     if(req.body.difficulty === 'lev_5') {
//         card.study_result.current_lev_study_times = 0
//     } else {
//         card.study_result.current_lev_study_times += 1
//     }
//     // 총학습시간도 더해주고    
//     card.study_result.total_study_hour = card.study_result.total_study_hour.getTime()+req.body.study_hour
//     // 최근 학습 시간도 바꿔주고
//     card.study_result.recent_study_hour = req.body.study_hour
//     // 마지막으로 저장한다.
//     card = await card.save()
    
//     // ------------------------------------------------------------------------------------
//     //       세션의 cardlist_working 정보를 수정해주자           
//     // ------------------------------------------------------------------------------------
//     // 세션 아이디로 세션을 찾는다.
//     let session = await Session.findOne({_id : req.body.session_id}, {cardlist_working : 1})      
//     let current_seq = req.body.current_seq    
    
//     // 기존 카드에 했다는 표시만 좀 할까?
//     session.time_recent_access = card.study_result.recent_study_time
//     session.cardlist_working[current_seq].status = 'done'
//     session.cardlist_working[current_seq].study_time = card.study_result.recent_study_time
//     session.cardlist_working[current_seq].difficulty = req.body.difficulty    
//     session.cardlist_working[current_seq].study_hour = req.body.study_hour    
//     session.cardlist_working[current_seq].exp = exp_acquisition


//     // 레벨5가 아니면 뒷쪽에 신규로 카드를 만들어줘야 함
//     if(req.body.difficulty != 'lev_5') {                
//         // 복사는 아니고 참조가 되는건가? 이건 모르겠다야
//         let new_card = {
//             book_id : session.cardlist_working[current_seq].book_id,
//             _id : session.cardlist_working[current_seq]._id,
//             need_study_time : card.need_study_time,
//             status : 'yet',
//             difficulty : null,
//             study_hour : null,
//             exp : 0,
//         }       

//         // 새 카드가 들어갈 위치를 잡는데요.
//         // 뉴카드의 복습 필요 시점보다 더 뒤에 복습하는 카드가 없는 경우, 마지막에 넣어줘야죠
//         target_position = session.cardlist_working.findIndex((single_card) => {
//             single_card.need_study_time > card.study_result.need_study_time
//         })
//         if (target_position === -1){
//             target_position = session.cardlist_working.length
//         }
//         console.log('target_position', target_position)
//         session.cardlist_working.splice(target_position, 0 , new_card)

//         session = await session.save()        
//     }

//     res.json({isloggedIn : true, session});
// }

// // 현재 세션의 학습 결과를 보여줍니다.
// exports.get_study_result= async (req, res) => {
//     console.log("현재 세션의 학습 결과를 보여줍니다.");
//     console.log(req.body);

//     let session = await Session.findOne(
//         {_id : req.body.session_id},
//         {cardlist_working : 1, study_result : 1})

//     if (session.study_result.run === 'yet'){
//         study_hour_total = session.cardlist_working.reduce((prev,curr) => prev + curr.study_hour,0)
//         study_hour_history = session.cardlist_working.map((card) => card.study_hour)
//         exp_total = session.cardlist_working.reduce((prev,curr) => prev + curr.exp,0)
//         // num_study_cards = {
//         //     yet : session.cardlist_total.reduce((prev,curr) => prev + (curr.status==='yet'),0),
//         //     re : session.cardlist_working.reduce((prev,curr) => prev + (curr.status==='re'),0),
//         //     hold : session.cardlist_working.reduce((prev,curr) => prev + (curr.status==='hold'),0),
//         //     completed : session.cardlist_working.reduce((prev,curr) => prev + (curr.status==='completed'),0),
//         // }
//         num_click = {
//             lev_1 : session.cardlist_working.reduce((prev,curr) => prev + (curr.difficulty==='lev_1'),0),
//             lev_2 : session.cardlist_working.reduce((prev,curr) => prev + (curr.difficulty==='lev_2'),0),
//             lev_3 : session.cardlist_working.reduce((prev,curr) => prev + (curr.difficulty==='lev_3'),0),
//             lev_4 : session.cardlist_working.reduce((prev,curr) => prev + (curr.difficulty==='lev_4'),0),
//             lev_5 : session.cardlist_working.reduce((prev,curr) => prev + (curr.difficulty==='lev_5'),0),
//         }

//         session.study_result.run = 'done'
//     }

//     res.json({isloggedIn : true, study_result});

// }
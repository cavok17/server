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
const Study_configuration = require('../models/study_configuration');
const Selected_bookNindex = require('../models/selected_bookNindex');
const { session } = require("passport");


// 선택된 책 정보를 DB에 저장하면서 세션을 만듭니다.
exports.save_booklist= async (req, res) => {
    console.log("선택된 책 정보를 DB에 저장합니다.");
    console.log(req.body);

    let booksnindexes = []
    for (i=0; i<req.body.book_ids.length; i++){
        let book = await Book.findOne({_id : req.body.book_ids[i]})
        let single_book = {            
            book_id : book._id,
            title : book.title,            
            index_ids : []
        }            
        booksnindexes.push(single_book)
    }    
    console.log('booksnindexes', booksnindexes)
        
    // 셀렉된 걸 저장합니다.
    let session = await Session.create({booksnindexes})    

    res.json({msg : 'Sucess!!!!!!!!!!!!!', session_id : session._id})
}

// 선택된 책의 인덱스를 보내줍니다..
exports.get_index = async (req, res) => {
    console.log("선택된 책의 인덱스를 보내줍니다.");
    console.log('body', req.body);    
    
    // 책과 인덱스 리스트를 받아옵니다.
    let session_id = req.body.session_id
    let session = await Session.findOne({_id : session_id},{booksnindexes : 1})    
    let booksnindexes = await get_booksnindexes(session)    
    
    // 학습 설정 관련 값도 뿌려주려고 합니다.
    // 책마다 설정이 있긴 한데, 두 권 이상인 경우에는 두권 이상짜리 설정을 사용합니다.    
    let study_config
    if (session.booksnindexes.length >= 2){        
        study_config = await User.findOne({user_id : req.session.passport.user}, {study_config : 1, _id : 0})                
    } else if (session.booksnindexes.length === 1) {
        study_config = await Book.findOne({_id : session.booksnindexes[0].book_id}, {study_config : 1, _id : 0})
    }
    
    res.json({isloggedIn : true, session_id, booksnindexes, study_config});    
}

// 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
exports.click_index = async (req, res) => {
    console.log("인덱스 선택했니? 잘했다야");
    console.log(req.body);

    let session_id = req.body.session_id
    let session = await Session.findOne({_id:session_id},{booksnindexes:1})
    console.log(session)
    // 불안헝께 book seq도 그냥 찾어불자.
    // let seq_of_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id === req.body.book_id)
    let seq_of_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)
    console.log(seq_of_book)

    breakme : if (req.body.status ===true) {
        // 인덱스 정보가 동일하게 들어가는 것인지 확인을 해야해요.
        let position_of_the_index = session.booksnindexes[seq_of_book].indexes.findIndex((single_index) => {
            return single_index.index_id === req.body.index_id })
        if (position_of_the_index >= 0){
            console.log('중복이네요')
            break breakme
        } else {
            console.log('중복이 아니네요')
        }

        // 일단 카드가 몇 개인지 세어보죠
        let cards = await Card.find(
            {index_id : req.body.index_id},
            {status : 1, need_study_time :1, _id:0})
                
        let tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate()+1)
        tomorrow.setHours(0,0,0,0)

        let yet = cards.filter((card) => card.status === 'yet').length                
        let re = cards.filter((card) => card.status === 're').length
        let hold = cards.filter((card) => card.status === 'hold').length
        let completed = cards.filter((card) => card.status === 'completed').length
        let total = yet + re + hold +completed        
        let re_until_now = cards
            .filter((card) => card.status === 're')
            .filter((card) => card.need_study_time < Date.now()).length
        let re_until_today = cards
            .filter((card) => card.status === 're')
            .filter((card) => card.need_study_time < tomorrow.getTime()).length

        // 데이터 구조화해서 추가해야제
        let new_index_info = {
            index_id : req.body.index_id,
            yet, re, hold, completed, total, re_until_now, re_until_today}
        
        session.booksnindexes[seq_of_book].indexes.push(new_index_info)
        session = await session.save()            
    } else if (req.body.status === false) {
        // 일단 index_id가 어디있는지 찾아보자고
        let position_of_the_index = session.booksnindexes[seq_of_book].indexes.findIndex((single_index) => {
            return single_index.index_id === req.body.index_id })
        if (position_of_the_index === -1){
            console.log('그런 애 없다는디')
            break breakme
        } else {
            console.log('좋아요 지워드릴게요')
        }        
        
        // 찾았으니까 지워야지
        session.booksnindexes[seq_of_book].indexes.splice(position_of_the_index, 1)
        session = await session.save()
    }
    
    // 이제 카드 갯수를 세어보자고
    let num_total_cards = {
        yet : 0, 
        re :0, 
        hold : 0, 
        completed :0, 
        total :0, 
        re_until_now : 0, 
        re_until_today : 0,
    }

    for (i=0; i<session.booksnindexes.length; i++){
        for(j=0; j<session.booksnindexes[i].indexes.length; j++){
            num_total_cards.yet += session.booksnindexes[i].indexes[j].yet
            num_total_cards.re += session.booksnindexes[i].indexes[j].re
            num_total_cards.hold += session.booksnindexes[i].indexes[j].hold
            num_total_cards.completed += session.booksnindexes[i].indexes[j].completed
            num_total_cards.total += session.booksnindexes[i].indexes[j].total
            num_total_cards.re_until_now += session.booksnindexes[i].indexes[j].re_until_now
            num_total_cards.re_until_today += session.booksnindexes[i].indexes[j].re_until_today            
        }    
    }

    // 일단 num total cards는 저장 안 하고 넘어가도록 함

    res.json({isloggedIn : true, session_id, num_total_cards});    
}


// 책의 순서를 올립니다.
exports.click_up = async (req, res) => {
    console.log("책아! 위로 올라갓!");
    console.log(req.body);

    // 기본 정보를 만들고
    let session = await Session.findOne({_id : req.body.session_id},{booksnindexes : 1})
    // 대상 책의 시퀀스를 찾아보자.
    let seq_of_the_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)

    // 순서를 조정하자
    if(seq_of_the_book === 0) {
        console.log('오를 데가 없어요')
        return
    } else {        
        [session.booksnindexes[seq_of_the_book-1], session.booksnindexes[seq_of_the_book]] = [session.booksnindexes[seq_of_the_book], session.booksnindexes[seq_of_the_book-1]]        
        session = await session.save()
    }    
    
    
    // 책과 인덱스 리스트를 받아옵니다.
    let booksnindexes = await get_booksnindexes(session)

    res.json({isloggedIn : true, booksnindexes,});    
}

// 책의 순서를 내립니다.
exports.click_down = async (req, res) => {
    console.log("책아! 아래로 내려갓!");
    console.log(req.body);

    // 기본 정보를 만들고
    let session = await Session.findOne({_id : req.body.session_id},{booksnindexes : 1})    
    // 대상 책의 시퀀스를 찾아보자.
    let seq_of_the_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)    

    // 순서를 조정하자
    if(seq_of_the_book === (session.booksnindexes.length-1)) {
        console.log('내릴 데가 없어요')        
    } else {        
        [session.booksnindexes[seq_of_the_book], session.booksnindexes[seq_of_the_book+1]] = [session.booksnindexes[seq_of_the_book+1], session.booksnindexes[seq_of_the_book]]        
        session = await session.save()        
    }    
    
    // 책과 인덱스 리스트를 받아옵니다.
    let booksnindexes = await get_booksnindexes(session)

    res.json({isloggedIn : true, booksnindexes,});  
}

// 해당 목차의 카드를 전달합니다.
exports.start_study = async (req, res) => {
    console.log("공부를 시작합시다.");
    console.log(req.body);
    
    let session = await Session.findOne({_id : req.body.session_id})
    // console.log('session', session)
    
    // let bookNindex_list = await Selected_bookNindex
    //     .find({session_id : req.body.session_id})
    //     .sort({seq : 1})

    // 스터디 콘피그 수정해주고
    let study_config_update_object = {
        'study_config.study_mode' : req.body.study_mode,
        // read, flip, exam
        'study_config.card_order' : req.body.card_order,
        // sort_by_index, sort_by_restudytime, random
        'study_config.re_card_collect_criteria' : req.body.re_card_collect_criteria,
        // all, now, today
        'study_config.on_off.yet' : req.body.on_off.yet,
        'study_config.on_off.re' : req.body.on_off.re,
        'study_config.on_off.hold' : req.body.on_off.hold,
        'study_config.on_off.completed' : req.body.on_off.completed,
        'study_config.num_cards.yet' : req.body.num_cards.yet,
        'study_config.num_cards.re' : req.body.num_cards.re,
        'study_config.num_cards.hold' : req.body.num_cards.hold,
        'study_config.num_cards.completed' : req.body.num_cards.completed,
    }
    if(session.booksnindexes.length ===1){
        let book_config_modi_result = await Book.updateOne(
            {_id : session.booksnindexes[0].book_id}, study_config_update_object)
    } else if(session.booksnindexes.length > 2){
        let user_config_modi_result = await User.updateOne(
            {user_id : req.session.passport.user}, study_config_update_object)            
    };

    // -------------------------------------- 토 탈 -----------------------------------------------------
    // 리스트를 하나로 통합하고
    let cardlist_total = []
    // 책 단위로 카드를 받아서 통합하자
    for (i=0; i<session.booksnindexes.length; i++){
        let index_ids = session.booksnindexes[i].indexes.map((index_array) => index_array.index_id)
        cardlist_of_singlebook = await Card
            .find({index_id : index_ids},
                {cardtype : 1, book_id :1, index_id :1, status :1, seq_in_index :1, need_study_time :1})        
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }

    // 토탈 카드리스트에 시퀀스 정보를 생성합니다.
    for (i=0; i<cardlist_total.length; i++) {        
        cardlist_total[i].seq_in_total = i        
    }

    // 이걸 세션에 저장하고
    session.cardlist_total = cardlist_total
    
    // -------------------------------------- 세 파 -----------------------------------------------------
    // 이걸 속성으로 분리하고
    session.cardlist_sepa.yet = cardlist_total.filter((card) => card.status === 'yet')    
    session.cardlist_sepa.re = cardlist_total.filter((card) => card.status === 're')
    session.cardlist_sepa.hold = cardlist_total.filter((card) => card.status === 'hold')
    session.cardlist_sepa.completed = cardlist_total.filter((card) => card.status === 'completed')

// -------------------------------------- 워 킹 템 프 -----------------------------------------------------
    // 다시 하나로 묶어서 정리해주고 cardlist_working으로 만들어준다.
    let cardlist_working_tmp = []
    cardlist_working_tmp = cardlist_working_tmp.concat(session.cardlist_sepa.yet.slice(0, req.body.num_cards.yet))
    cardlist_working_tmp = cardlist_working_tmp.concat(session.cardlist_sepa.re.slice(0, req.body.num_cards.re))
    cardlist_working_tmp = cardlist_working_tmp.concat(session.cardlist_sepa.hold.slice(0, req.body.num_cards.hold))
    cardlist_working_tmp = cardlist_working_tmp.concat(session.cardlist_sepa.completed.slice(0, req.body.num_cards.completed))
    
    cardlist_working_tmp3
        .sort((a,b) => a.index_id.seq - b.index_id.seq)
        .sort((a,b) => a.seq_in_index - b.seq_in_index)
    
    // 불필요한 거 지워주자
    delete cardlist_working_tmp.status
    delete cardlist_working_tmp.index_id
    delete cardlist_working_tmp.seq_in_index
    delete cardlist_working_tmp.seq_in_total

    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    let now = Date.now()        
    for (i=0; i<cardlist_working_tmp.length; i++){        
        if (cardlist_working_tmp[i].need_study_time === null || cardlist_working_tmp[i].need_study_time > now){
            cardlist_working_tmp[i].need_study_time = now
        }
    }
    
    session.num_used_cards = {
        yet : req.body.num_cards.yet,
        re : req.body.num_cards.re,
        hold : req.body.num_cards.hold,
        completed : req.body.num_cards.completed,
    }
    
    // -------------------------------------- 워 킹 -----------------------------------------------------
    session.cardlist_working = cardlist_working_tmp
    // console.log('cardlist_working', session.cardlist_working)
    session = await session.save()
}

exports.get_studying_cards = async (req, res) => {
    console.log("카드 받으셔요~");
    console.log(req.body);

    // 여기서 current_seq와 num_request_cards를 받아야 해
    let session = await Session.findOne({_id : req.body.session_id}, {seq_in_working : 1, cardlist_working : 1})        
    // console.log('session', session.cardlist_working)
    
    // 필요 없는 영역은 잘라내고
    session.cardlist_working.splice(req.body.current_seq+req.body.num_request_cards,1000000)
    if (req.body.current_seq >0){
        session.cardlist_working.splice(0,req.body.current_seq)
    }

    // seq_in_working 만들어주고,
    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    for (i=0; i<session.cardlist_working.length; i++){
        session.cardlist_working[i].seq_in_working = req.body.current_seq+i
    }

    // 컨텐츠 붙여주고
    let cards_to_send = await Session.populate(session, 
        {path : 'cardlist_working._id', 
        select : 'cardtype_id cardtype status content_of_importance content_of_first_face content_of_second_face content_of_third_face content_of_annot exp level'})

    // console.log('cards_to_send', cards_to_send)
    res.json({isloggedIn : true, cards_to_send});
}

exports.get_study_configuration = async (req, res) => {
    console.log("학습 설정을 보내드립니다.");
    console.log(req.body);

    let study_configuration = await Study_configuration.findOne({book_id : req.body.book_id})

    res.json({isloggedIn : true, study_configuration})  
}


exports.set_study_configuration = async (req, res) => {
    console.log("학습 설정을 바꾸셨군요.");
    console.log(req.body);

    let study_configuration = await Study_configuration.findOne({book_id : req.body.book_id})

    study_configuration.difficulty_setting = req.body.difficulty_setting
    study_configuration.exp_setting = req.body.exp_setting
    study_configuration.lev_setting = req.body.lev_setting

    study_configuration = await study_configuration.save()

    res.json({isloggedIn : true, msg : "수정 완료"})  
}

exports.get_all_study_configurations = async (req, res) => {
    console.log("학습 설정을 다 보내드립죠.");
    console.log(req.body);

    let selected_bookNindex_list = await Selected_bookNindex
        .find({session_id : req.body.session_id})
        .sort({seq : 1})

    let book_ids = []
    for (i=0; i<selected_bookNindex_list.length; i++){
        book_ids.push(selected_bookNindex_list[i].book_id)
    }

    let study_configurations = await Study_configuration.find({book_id : book_ids})

    res.json({isloggedIn : true, study_configurations})  
}

exports.temp = async (req, res) => {
    // 순서를 섞어야되믄 순서를 섞고
    if(req.body.card_order === 'shuffle'){
        for (let i = total_cardlist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
            [array[i], array[j]] = [array[j], array[i]];
        }    
    }

    // 복습 필요 순서로 정렬해야되믄 정렬도 하고
    if(req.body.card_order === 'sort_by_time'){
        cardlist.sort((a,b) => a.willstudy_time - b.willstudy_time)
    }

    // 다 됐으믄 전체 리스트를 수정하자고하자고
    let studyingcard_total = await Studyingcard_total.updateOne(
        {user_id : req.user},
        {cardlist : total_cardlist}
    )
    
    // 복습카드와 신규카드를 구분하는 작업이 필요함

    // 다 됐으믄 현재 공부카드만 남겨놓자고
    
    let studyingcard_current = await Studyingcard_current.updateOne(
        {user_id : req.user},
        {cardlist : current_cardlist}
    )

    res.json({isloggedIn : true, cardlist});
};


// 순서 섞는 함수
const shuffle = function(array) {
    // Math.floor -> 내림
    // Math.random -> 0과 1사이 난수
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
      [array[i], array[j]] = [array[j], array[i]];
    }
}

const get_booksnindexes = async function(session){
    // let session = await Session.findOne({_id : session_id},{booksnindexes : 1})    
    let booksnindexes = []
    for (i=0; i<session.booksnindexes.length; i++){
        let indexes_of_the_book = await Index
            .find({book_id : session.booksnindexes[i].book_id})
            .sort({seq : 1})        
        let single_bookNindex = {
            book_id : session.booksnindexes[i].book_id,
            title : session.booksnindexes[i].title,
            index_ids : indexes_of_the_book,
        }
        booksnindexes.push(single_bookNindex)
    }
    return booksnindexes
}


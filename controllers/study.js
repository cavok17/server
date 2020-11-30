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
const Selected_index = require('../models/selected_index');
const Studyingcard_total = require('../models/studyingcard_total');
const Studyingcard_current = require('../models/studyingcard_current');

// 선택된 책 정보를 세션에 저장합니다.
exports.save_booklist_in_session = async (req, res) => {
    console.log("선택된 책 정보를 세션에 저장합니다.");
    console.log(req.body);        

    if (req.body.book_ids){
        req.session.book_ids = req.body.book_ids        
        console.log('Sucess!!!!!!!!!!!!!')
    }

    res.json({msg : 'Sucess!!!!!!!!!!!!!'})
}



// 선택된 책의 인덱스를 보내줍니다..
exports.get_index = async (req, res) => {
    console.log("선택된 책의 인덱스를 보내줍니다.");
    console.log('body', req.body);    
    
    // 책과 인덱스 정보를 요청합니다.
    let book_and_index_list = []
    for (i=0; i<req.session.book_ids.length; i++){
        let book = await Book.findOne({_id : req.session.book_ids[i]},
            {title : 1})        
        // 파퓰된 녀석들 기준으로 sort가 안 되는 것 같아서 따로 find를 함
        let index = await Index.find({book_id : req.session.book_ids[i]})
            .sort({seq : 1})
        let book_and_index = {book, index}        
        book_and_index_list.push(book_and_index)
    }

    // 목차 선택에서 선택된 목차를 저장할 selected_index를 초기화합니다.
    let selected_index = []
    // 개별 책 단위로 오브젝트를 만들고, 이걸 하나의 배열에 밀어 넣는다.
    req.session.book_ids.forEach((book_id, index) => {        
        let single_set = {
            user_id : req.session.passport.user,
            book_id : book_id,
            seq : index,
            index : []
        }
        selected_index.push(single_set)
    })        
    // 그리고는 선택된 책 기준으로 리셋을 헌다.
    let delete_result = await Selected_index.deleteMany(
        {user_id : req.session.passport.user}
    )
    let selected_index_update = await Selected_index.insertMany(selected_index)

    console.log('여기까진 문제 없죠?')
    // 학습 설정 관련 값도 뿌려주려고 합니다.
    // 책마다 설정이 있긴 한데, 두 권 이상인 경우에는 두권 이상짜리 설정을 사용합니다.
    if (req.session.book_ids.length >= 2){
        study_config = await User.findOne({user_id : req.session.passport.user}, {study_config : 1, _id : 0})        
    } else {
        study_config = await Book.findOne({id : req.session.book_ids[0]}, {study_config : 1, _id : 0})
    }
    
    res.json({isloggedIn : true, book_and_index_list, study_config});    
}

// 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
exports.click_index = async (req, res) => {
    console.log("인덱스 선택했니? 잘했다야");
    console.log(req.body);

    let num_total = await Card.countDocuments({index_id : req.body.index_id})
    let num_new  = await Card.countDocuments({index_id : req.body.index_id, willstudy_time : null})
    let num_need_study = 0
    // num_need_study = await Card.countDocuments({index_id : req.body.index_id, willstudy_time})
    
    if (req.body.status === true) {
        req.session.num_total += num_total
        req.session.num_new += num_new
        req.session.num_need_study += num_need_study
    } else {
        req.session.num_total -= num_total
        req.session.num_new -= num_new
        req.session.num_need_study -= num_need_study
    }
    let num_card = {
        num_total : req.session.num_total, 
        num_new : req.session.num_new, 
        num_need_study : req.session.num_need_study}    

    if (req.body.status === true){
        selected_index = await Selected_index.updateOne(
            {book_id : req.body.book_id},
            {$push : {selected_index : req.body.index_id}})
    } else if (req.body.status === false){
        selected_index = await Selected_index.updateOne(
            {book_id : req.body.book_id},
            {$pull : {selected_index : req.body.index_id}})
    }

    console.log(num_card)
    res.json({num_card})
}


// 해당 목차의 카드를 전달합니다.
exports.start_study = async (req, res) => {
    console.log("공부를 시작합시다.");
    console.log(req.body);
    
    // 스터디 콘피그 수정해주고
    if(req.body.study_area.length ===1){
        book_modi_result = await Book.updateOne(
            {_id : req.body.study_area.length[0].book_id},
            {'study_config.num_card_new' : req.body.num_card_new,
            'study_config.num_card_re' : req.body.num_card_re,
            'study_config.card_order' : req.body.card_order}
        )
    } else {
        user_modi_result = await User.updateOne(
            {user_id : req.user},
            {'study_config.num_card_new' : req.body.num_card_new,
            'study_config.num_card_re' : req.body.num_card_re,
            'study_config.card_order' : req.body.card_order}
        )
    };

    // 이제 전체 리스트를 만들어보자
    // 일단 해당 조건의 카드를 받아와
    let total_cardlist = []
    for (i=0; i<req.body.study_area.length; i++){        
        let tmp_cardlist = await Card
            .find({
                book_id : req.body.study_area[i].book_id,
                index_id : req.body.study_area[i].index_id},                
                {cardtype_id : 1, index_id : 1, seq_in_index : 1, willstudy_time :1})
            .populate({path : 'index_id', select : 'seq'})
            .sort({'seq_in_index' : 1})
            // .sort({'index_id.seq' : 1, seq_in_index : 1, })            
            
        // populate한 것으로는 sort는 안 되는구만 따로 정렬을 시켜야 함
        tmp_cardlist.sort((a,b) => a.index_id.seq - b.index_id.seq )        
        total_cardlist.push(tmp_cardlist)
    }

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
    


    // // 공부 대상 전체 리스트를 일단 저장하고
    // let studyingcard_first = await Studyingcard_first.updateOne(
    //     {user_id : req.user},
    //     {cardlist : cardlist});
    
    // // 갯수를 제한해서 실제로 공부할 녀석만 발라내고
    // let studyingcard_second = cardlist.slice()

    // 세컨드에 저장한다.

    // 그리고 거기서 열 장만 뽑아서 뿌려준다.


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

// 복습 필요 순으로 정렬
const sort_by_time = function(array) {        
    array.sort((a,b) => a.recent_study_time - b.recent_study_time)
}

// 새 카드들은 복습 필요 시점을 만들어 줘야 할 듯... 이건 아니군

// 필요 개수만큼 짜르고
// splice로

// 거기에 card_id만 발라서 그때그때 find를 한다.

// 현재까지 본 카드 넘버를 어딘가에서 관리해주고. 프론트에서 하라고 하자. 아님 세션

// 난이도 평가를 하면....원본에 업데이트하고
// phase 2에는 복습 필요시점만 업데이트하고







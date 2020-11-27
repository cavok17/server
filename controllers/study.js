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
const book = require('../models/book');


// 인덱스를 보내줍니다..
exports.get_index = async (req, res) => {
    console.log("인덱스를 보내줍디다.");
    console.log(req.body);

    let book_and_index_list = [] 

    for (i=0; i<req.body.book_ids.length; i++){
        let book = await Book.findOne({book_id : req.body.book_ids[i]},
            {title : 1})
        let index = await Index.find({book_id : req.body.book_ids[i]})
            .sort({seq : 1})
        let book_and_index = {book, index}
        book_and_index_list.push(book_and_index)
    }

    console.log(book_and_index_list)
    res.json({isloggedIn : true, book_and_index_list, });    
}

// 해당 목차의 카드를 전달합니다.
exports.start_study = async (req, res) => {
    console.log("공부를 시작합시다.");
    console.log(req.body);

    let cardlist = []
    for (i=0; i<req.body.index_array.length; i++){
        let tmp_cardlist = await Card
            .find({
                book_id : req.body.index_array[i].book_id,
                index_id : req.body.index_array[i].index_id},
                {cardtype_id : 1, index_id : 1, seq_in_index : 1, willstudy_time :1})
        // 인덱스의 시퀀스가 필요하면 파퓰레이트 시키면 되겠지요.
        cardlist.push(tmp_cardlist)
    }
    
    // 순서를 섞고
    if(req.body.shuffle == true){
        for (let i = cardlist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
            [array[i], array[j]] = [array[j], array[i]];
        }    
    }

    // 복습 필요 순서로 정렬하고
    if(req.body.sort_by_time == true){
        cardlist.sort((a,b) => a.willstudy_time - b.willstudy_time)
    }

    // 공부 대상 전체 리스트를 일단 저장하고
    let studyingcard_first = await Studyingcard_first.updateOne(
        {user_id : req.user},
        {cardlist : cardlist});
    
    // 갯수를 제한해서 실제로 공부할 녀석만 발라내고
    let studyingcard_second = cardlist.slice()

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







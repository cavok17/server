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



// 카드를 가져옵니다.
exports.get_cardlist = async (req, res) => {
    console.log("카드리스트를 보내줄게요");
    console.log(req.body);

    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});

};

// 카드를 만들어봅니다.
exports.create_card = async (req, res) => {
    console.log("카드를 만들어봅시다");
    console.log(req.body);

    let new_seq_in_index
    if (req.body.seq_in_index){
        new_seq_in_index = req.body.seq_in_index + 1
        let seq_modi_result = await Card.updateMany(
            {index_id : req.body.index_id,
            seq_in_index : {$gte : new_seq_in_index}},
            {$inc : {seq_in_index : 1}}
        )
    } else {
        let max_seq = await get_max_seq(req.body.index_id)
        new_seq_in_index = max_seq + 1
    }
    
    console.log('new_seq_in_index', new_seq_in_index)

    let card = await Card.create({
        cardtype_id: req.body.cardtype_id,
        book_id: req.session.book_id,
        index_id: req.body.index_id,        
        seq_in_index: new_seq_in_index,
        content_of_importance : req.body.importance,
        content_of_first_face : req.body.first_face,
        content_of_second_face : req.body.second_face,
        content_of_third_face : req.body.third_face,
        content_of_annot : req.body.annotation,
    })    
    
    let cardlist = await get_cardlist_func(req.body.index_id)
    res.json({isloggedIn : true, cardlist});
};

// 엑셀 파일로 카드를 생성합니다.
exports.create_card_by_excel = async (req, res) => {
    console.log("엑셀 파일로 카드를 생성합니다.");
    console.log(req.file);
    console.log(req.body);
    
    let max_seq = await get_max_seq(req.body.index_id)

    // 일단 해당책의 카드타입을 다 가져오시오.
    let cardtypes = await Cardtype.find({book_id : req.session.book_id},
        {nick:1, importance:1, num_column:1});
    console.log(cardtypes)

    let new_cards = []
    let failure_list = []
    let current_row 
    readXlsxFile(req.file.path).then((table) =>{
        // for (row in table){
        // table.forEach((row)=>{
        // let new_cards = []
        // let failure_list = []
        // console.table(table)

        for (i=0; i<table.length; i++){            
            let content_of_importance = []
            let content_of_first_face = [] 
            let content_of_second_face = []
            let content_of_third_face = []
            let content_of_annot = []            
            let new_card = []  
            
            current_row = 1            
            max_seq += 1
            
            // 각 행에 매칭되는 카드타입을 찾아야 혀.
            let cardtype = cardtypes.find((tmp_cardtype) => {
                // console.log(row[0])
                return tmp_cardtype.nick === table[i][0]
            })
            // console.log('table[i]',table[i])            

            // 만약 매칭되는 게 없으믄 failure_list에 추가하고, for문을 위로 올려줘요
            // foreach를 쓰믄 continue가 안 먹네 for in이나 for of를 써야제
            if(cardtype == null){
                failure_list.push(i+1)
                continue;
            }            
            
            if (cardtype.importance === true){
                content_of_importance.push(table[i][current_row])                
                current_row += 1
            };            

            for (j=0; j < cardtype.num_column.face1; j++){                
                content_of_first_face.push(table[i][current_row])
                current_row += 1};            

            for (j=0; j < cardtype.num_column.face2; j++){                
                content_of_second_face.push(table[i][current_row])
                current_row += 1};            

            for (j=0; j < cardtype.num_column.face3; j++){
                content_of_third_face.push(table[i][current_row])
                current_row += 1};                

            for (j=0; j < cardtype.num_column.annot; j++){
                content_of_annot.push(table[i][current_row]);
                current_row += 1};
            
            
            // new_card 객체를 만들고
            new_card = {
                cardtype_id: cardtype._id,
                book_id: req.session.book_id,
                index_id: req.body.index_id,        
                seq_in_index: max_seq,
                seq_in_total : null,
                seq_in_working : null,
                content_of_importance,
                content_of_first_face,
                content_of_second_face,
                content_of_third_face,
                content_of_annot,
            }
            // new_cards에 잘 모아놓고
            new_cards.push(new_card)
        }
                
        fs.unlink(req.file.path)

        return new_cards
    }).then((new_cards) => {
        // console.log('new_cards', new_cards)
        console.log('failure_list', failure_list)
        console.log('저장해야지');
        let cards = Card.insertMany(new_cards)
    })    
    
    let cardlist = await get_cardlist_func(req.body.index_id)
    res.json({isloggedIn : true, msg : '업로드 완료', cardlist});

};
    

// 카드 순서를 변경합니다.
exports.change_card_order = async (req, res) => {
    console.log("카드 순서를 변경합니다.");
    console.log(req.body);

    let current_seq_card = await Card.findOne({_id : req.body.card_id});
    // let current_seq = current_seq_card[0].seq_in_index;
    let current_seq = req.body.seq_in_index;
    let target_seq = req.body.target_seq;

    if (current_seq > target_seq){
        let seq_change_result = await Card.updateMany(
            {index_id : req.body.index_id, 
            seq_in_index : {$gt : target_seq},
            seq_in_index : {$lt : current_seq}},
            {$inc : {seq_in_index : 1}})
        current_seq_card.seq_in_index = target_seq +1;
        current_seq_card = await current_seq_card.save();
    } else {
        let seq_change_result = await Card.updateMany(
            {index_id : req.body.index_id, 
            seq_in_index : {$gt : current_seq},
            seq_in_index : {$lte : target_seq}},
            {$inc : {seq_in_index : 1}})
        current_seq_card.seq_in_index = target_seq +1;
        current_seq_card = await current_seq_card.save();
    } 

    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});
};

// 카드 내용을 변경합니다.
exports.change_card = async (req, res) => {
    console.log("카드 내용을 변경합니다.");
    console.log(req.body);

    let card_edit_result = await Card.updateOne(
        {_id : req.body.card_id},
        {
           cardtype_id : req.body.cardtype_id,
           content_of_importance :  req.body.importance,
           content_of_first_face : req.body.first_face,
           content_of_second_face : req.body.second_face,
           content_of_third_face : req.body.third_face,
           content_of_annot : req.body.annotation,           
        });    

    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});
};

// 카드를 삭제합니다.
exports.delete_card = async (req, res) => {
    console.log("카드를 삭제합니다.");
    console.log(req.body);

    let card_delete_result = await Card.deleteOne({_id : req.body.card_id})
    let seq_modi_result = await Card.updateMany(
        {index_id : req.body.index_id,
        seq_in_index : {$gt : req.body.seq_in_index}},
        {$inc : {seq_in_index : -1}})    

    let cardlist = get_cardlist_func(req.body.index_id)
    res.json({isloggedIn : true, cardlist});
};

// 카드를 대량 삭제합니다.
exports.delete_many_card = async (req, res) => {
    console.log("카드를 삭제합니다.");
    console.log(req.body);

    let card_delete_result = await Card.deleteMany({$in : {_id : req.body.card_id}})    
    
    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});
};

// 카드를 대량으로 다른 인덱스로 이동합니다.
exports.move_many_card = async (req, res) => {
    console.log("카드를 삭제합니다.");
    console.log(req.body);

    // 타겟 인덱스의 마지막 시퀀스를 구합니다.
    let max_seq = await get_max_seq(req.body.index_id);

    // 카드의 인덱스 아이디와 시퀀스 정보를 변경합니다.
    let card_modi_result = await Card.updateMany(
        {$in : {_id : req.body.card_id}},
        {index_id : req.body.index_id,
        $inc : {seq_in_index : max_seq}})

    // 근데 불안하단 말야. 시퀀스 정보가 폭발할까봐
    // 음 max_seq가 크면 seq를 함 정리하는 것도 방법이겠구만    
    
    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});

}





// max 시퀀스를 찾아드립니다.
const get_max_seq = async (index_id) => {   
    
    let max_seq_card = await Card
        .find({index_id : index_id})
        .select('seq_in_index')
        .sort({seq_in_index : -1})
        .limit(1)    
    if (max_seq_card.length ===0){
        return -1
    } else {        
        return max_seq_card[0].seq_in_index
    }    
}

// 카드리스트를 보내드려요~
const get_cardlist_func = async (index_id) => {
    let cardlist = await Card
        .find({index_id : index_id})
        .sort({seq_in_index : 1})
        .populate('external_card_id')
        .populate('cardtype_id')
    
    return cardlist
}
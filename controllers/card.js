const mongoose = require("mongoose");
const multer = require('multer');
const upload = multer({dest : 'uploads/'});

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
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

    let max_seq = await get_max_seq(req.body.index_id)
    console.log('max_seq', max_seq)

    let card = await Card.create({
        cardtype_id: req.body.cardtype_id,
        book_id: req.session.book_id,
        index_id: req.body.index_id,        
        seq_in_index: max_seq + 1,        
    })

    let content = await Content.create({
        card_id : card._id,
        importance : req.body.importance,
        first_face : req.body.first_face,
        second_face : req.body.second_face,
        third_face : req.body.third_face,
        annotation : req.body.annotation,
    })

    let content_id_update = await Card.updateOne(
        {_id : card._id},
        {content_id : content._id}
    )
    
    let cardlist = await get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});

};

// 카드 순서를 변경합니다.
exports.change_card_order = async (req, res) => {
    console.log("카드 순서를 변경합니다.");
    console.log(req.body);

    let current_seq_card = await Card.findOne({_id : req.body.card_id});
    let current_seq = current_seq_card[0].seq_in_index;
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
           importance :  req.body.importance,
        });
    let content_edit_result = await Content.updateOne(
        {card_id : req.body.card_id},
        {
           first_face : req.body.first_face,
           second_face : req.body.second_face,
           third_face : req.body.third_face,
           annotation : req.body.annotation,           
        }
    );    

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
    let content_delete_result = await Content.deleteOne({card_id : req.body.card_id});    

    let cardlist = get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});
};

// 카드를 대량 삭제합니다.
exports.delete_many_card = async (req, res) => {
    console.log("카드를 삭제합니다.");
    console.log(req.body);

    let card_delete_result = await Card.deleteMany({$in : {_id : req.body.card_id}})
    let content_delete_result = await Content.deleteMany({$in : {_id : req.body.card_id}})
    
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
        .sort({seq_in_index : -1})
        .populate('content_id')
    
    return cardlist
}
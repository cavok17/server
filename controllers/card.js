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

    cardlist = get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});

};

// 카드를 만들어봅니다.
exports.create_card = async (req, res) => {
    console.log("카드를 만들어봅시다");
    console.log(req.body);

    let card = await Card.create({
        cardtype_id: req.body.cardtype_id,
        book_id: req.body.book_id,
        index_id: req.body.index_id,        
        // content_id : content._id,
        seq_in_index: get_max_seq(req.body.index_id),        
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
    
    cardlist = get_cardlist_func(req.body.index_id)

    res.json({isloggedIn : true, cardlist});

};

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
        return max_seq_card.seq_in_index
    }    
}

// 카드리스트를 보내드려요~
const get_cardlist_func = async (index_id) => {
    let cardlist = await Card
        .find({index_id : index_id})
        .sort({seq_in_index : -1})
        .pupulate('content_id')
    
    return cardlist
}
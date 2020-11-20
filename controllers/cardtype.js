const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');
const Cardtype = require('../models/cardtype');
const book = require('../models/book');

// 카드타입 리스트를 보여줍니다.
const get_cardtypeList = async(req, res) => {
    console.log('카드타입 리스트를 보여줍니다.');
    console.log(req.body);

    const cardtypes = await Cardtype.find({book_id : req.session.book_id})
        .sort ({seq : 1})
    

    res.json({isloggedIn : true, cardtypes});
};

// 카드타입을 생성합니다.
const create_cardtype = async(req, res) => {
    console.log('카드타입을 생성합니다.');
    console.log(req.body);

    // 신규카드의 시퀀스를 생성합니다.
    let max_seq_cardtype = await Cardtype.find({book_id : req.session.book_id}, {seq : 1, _id : 0})
        .sort ({seq : -1})
        .limit(1);
    let max_seq;
    if(max_seq_cardtype.length ===0){
        max_seq = -1
    } else {
        max_seq = max_seq_cardtype[0].seq
    }
    
    // direction하고 ratio를 정의합니다.
    let direction;
    let ratio = {};
    switch (req.body.type) {
        case 'face1' : 
            direction = null;
            if(req.body.annotation = true){
                ratio.face1 = 80;
                ratio.face2 = 0;
                ratio.face3 = 0;
                ratio.annot = 20;
            } else {
                ratio.face1 = 100;
                ratio.face2 = 0;
                ratio.face3 = 0;
                ratio.annot = 20;
            };
        case 'face2' :
            direction = 'up_down';
            if(req.body.annotation = true){
                ratio.face1 = 80;
                ratio.face2 = 80;
                ratio.face3 = 0;
                ratio.annot = 20;
            } else {
                ratio.face1 = 100;
                ratio.face2 = 100;
                ratio.face3 = 0;
                ratio.annot = 0;
            };
        case 'face3' :
            direction = 'up_down';
            if(req.body.annotation = true){
                ratio.face1 = 80;
                ratio.face2 = 80;
                ratio.face3 = 80;
                ratio.annot = 20;
            } else {
                ratio.face1 = 100;
                ratio.face2 = 100;
                ratio.face3 = 100;
                ratio.annot = 0;
            };
    }

    //생성합니다.
    let cardtype = await Cardtype.create({
        book_id : req.session.book_id,
        seq : max_seq + 1,
        type : req.body.type,
        nick : req.body.nick,
        importance : req.body.importance,
        num_column : {
            face1 : req.body.face1,
            face2 : req.body.face2,
            face3 : req.body.face3,
            annot : req.body.annot,
        },
        direction : direction,
        ratio: {
            face1 : ratio.face1,
            face2 : ratio.face2,
            face3 : ratio.face3,
            annot : ratio.annot,
        },
    });
    
    get_cardtypeList(req, res);
};

// 카드타입의 nick을 변경합니다.
const change_cardtype_nick = async(req, res) => {
    console.log('카드타입 nick을 변경합니다.');
    console.log(req.body);

    let cardtype = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {nick : req.body.nick}
    );
    

    get_cardtypeList(req, res);
};

// 카드타입의 순서를 조정합니다.
const change_cardtype_order = async (req, res) => {    
    console.log('카드타입 순서 좀 조정할게');
    
    // 목적지 카테고리를 정의합니다.
    let destination_cardtype;
    if (req.body.action === 'up'){
        destination_cardtype = await Category
            .find({
                book_id : req.session.book_id,
                seq : {$lt : req.body.seq}})
            .sort({seq : -1})
            .limit(1);            
    } else {
        destination_cardtype = await Category
            .find({
                book_id : req.session.book_id,
                seq : {$gt : req.body.seq}})
            .sort({seq : 1})
            .limit(1);
    };

    // 갈아 끼웁니다.
    let current_cardtype_move_result = await Category.updateOne(
        {_id : req.body.cardtype_id},
        {seq : destination_cardtype[0].seq}        
    );
    let destination_cardtype_move_result = await Category.updateOne(
        {_id : destination_cardtype[0]._id},
        {seq : req.body.seq}        
    );

    get_cardtypeList(req, res);
};


module.exports ={
    get_cardtypeList,
    create_cardtype,
    change_cardtype_nick,
    change_cardtype_order,
};
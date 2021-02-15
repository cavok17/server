const mongoose = require("mongoose");

// 모델 경로
const Category = require('../models/category');
const Cardtype = require('../models/cardtype');

const get_cardtypelist_func = async(req, res) => {
    const cardtypes = await Cardtype.find({book_id : req.body.book_id})
        .sort ({seq : 1})
    
    return cardtypes
}

// 카드타입 리스트를 보여줍니다.
exports.get_cardtypelist = async(req, res) => {
    console.log('카드타입 리스트를 보여줍니다.');
    console.log(req.body);

    let cardtypes = await Cardtype.find({book_id : req.body.book_id})        
        .sort ({seq : 1})

    res.json({isloggedIn : true, cardtypes});
};

// 카드스타일을 수정합니다
exports.update_cardstyle = async(req, res) => {
    console.log('카드스타일을 수정합니다.');
    console.log(req.body);

    let card_style = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {card_style : req.body.card_style}
    )

    let cardtypes = await Cardtype.find({book_id : req.body.book_id})        
        .sort ({seq : 1})
    
    res.json({isloggedIn : true, cardtypes});

}

// 면스타일을 수정합니다
exports.update_facestyle = async(req, res) => {
    console.log('면스타일을 수정합니다.');
    console.log(req.body);

    let updated_face_name = 'face_style.' + req.body.updated_face_name
    let update_object = {}
    update_object[updated_face_name] = req.body.updated_face_style
    let face_style = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {update_object}
    )

    let cardtypes = await Cardtype.find({book_id : req.body.book_id})        
        .sort ({seq : 1})
    
    res.json({isloggedIn : true, cardtypes});

}

// 행스타일을 수정합니다
exports.update_rowstyle = async(req, res) => {
    console.log('행스타일을 수정합니다.');
    console.log(req.body);

    let updated_face_name = 'row_style.' + req.body.updated_face_name    

    let update_object = {}
    update_object[updated_face_name] = req.body.updated_row_style
    let row_style = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {update_object}
    )

    let cardtypes = await Cardtype.find({book_id : req.body.book_id})        
        .sort ({seq : 1})
    
    res.json({isloggedIn : true, cardtypes});

}

// 폰트를 수정합니다
exports.update_fontstyle = async(req, res) => {
    console.log('폰트스타일을 수정합니다.');
    console.log(req.body);

    let updated_face_name = 'font_style.' + req.body.updated_face_name    

    let update_object = {}
    update_object[updated_face_name] = req.body.updated_font_style
    let font_style = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {update_object}
    )

    let cardtypes = await Cardtype.find({book_id : req.body.book_id})        
        .sort ({seq : 1})
    
    res.json({isloggedIn : true, cardtypes});

}




// 카드타입을 생성합니다.
exports.create_cardtype = async(req, res) => {
    console.log('카드타입을 생성합니다.');
    console.log(req.body);

    // 신규카드의 시퀀스를 생성합니다.
    let max_seq_cardtype = await Cardtype
        .find({book_id : req.body.book_id}, {seq : 1, _id : 0})
        .sort ({seq : -1})
        .limit(1);
    let max_seq;
    if(max_seq_cardtype.length ===0){
        max_seq = -1
    } else {
        max_seq = max_seq_cardtype[0].seq
    }
    
    
    let cardtype = {}
    cardtype.book_id = req.body.book_id
    cardtype.type = req.body.type
    cardtype.name = req.body.name
    cardtype.seq = max_seq + 1
    cardtype.num_of_row = {}
    cardtype.nick_of_row = {}

    if (cardtype.type ==='none' || cardtype.type ==='share' ){
        cardtype.num_of_row.maker_flag = 0
    } else {
        cardtype.num_of_row.maker_flag = 1
    }
    cardtype.num_of_row.none = req.body.none
    cardtype.num_of_row.share = req.body.share
    cardtype.num_of_row.face1 = req.body.face1
    cardtype.num_of_row.selection = req.body.selection
    cardtype.num_of_row.face2 = req.body.face2     
    cardtype.num_of_row.annotation = 1    
    
    let cur_alphabet = 'B'
    for (let name of ['none', 'share', 'face1', 'selection', 'face2']) {
        cardtype.nick_of_row[name]=[]
        for (i=0; i<req.body[name]; i++) {
            cardtype.nick_of_row[name].push(String.fromCharCode(cur_alphabet.charCodeAt() + 1))
            cur_alphabet = String.fromCharCode(cur_alphabet.charCodeAt() + 1)
        }
    }

    //생성합니다.
    let new_cardtype = await Cardtype.create(cardtype);
    
    let cardtypes = await get_cardtypelist_func(req, res);

    res.json({isloggedIn : true, cardtypes});
};

// 카드타입의 nick을 변경합니다.
exports.change_cardtype_name = async(req, res) => {
    console.log('카드타입 name을 변경합니다.');
    console.log(req.body);

    let cardtype = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {name : req.body.name}
    );
    
    let cardtypes = get_cardtypelist_func(req, res);

    res.json({isloggedIn : true, cardtypes});
};

// 카드타입의 순서를 조정합니다.
exports.change_cardtype_order = async (req, res) => {    
    console.log('카드타입 순서 좀 조정할게');
    
    // 목적지 카테고리를 정의합니다.
    let destination_cardtype;
    if (req.body.action === 'up'){
        destination_cardtype = await Category
            .find({
                book_id : req.body.book_id,
                seq : {$lt : req.body.seq}})
            .sort({seq : -1})
            .limit(1);            
    } else {
        destination_cardtype = await Category
            .find({
                book_id : req.body.book_id,
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

    let cardtypes = get_cardtypelist_func(req, res);

    res.json({isloggedIn : true, cardtypes});
};


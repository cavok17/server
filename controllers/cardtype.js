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

    console.log(cardtypes)
    res.json({isloggedIn : true, cardtypes});
};

// 카드스타일을 수정합니다
exports.update_cardstyle = async(req, res) => {
    console.log('카드스타일을 수정합니다.');
    console.log(req.body);

    let card_style = await Cardtype.updateOne(
        {_id : req.body.cardtype_id},
        {card_style : req.body.updated_card_style}
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

    // if ()
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
exports.update_font = async(req, res) => {
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
    
    // 새 카드타입을 만들기 시작합니다.
    let cardtype = new Cardtype    
    cardtype.book_id = req.body.book_id
    cardtype.type = req.body.type
    cardtype.name = req.body.name
    cardtype.seq = max_seq + 1

    // 행 갯수 저장해주시고
    if (cardtype.type ==='none' || cardtype.type ==='share' ){
        cardtype.num_of_row.maker_flag = 0
    } else {
        cardtype.num_of_row.maker_flag = 1
    }
    cardtype.num_of_row.face1 = req.body.face1
    cardtype.num_of_row.selection = req.body.selection
    cardtype.num_of_row.face2 = req.body.face2     
    cardtype.num_of_row.annotation = 1    
    
    // 엑셀 칼럼명 생성해주고
    if (cardtype.type ==='none' || cardtype.type ==='share' ){
        cardtype.excel_column.maker_flag = []
    } else {
        cardtype.excel_column.maker_flag = ['B']
    }
    let cur_alphabet = 'C'.charCodeAt()
    for (let name of ['face1', 'selection', 'face2', 'annotation']) {        
        for (i=0; i<cardtype.num_of_row[name]; i++) {
            cardtype.excel_column[name].push(String.fromCharCode(cur_alphabet))            
            cur_alphabet += 1
        }
    }

    // 닉값 설정해주고
    for (let name of ['face1', 'selection', 'face2']) {        
        for (i=0; i<cardtype.num_of_row[name]; i++) {
            if(name === 'selection'){
                cardtype.nick_of_row[name].push('보기_'+ (i+1))
            } else {
                cardtype.nick_of_row[name].push('단락_'+ (i+1))
            }
        }
    }

    // 면 서식을 만들어주고.... flip인 경우만 만들어 준다.
    if (cardtype.type === 'flip-normal' || cardtype.type === 'flip-selection' ){
        cardtype.face_style.push({}) //앞면
        cardtype.face_style.push({}) //뒷면
    }

    // 행/폰트는 여기서 만들어줘야 함요
    for (let name of ['face1', 'selection', 'face2']) {
        if (cardtype.num_of_row[name]>0) {            
            for (i=0; i<cardtype.num_of_row[name]; i++){
                cardtype.row_style[name].push({})
                cardtype.font[name].push({})
            }
        }
    }

    //생성합니다.    
    cardtype = await cardtype.save()    
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


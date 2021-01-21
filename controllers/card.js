const mongoose = require("mongoose");
const fs = require("fs").promises;
const multer = require('multer');
const readXlsxFile = require('read-excel-file/node');
// 입력 시 스크립트 같은 게 딸려오는 거 방지
const sanitizeHtml = require('sanitize-html')

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Card_external = require('../models/card_external');
const Content = require('../models/content');
const Index = require('../models/index');
const Cardtype = require('../models/cardtype');



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
    
    // 카드가 들어가는 위치보다 뒷쪽에 있는 카드는 시퀀스를 증가시켜주고요
    let seq_modi_result = await Card.updateMany(
        {index_id : req.body.index_id,
        seq_in_index : {$gt : req.body.seq_in_index}},
        {$inc : {seq_in_index : 1}}
    )       
    
    // 카드 정보에 카드타입 아이디 외 카드타입까지 넣어줌 ---> 이거는 받아서 넣는 걸로 합시다.
    let cardtype = await Cardtype.findOne({_id: req.body.cardtype_id})

    // 카드를 생성합니다.
    // sanitize 쓰는 거 연구 필요
    let card = await Card.create({
        cardtype_id: req.body.cardtype_id,
        type : cardtype.type,
        book_id: req.body.book_id,
        index_id: req.body.index_id,        
        parent_card_id : req.body.parent_card_id,
        seq_in_index: req.body.seq_in_index*1 + 1,
        contents : {
            maker_flag : req.body.flag_of_maker,
            none : req.body.none,
            share : req.body.share,
            face1 : req.body.face1,
            selection : req.body.selection,
            face2 : req.body.face2,
            annotation : req.body.annotation
        }
    })

    // 카드 갯수 정보 업데이트
    switch (cardtype.type){
        case 'read' :
            let book1 = await Book.updateOne({_id : req.body.book_id},{$inc : {'num_cards.read' : 1}})
            break
        case 'flip-normal' :
        case 'flip-select' :
            let book2 = await Book.updateOne({_id : req.body.book_id},{$inc : {'num_cards.flip' : 1}})
            break

    }
    
    // 쓸 일이 있을지는 모르겠으나, 자식 카드 정보를 기록해보자고
    // 자식 카드의 시퀀스는 일단 관리하지 않는 것으로
    if (req.body.parent_card_id != null){
        let parent_card = await Card.updateOne(
            {_id : req.body.parent_card_id},
            {$push : {child_card_ids : card._id}})
    }

    let cardlist = await get_cardlist_func(req.body.index_id)
    res.json({isloggedIn : true, cardlist});


};



// 엑셀 파일로 카드를 생성합니다.
exports.create_card_by_excel = async (req, res) => {
    console.log("엑셀 파일로 카드를 생성합니다.");
    console.log(req.file);
    console.log(req.body);
    
    let max_seq = await get_max_seq(req.body.index_id)
    let new_seq = max_seq + 1

    // 일단 해당책의 카드타입을 다 가져오시오.
    let cardtypes = await Cardtype.find(
        {book_id : req.body.book_id},
        {name:1, num_of_row:1});
    console.log(cardtypes)

    let new_cards = []
    let failure_list = []
    let num_cards = {read : 0, flip :0}
    // let current_row 
    readXlsxFile(req.file.path).then((table) =>{        
        // 첫 행은 읽어들이지 않음
        for (i=1; i<table.length; i++){
            // 각 행에 매칭되는 카드타입을 찾아야 혀.
            
            let cardtype = cardtypes.find((tmp_cardtype) => {            
                return tmp_cardtype.name === table[i][0]
            })

            // 만약 매칭되는 게 없으믄 failure_list에 추가하고, for문을 위로 올려줘요
            // foreach를 쓰믄 continue가 안 먹네 for in이나 for of를 써야제
            if(cardtype == null){
                failure_list.push(i+1)
                continue;
            } else {
                // 카드 갯수 정보 업데이트
                switch (cardtype.type){
                    case 'read' :
                        num_cards.read += 1
                        break
                    case 'flip-normal' :
                    case 'flip-select' :
                        num_cards.flip += 1
                        break
                }
            }           

            let new_card = {
                cardtype_id: cardtype._id,
                type : cardtype.type,
                book_id: req.body.book_id,
                index_id: req.body.index_id,
                seq_in_index: new_seq,
                contents : {
                    maker_flag : [],
                    none : [],
                    share : [],
                    face1 : [],
                    selection : [],
                    face2 : [],
                    annotation : [],
                }
            }
            new_seq += 1
            
            // maker_flag 내용은 따로 접수허시고
            new_card.contents.maker_flag.push(table[i][1])

            let current_col = 2            
            // 나머지들은 for문으로 정리허시고
            for (let face of ['none', 'share', 'face1', 'selection', 'face2', 'annotation']){
                for(j=0; j<cardtype.num_of_row[face]; j++){
                    new_card.contents[face].push(table[i][current_col])
                    current_col += 1
                }
            }

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
    
    // 카드 갯수 업데이트
    let book = await Book.updateOne({_id : req.body.book_id}, {$inc : {'num_cards.read' : num_cards.read, 'num_cards.flip' : num_cards.flip}})
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
exports.update_card = async (req, res) => {
    console.log("카드 내용을 변경합니다.");
    console.log(req.body);

    let card = await Card.findOne({_id : req.body.card_id})

    card.cardtype_id = req.body.cardtype_id
    card.parent_card_id = req.body.parent_card_id
    card.contents.maker_flag = req.body.flag_of_maker
    card.contents.share = req.body.share
    card.contents.face1 = req.body.face1
    card.contents.selection = req.body.selection
    card.contents.face2 = req.body.face2
    card.contents.annotation = req.body.annotation
        
    card = await card.save()

    // 쓸 일이 있을지는 모르겠으나, 자식 카드 정보를 기록해보자고
    // 자식 카드의 시퀀스는 일단 관리하지 않는 것으로
    if (req.body.parent_card_id != null){
        let parent_card = await Card.updateOne(
            {_id : req.body.parent_card_id},
            {$push : {child_card_ids : card._id}})
    }

    let cardlist = await get_cardlist_func(req.body.index_id)
    res.json({isloggedIn : true, cardlist});

};

// 카드를 삭제합니다.
exports.delete_card = async (req, res) => {
    console.log("카드를 삭제합니다.");
    console.log(req.body);

    let card = await Card.findOne({_id : req.body.card_id})
    switch (card.type){
        case 'read' :
            let book1 = await Book.updateOne({_id : req.body.book_id},{$inc : {'num_cards.read' : -1}})
            break
        case 'flip-normal' :
        case 'flip-select' :
            let book2 = await Book.updateOne({_id : req.body.book_id},{$inc : {'num_cards.flip' : -1}})
            break

    }

    let card_delete_result = await Card.deleteOne({_id : req.body.card_id})
    let seq_modi_result = await Card.updateMany(
        {index_id : req.body.index_id,
        seq_in_index : {$gt : req.body.seq_in_index}},
        {$inc : {seq_in_index : -1}})    

    let cardlist = await get_cardlist_func(req.body.index_id)
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
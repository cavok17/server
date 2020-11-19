const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');
const book = require('../models/book');
const { updateMany } = require("../models/user");

// 인덱스 정보를 가져옵니다.
const get_indexList = async (req, res) => {  
    console.log('인덱스 리스트 가지러 왔느냐.');
    console.log(req.body);

    const indexList = await Index
        .find({book_id : req.body.book_id})
        .sort({seq : 1});
    // console.log(indexList);

    res.json({isloggedIn : true, indexList, });
};

// 인덱스를 생성합니다.
const create_index = async (req, res) => {  
    console.log('인덱스를 새로 생성합니다.');
    console.log(req.body);

    let seq_modi = await Index.updateMany(
        {book_id : req.body.book_id,
        seq : {$gt : req.body.seq}},
        {$inc : {seq : 1}}
    );

    let new_index = await Index.create({
        book_id : req.body.book_id,
        name : req.body.name,
        seq : req.body.seq + 1,
        level : req.body.lev,
    });
    
    return get_indexList(req,res)
};

// 인덱스 이름을 변경합니다.
const change_index_name = async(req, res) => {
    console.log('인덱스 이름을 변경합니다.');
    console.log(req.body);

    const name_modi_result = await Index.updateOne(
        {_id : req.body.index_id},
        {name : req.body.name}
    );

    get_indexList(req, res); 
};

// 인덱스 레벨을 변경합니다.
const change_index_level = async(req, res) => {
    console.log('인덱스 레벨을 변경합니다.');
    console.log(req.body);

    const name_modi_result = await Index.updateOne(
        {_id : req.body.index_id},
        {level : req.body.level}
    );

    get_indexList(req, res); 
};

// 인덱스의 순서를 변경합니다.
const change_index_order = async(req, res) => {
    console.log('인덱스 순서를 변경할게');
    console.log(req.body);

    let destination_index;
    if (req.body.action === 'up'){
        destination_index = await Index
            .find({                
                book_id : req.body.book_id,
                seq : {$lt : req.body.seq}
            })
            .sort({seq : -1})
            .limit(1);            
    } else if (req.body.action === 'down') {
        destination_index = await Index
            .find({
                book_id : req.body.book_id,
                seq : {$gt : req.body.seq}
            })
            .sort({seq : 1})
            .limit(1);
    };

    let current_index_move_result = await Index.updateOne(
        {_id : req.body.index_id},
        {seq : destination_index[0].seq}        
    );
    let destination_index_move_result = await Index.updateOne(
        {_id : destination_index[0]._id},
        {seq : req.body.seq}        
    );
    
    get_indexList(req, res); 

};

// 인덱스를 삭제합니다.
const delete_index = async(req, res) => {
    console.log('인덱스를 삭제합니다.');
    console.log(req.body);

    // 아래쪽에 자기보다 같거나 높은 레벨이 있는지 확인한다.
    let next_same_level_index = await Index
        .find({book_id : req.body.book_id,
                seq : {$gt : req.body.seq},
                level : {$lte : req.body.level}})
        .sort({seq : 1})
    
    // 없으면 아래 녀석들 다 레벨을 하나씩 올려주고
    if (next_same_level_index.length === 0){
        let level_modi_result = await Index.updateMany(
            {book_id : req.body.book_id,
            seq : {$gt : req.body.seq}},
            {$inc : {level : -1}})
    } else {
    // 있으면 앞에서 찾은 레벨 앞까지만 레벨을 올려준다.
        let level_modi_result = await Index.updateMany(
            {book_id : req.body.book_id,
            seq : {$gt : req.body.seq, $lt : next_same_level_index[0].seq}},
            {$inc : {level : -1}})
    };

    // 마지막으로 아래녀석들의 시퀀스를 다 하나씩 올려준다.    
    let seq_modi_result = await Index.updateMany(
        {book_id : req.body.book_id,
        seq : {$gt : req.body.seq}},
        {$inc : {seq : -1}});

    let delete_result = await  Index.deleteOne({_id : req.body.index_id});
    
    // 나중에 카드 옮기는 로직도 필요함

    get_indexList(req, res); 
};

module.exports ={
    get_indexList,
    create_index,
    change_index_name,
    change_index_level,
    change_index_order,
    delete_index,
};
const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');
const book = require('../models/book');

// 인덱스 정보를 가져옵니다.
const get_indexList = async (req, res) => {  
    console.log('인덱스 리스트 가지러 왔느냐.');
    console.log(req.body);

    const indexList = await Index
        .find({book_id : req.body.book_id})
        .sort({seq : 1});
    
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



module.exports ={
    get_indexList,
    create_index,
};
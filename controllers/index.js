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
    console.log(indexList);

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

// // 즐겨찾기 내에서 책의 순서를 변경합니다.
// const change_likebook_order = async(req, res) => {
//     console.log('즐겨찾기 순서를 변경할게');
//     console.log(req.body);

//     let destination_book;
//     if (req.body.action === 'up'){
//         destination_book = await Book
//             .find({                
//                 owner : req.session.passport.user,
//                 seq_in_like : {$lt : req.body.seq_in_like}
//             })
//             .sort({seq_in_like : -1})
//             .limit(1);            
//     } else {
//         destination_book = await Book
//             .find({
//                 owner : req.session.passport.user,
//                 seq_in_like : {$gt : req.body.seq_in_like}
//             })
//             .sort({seq_in_like : 1})
//             .limit(1);
//     };

//     let current_book_move_result = await Book.updateOne(
//         {_id : req.body.book_id},
//         {seq_in_like : destination_book[0].seq_in_like}        
//     );
//     let destination_book_move_result = await Book.updateOne(
//         {_id : destination_book[0]._id},
//         {seq_in_like : req.body.seq_in_like}        
//     );
    
//     get_booklist(req, res); 

// };



module.exports ={
    get_indexList,
    create_index,
    change_index_name,
    change_index_level,
};
const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Cardtype = require('../models/cardtype');
const Level_config = require('../models/level_config');
const category = require("../models/category");

// 북 정보를 get하는 공용함수 입니다.
const get_categorybooklist = async (req, res) => {        
    let categorybooklist = await Category
        .find({user_id: req.session.passport.user})
        .sort({seq : 1})
        .populate({
            path : 'book_ids',
            populate : {
                path : 'category_id',
                select : 'title seq_in_category result num_cards'
            }
        });

    // let categorybooklist = await Category
    //     .find({user_id: req.session.passport.user})
    //     .sort({seq : 1})
    
    // let books = await Book.find({user_id: req.session.passport.user})
    //     .sort({seq_in_category : 1})
    //     .select('title seq_in_category result num_cards')
    
    // for (i=0; i<categorybooklist.length; i++) {
    //     let book_info = books.filter((book) => book.category_id == categorybooklist._id)
    //     categorybooklist[i].book_ids.push(book_info)
    // }
    
    // 카테고리 내 책 순서 정렬
    for (i=0; i<categorybooklist.length; i++){
        categorybooklist[i].book_ids.sort((a,b) => a.seq_in_category-b.seq_in_category);
    };
    console.log(categorybooklist)
    return categorybooklist
}
const get_likebooklist = async (req, res) => {            
    // 즐겨찾기 리스트를 보여줍니다.    
    let likebooklist = await Book
        .find({owner: req.session.passport.user, like : true})
        .sort({seq_in_like : 1})
        .populate({path : 'category_id', select : 'name'});        
    return likebooklist
}
const get_write_config = async (req, res) => {
    // 설정값을 보냅니다.
    let write_config = await User.find({user_id : req.session.passport.user}, 'write_config');
    return write_config
}

// 카테고리 리스트만 보여줍니다.
exports.get_categorylist = async (req, res) => {    
    console.log('categorylist 가지러 왔냐');
    const categories = await Category
        .find({user_id: req.session.passport.user})
        .sort({seq : 1})
    
    res.json({isloggedIn : true, categories});
};


// 새 카테고리를 만듭니다.
exports.create_category = async (req, res) => {    
    console.log('category 만들어줄게');

    // 기존 카테고리의 시퀀스 정보 수정해주고
    let seq_changed_categories = await Category.updateMany(
        {            
            user_id : req.session.passport.user,
            seq : {$gt : req.body.prev_category_seq}
        },
        {$inc : {seq : 1}}
    );
    
    // 새로운 카테고리 정보 생성해주고
    let category = await Category.create({
        user_id : req.session.passport.user,        
        name: req.body.new_category,
        seq: req.body.prev_category_seq+1,
    });

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    console.log(write_config)
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};


// 카테고리를 삭제합니다.
exports.delete_category = async (req, res) => {    
    console.log('category를 삭제할게');
    console.log(req.body);

    // // 기존 카테고리의 북리스트
    // let booklist = await Category.findOne({_id : req.body.category_id})
    //     .select('book_ids')

    // // 기존 카테고리의 max 시퀀스를 가져오고
    
    // 목적지 카테고리로 book_ids를 옮겨주고
    let prev_category = await Category.findOne({_id : req.body.category_id});
    let book_ids_move_result = await Category.updateOne(
        {_id : req.body.target_category},
        {$push : {book_ids : prev_category.book_ids}}
    );
       
    // 타겟 카테고리의 시퀀스 정보 가져오고
    let seq_info = await get_seq_info(req.body.target_category);
    // 기존 카테고리의 showbook 정보 가져오고 -> 타겟 카테고리의 hidebook 수정 위해
    let num_showbook_of_prev_category = await Book.countDocuments(
        {category_id : req.body.category_id,
        hide_or_show : true}
    );
    console.log('num_showbook_of_prev_category', num_showbook_of_prev_category);

    // 타겟 카테고리의 hide 책들의 시퀀스를 뒤로 더 밀어주고
    let target_hidebook_move = await Book.updateMany(
        {category_id : req.body.target_category,
        hide_or_show : false},
        {$inc : {seq_in_category : num_showbook_of_prev_category}}
    );
    // 기존 카테고리의 show 북들의 시퀀스를 끼워넣고
    let pre_showbook_move = await Book.updateMany(
        {category_id : req.body.category_id,
        hide_or_show : true},
        {$set : {category_id : req.body.target_category},
        $inc : {seq_in_category : seq_info.max_seq_of_showbook + 1}}
    );
    // 기존 카테고리의 hide 북들의 시퀀스도 조정하고
    let pre_hidebook_move = await Book.updateMany(
        {category_id : req.body.category_id,
        hide_or_show : false},
        {$set : {category_id : req.body.target_category},
        // $inc : {seq_in_category : seq_info.max_seq_of_hidebook + num_showbook_of_prev_category}}
        $inc : {seq_in_category : seq_info.max_seq_of_hidebook + 1}}
    );
    
    // 마지막으로 기존 카테고리를 삭제합니다.
    let delete_result = await Category.deleteOne({_id : req.body.category_id});    
    let seq_change_result = await Category.updateMany(
        {user : req.session.passport.user, seq : {$gt : req.body.seq}}, 
        {$inc : {seq : -1}});

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    console.log(write_config)
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

// 카테고리 순서를 조정합니다.
exports.change_category_order = async (req, res) => {    
    console.log('category 순서 좀 조정할게');
    
    // 목적지 카테고리를 정의합니다.
    let destination_category;
    if (req.body.action === 'up'){
        destination_category = await Category
            .find({
                user_id : req.session.passport.user,
                seq : {$lt : req.body.seq}
            })
            .sort({seq : -1})
            .limit(1);            
    } else {
        destination_category = await Category
            .find({
                user_id : req.session.passport.user,
                seq : {$gt : req.body.seq}
            })
            .sort({seq : 1})
            .limit(1);
    };

    // 갈아 끼웁니다.
    let current_category_move_result = await Category.updateOne(
        {_id : req.body.category_id},
        {seq : destination_category[0].seq}        
    );
    let destination_category_move_result = await Category.updateOne(
        {_id : destination_category[0]._id},
        {seq : req.body.seq}        
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    console.log(write_config)
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};


// 카테고리 이름을 변경합니다.
exports.change_category_name = async(req, res) => {
    console.log('카테고리 이름을 변경합니다.');
    console.log(req.body);

    const book = await Category.updateOne(
        {_id : req.body.category_id},
        {name : req.body.name}
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    console.log(write_config)
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};













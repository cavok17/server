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
const book = require("../models/book");

// 시퀀스 정보를 전달하는 공용함수입니다.
const get_seq_info = async (category_id) => {        
    let max_seq_showbook = await Book
        .find({category_id : category_id, hide_or_show : true})
        .sort({seq_in_category : -1})
        .limit(1);
    let max_seq_of_showbook;
    if (max_seq_showbook.length === 0){
        max_seq_of_showbook = -1;
    } else {
        max_seq_of_showbook = max_seq_showbook[0].seq_in_category;
    };

    let max_seq_hidebook= await Book
        .find({category_id : category_id, hide_or_show : false})
        .sort({seq_in_category : -1})
        .limit(1);
    let max_seq_of_hidebook;
    if (max_seq_hidebook.length === 0){
        max_seq_of_hidebook = max_seq_of_showbook;
    } else {
        max_seq_of_hidebook = max_seq_hidebook[0].seq_in_category;
    };

    return {max_seq_of_showbook, max_seq_of_hidebook}
};

const get_categorybooklist = async (req, res) => {        
    let categorybooklist = await Category
        .find({user_id: req.session.passport.user})
        .sort({seq : 1})
    
    let books = await Book.find({user_id: req.session.passport.user})
        .sort({seq_in_category : 1})        
        .select('category_id title type author like hide_or_show seq_in_category seq_in_like time_created result num_cards  ')
        .populate ({path : 'category_id', select : 'name seq'})
    // console.log(books)
    
    for (i=0; i<categorybooklist.length; i++) {
        let book_info = []
        book_info = books.filter((book) => {
            return book.category_id._id.toString() === categorybooklist[i]._id.toString()
        })
        categorybooklist[i].book_ids = book_info
    }
    // console.log(categorybooklist)
    return categorybooklist
}
const get_likebooklist = async (req, res) => {            
    // 즐겨찾기 리스트를 보여줍니다.    
    let likebooklist = await Book
        .find({user_id: req.session.passport.user, like : true})
        .select('category_id title type author like hide_or_show seq_in_category seq_in_like time_created result num_cards')
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
    
    let msg
    let categorybooklist
    let likebooklist
    let write_config

    // 중복이 있는지 검사
    let dup_inspection = await Category.findOne({user_id : req.session.passport.user, name : req.body.new_category})

    if (dup_inspection){
        msg = '중복된 이름이 있네요'
    } else {
        msg = '가능한 이름입니다.'
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
    }

    res.json({isloggedIn : true, msg, categorybooklist, likebooklist, write_config});
};


// 카테고리를 삭제합니다.
exports.delete_category = async (req, res) => {    
    console.log('category를 삭제할게');
    console.log(req.body);

    // book들의 category_in_sequence 좀 점검하자
    let prev_books = await Book.find({_id : req.body.category_id})
        .sort({seq_in_category : 1})
        .select('seq_in_category')
    for (i=0; i<prev_books.length; i++){
        if (prev_books[i].seq_in_category != i){
            let seq_change = await Book.updateOne({_id : prev_books[i]._id},{seq_in_category : i})
        }
    }
    let target_books = await Book.find({_id : req.body.target_category})
        .sort({seq_in_category: 1})
        .select('seq_in_category')
    for (i=0; i<target_books.length; i++){
        if (target_books[i].seq_in_category != i){
            let seq_change = await Book.updateOne({_id : target_books[i]._id},{seq_in_category : i})
        }
    }

    // 타겟 카테고리의 시퀀스 정보 가져오고
    let seq_info = await get_seq_info(req.body.target_category);
    // 기존 카테고리의 showbook 정보 가져오고 -> 타겟 카테고리의 hidebook 수정 위해
    let num_showbook_of_prev_category = await Book.countDocuments(
        {category_id : req.body.category_id,
        hide_or_show : true}
    );
    // console.log('num_showbook_of_prev_category', num_showbook_of_prev_category);

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
    // 다른 카테고리의 시퀀스 정보도 땡겨주고요.
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













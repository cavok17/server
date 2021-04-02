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
const study_result = require("../models/study_result");

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

// 북 정보를 get하는 공용함수 입니다.
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
    console.log(categorybooklist)
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

// 전체 카테고리와 책 리스트를 보여줍니다.
exports.get_booklist = async (req, res) => {    
    console.log('책 정보 가지러 왔냐');
    
    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

// 새 책을 만듭니다.ddddd
exports.create_book =  async (req, res) => {
    console.log('책 만들러 왔냐');

    // 새 책에 쓸 seq_in_category를 계산합니다.
    let seq_info = await get_seq_info(req.body.category_id);    
    console.log(seq_info.max_seq_of_showbook, seq_info.max_seq_of_hidebook);

    // 하이드 책들은 시퀀스를 밀어줍니다.
    let hidebook_seq_modi = await Book.updateMany(
        {category_id : req.body.target_category, hide_or_show : false},
        {$inc : {seq_in_category : 1}}
    );

    // 새 책을 생성하고    
    let book = await Book.create({        
        title : req.body.book_title,
        type : 'self',
        user_id : req.session.passport.user,
        author : req.session.passport.user,
        category_id : req.body.category_id,
        seq_in_category : seq_info.max_seq_of_showbook + 1,
    });

    let new_cardtype = [
        {
            book_id : book._id,
            type : 'read',
            name : '읽기-기본',
            seq : 0,
            num_of_row : {
                maker_flag : 1,                
                face1 : 1,                
            },
            nick_of_row : {                
                face1 : ['본문'],                
            },            
            row_style : {
                face1 : [{}]
            },
            font : {
                face1 : [{}]
            }
        },
        {
            book_id : book._id,
            type : 'flip-normal',
            name : '뒤집기-기본',
            seq : 1,
            num_of_row : {
                maker_flag : 1,
                face1 : 1,
                face2 : 2,                
            },
            nick_of_row : {                
                face1 : ['본문'],
                face2 : ['정답', '부가설명'],                
            },
            face_style : [{}, {}],
            row_style : {
                face1 : [{}],
                face2 : [{},{}]
            },            
            font : {
                face1 : [{}],
                face2 : [{}, {}]
            }
        },
    ]
    let cardtype = await Cardtype.insertMany(new_cardtype)
    
    // 기본 목차도 생성하고
    let index = await Index.create({
        book_id : book._id,
        seq : 0,
        name : '기본',        
    });
        
    // 학습설정도 만들고
    let level_config = await Level_config.create({        
        book_id : book._id,
    });

    res.json({isloggedIn : true, msg : "새 책 생성 완료!"});      
};

// 책을 삭제합니다.
exports.delete_book =  async (req, res) => {
    console.log('책 삭제하러 왔냐');
    console.log(req.body);
    
    let book = await Book.findOne({_id : req.body.book_id})
    // 인덱스, 카드타입, 스터디_리절트, 카드, 멘토링를 삭제 하고
    
    // 책을 삭제 하고    
    let book_delete_result = await Book.deleteOne({_id : req.body.book_id});        
    let index_delete_result = await Index.deleteMany({_id : req.body.book_id});        
    let cardtype_delete_result = await Cardtype.deleteMany({_id : req.body.book_id});        
    let studyresult_delete_result = await study_result.deleteMany({_id : req.body.book_id});
    let card_delete_result = await Card.deleteMany({_id : req.body.book_id});


    // 나머지 책들의 카테고리 내 시퀀스도 변경해주고
    let seq_changed_books = await Book.updateMany(
        {
            category_id : req.body.category_id, 
            seq_in_category : {$gt : req.body.seq_in_category}
        },
        {
            $inc : {seq_in_category : -1}
        }
    );
        
    // 즐겨찾기 시퀀스도 수정해주고
    if (book.like === true){
        let like_changed_books = await Book.updateMany(
            {user_id : req.session.passport.user,
            seq_in_like : {$gte : book.seq_in_like}},
            {$inc : {seq_in_like : -1}},
        );
    };

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

// 책의 카테고리를 변경합니다.
exports.move_book_between_category = async(req, res) => {
    console.log('책의 카테고리를 바꿔줄게');
    console.log(req.body);

    // target category를 받아서 book의 카테고리 정보를 변경하고
    let seq_info = await get_seq_info(req.body.target_category_id);
    console.log('seq_info', seq_info);
    if (req.body.hide_or_show == true){
        let seq_modi_result = await Book.updateMany(
            {category_id : req.body.target_category_id,
            hide_or_show : false},
            {$inc : {seq_in_category : 1}}
        );
        // showbook 뒤로 위치를 잡아줌
        let book = await Book.updateOne(
            {_id : req.body.book_id},
            {category_id : req.body.target_category_id,
            seq_in_category : seq_info.max_seq_of_showbook + 1}
        );
    } else if (req.body.hide_or_show == false){
        let book = await Book.updateOne(
            {_id : req.body.book_id},
            {category_id : req.body.target_category_id,
            seq_in_category : seq_info.max_seq_of_hidebook + 1}
        );
    };
    // let delete_result = await Book.deleteOne({_id : req.body.book_id});
    
    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});  
};

// 카테고리 내에서 책의 순서를 변경합니다.
exports.change_book_order = async(req, res) => {
    console.log('책 순서 좀 조정할게');
    console.log(req.body);

    // 위치 바꿔치기할 책을 찾아보자    
    let destination_book;
    if (req.body.action === 'up'){
        destination_book = await Book
            .find({                
                category_id : req.body.category_id,
                seq_in_category : {$lt : req.body.seq_in_category}
            })
            .sort({seq_in_category : -1})
            .limit(1);            
    } else if (req.body.action === 'down'){
        destination_book = await Book
            .find({
                category_id : req.body.category_id,
                seq_in_category : {$gt : req.body.seq_in_category}
            })
            .sort({seq_in_category : 1})
            .limit(1);
    };

    let current_book_move_result = await Book.updateOne(
        {_id : req.body.book_id},
        {seq_in_category : destination_book[0].seq_in_category}        
    );
    let destination_book_move_result = await Book.updateOne(
        {_id : destination_book[0]._id},
        {seq_in_category : req.body.seq_in_category}        
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

// 즐겨찾기 추가/삭제합니다.
exports.apply_likebook = async(req, res) => {
    console.log('즐겨찾기를 수정할게');
    console.log(req.body);

    if(req.body.like == 'true'){
        // let num_like = await Book.countDocuments({user_id : req.session.passport.user,like : true});
        let max_seq_book = await Book
            .find({user_id : req.session.passport.user,like : true})
            .sort({seq_in_like : -1})
            .limit(1);

        let book = await Book.updateOne(
            {_id : req.body.book_id},
            {like : true, seq_in_like : max_seq_book.seq_in_like + 1},
        );        
    } else {        
        let book = await Book.findOne({_id : req.body.book_id});
        // 해당 책의 like 정보를 수정하고
        let book_update_result = await Book.updateOne(
            {_id : req.body.book_id},
            {like : false, seq_in_like : null},
        );
        // like 시퀀스가 더 컸던 놈들을 앞으로 땡겨준다.
        let seq_change_result = await Book.updateMany(
            {user_id : req.session.passport.user, seq_in_like : {$gt : book.seq_in_like}},
            {$inc : {seq_in_like : -1}}
        )      
    };

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});

};

// 즐겨찾기 내에서 책의 순서를 변경합니다.
exports.change_likebook_order = async(req, res) => {
    console.log('즐겨찾기 순서를 변경할게');
    console.log(req.body);

    let destination_book;
    if (req.body.action === 'up'){
        destination_book = await Book
            .find({                
                user_id : req.session.passport.user,
                seq_in_like : {$lt : req.body.seq_in_like}
            })
            .sort({seq_in_like : -1})
            .limit(1);            
    } else {
        destination_book = await Book
            .find({
                user_id : req.session.passport.user,
                seq_in_like : {$gt : req.body.seq_in_like}
            })
            .sort({seq_in_like : 1})
            .limit(1);
    };

    let current_book_move_result = await Book.updateOne(
        {_id : req.body.book_id},
        {seq_in_like : destination_book[0].seq_in_like}        
    );
    let destination_book_move_result = await Book.updateOne(
        {_id : destination_book[0]._id},
        {seq_in_like : req.body.seq_in_like}        
    );
    
    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});

};

// 책의 hide or show를 변경합니다.
exports.change_hide_or_show = async(req, res) => {
    console.log('책을 숨기거나 살립니다.');
    console.log(req.body);

    let seq_info = await get_seq_info(req.body.category_id);

    // 먼저 숨겨보자
    if (req.body.hide_or_show == false){
        // 일단 다른 showbook의 시퀀스를 하나씩 앞으로 땡기고
        const extra_book_modi = await Book.updateMany(
            {user_id : req.session.passport.user,
            category_id : req.body.category_id,
            // seq_in_category : {$gt : req.body.seq_in_category, $lte : seq_info.max_seq_of_showbook}},
            seq_in_category : {$gt : req.body.seq_in_category}},
            {$inc : {seq_in_category : -1}}
        );
        // 혹시 즐겨찾기에 있는 거면 즐겨찾기를 해제하면서 즐겨찾기 순서를 변경하고
        let book = await Book.findOne({_id : req.body.book_id});
        if (book.like = true) {
            let like_book_seq_modi = await Book.updateMany(
                {user_id : req.session.passport.user, 
                seq_in_like : {$gt : book.seq_in_like}},
                {$inc : {seq_in_like : -1}}
            );
        };
        // 상태값들을 수정한다.
        const target_book_modi = await Book.updateOne(
            {_id : req.body.book_id},
            {hide_or_show : req.body.hide_or_show,
            seq_in_category : seq_info.max_seq_of_hidebook,
            like : false, seq_in_like : null}
        );
    // 다시 살려보자
    } else if (req.body.hide_or_show == true){
        // 일단 다른 hidebook의 시퀀스를 하나씩 뒤로 땡기고
        const extra_book_modi = await Book.updateMany(
            {user_id : req.session.passport.user,
            category_id : req.body.category_id,
            seq_in_category : {$gt : seq_info.max_seq_of_showbook, $lt : req.body.seq_in_category}},
            {$inc : {seq_in_category : 1}}
        );
        // 타겟책도 시퀀스랑 상태값 수정하고
        const target_book_modi = await Book.updateOne(
            {_id : req.body.book_id},
            {hide_or_show : req.body.hide_or_show,
            seq_in_category : seq_info.max_seq_of_showbook + 1}
        );
    };

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    console.log(write_config)
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

// 책 이름을 변경합니다.
exports.change_book_title = async(req, res) => {
    console.log('책 이름을 변경합니다.');
    console.log(req.body);

    const book = await Book.updateOne(
        {_id : req.body.book_id},
        {title : req.body.name}
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};


exports.change_like_config = async(req, res) => {
    console.log('설정을 변경합니다.');
    console.log(req.body);


    const like_config_change = await User.updateOne(
        {user_id : req.session.passport.user},
        {'write_config.likebook' : req.body.like_toggle}
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

exports.change_hide_config = async(req, res) => {
    console.log('설정을 변경합니다.');
    console.log(req.body);


    const hide_config_change = await User.updateOne(
        {user_id : req.session.passport.user},
        {'write_config.hide_or_show' : req.body.hide_toggle}
    );

    let categorybooklist = await get_categorybooklist(req, res)
    let likebooklist = await get_likebooklist(req, res)
    let write_config = await get_write_config(req, res)
    
    res.json({isloggedIn : true, categorybooklist, likebooklist, write_config});
};

exports.get_card_status = async(req, res) => {
    console.log(req.body);

    let cards = await Card.find({book_id : req.body.book_id})
        .select('type status index_id detail_status contents')
        .sort({index_id : 1})   

    res.json({isloggedIn : true, cards});
}

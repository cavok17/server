const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');
const book = require('../models/book');

const get_max_seq = async (category_id) => {    
    let max_seq_book = await Book
        .find({category_id : category_id})
        .sort({seq_in_category : -1})
        .limit(1);    
    let max_seq_in_category;
    // console.log(max_seq_book[0]);
    if (max_seq_book.length === 0){
        return max_seq_in_category = -1;
    } else {
        return max_seq_in_category = max_seq_book[0].seq_in_category;
    };
};

// 카테고리 리스트만 보여줍니다.
const get_categorylist = async (req, res) => {    
    console.log('categorylist 가지러 왔냐');
    const categories = await Category
        .find({user_id: req.session.passport.user});
    categories.sort((a,b) => a.seq - b.seq);
    // const unique_categories = Array.from(new Set(categories));    
    res.json({isloggedIn : true, categories});
};

// 전체 카테고리와 책 리스트를 보여줍니다.
const get_booklist = async (req, res) => {    
    console.log('책 정보 가지러 왔냐');
    
    let categorybooklist = await Category
        .find({user_id: req.session.passport.user})
        .populate({
            path : 'book_ids',
            populate : {
                path : 'category_id',
                select : 'name seq_in_category'
            }
        });
    
    categorybooklist = categorybooklist.sort((a,b) => a.seq - b.seq);
    
    for (i=0; i<categorybooklist.length; i++){
        categorybooklist[i].book_ids.sort((a,b) => a.seq_in_category-b.seq_in_category);
    };    
    // console.log('5', categorybooklist[0]);
    
    // 즐겨찾기 리스트를 보여줍니다.    
    let likebooklist = await Book
        .find({owner: req.session.passport.user, like : true})
        .populate({path : 'category_id', select : 'name'});    
    if (likebooklist.length >0){        
        likebooklist.sort((a,b) => a.seq_in_like - b.seq_in_like);
    };
    console.log('likebooklist', likebooklist);

    // 설정값을 보냅니다.
    let config = await User.find({user_id : req.session.passport.user}, 'config');    

    res.json({isloggedIn : true, categorybooklist, likebooklist, config});
};


// 새 카테고리를 만듭니다.
const create_category = async (req, res) => {    
    console.log('category 만들어줄게');

    // let user = await User.findOne({user: req.session.passport.user});
    
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
        // category_id: req.session.passport.user +'_'+user.newcategory_no,
        name: req.body.new_category,
        seq: req.body.prev_category_seq+1,
    });

    get_booklist(req, res);    
};

// 카테고리를 삭제합니다.
const delete_category = async (req, res) => {    
    console.log('category를 삭제할게');
    console.log(req.body);
    
    // 삭제 대상 카테고리 내 책에 대하여 카테고리 아이디 및 시퀀스를 수정하고
    let max_seq_in_target_category = await get_max_seq(req.body.target_category);
    let book_move_result = await Book.updateMany(
        {category_id : req.body.category_id}, 
        {
            $set : {category_id : req.body.target_category},
            $inc : {seq_in_category : max_seq_in_target_category + 1}
        }
        );
    
    // 목적지 카테고리로 book_ids를 옮겨주고
    let prev_category = await Category.findOne({_id : req.body.category_id});
    let category_modification_result = await Category.updateOne(
        {_id : req.body.target_category},
        {$push : {book_ids : prev_category.book_ids}}
    );
    
    // 마지막으로 기존 카테고리를 삭제합니다.
    let delete_result = await Category.deleteOne({_id : req.body.category_id});    
    let seq_change_result = await Category.updateMany(
        {user : req.session.passport.user, seq : {$gt : req.body.seq}}, 
        {$inc : {seq : -1}});

    get_booklist(req, res);
};

// 카테고리 순서를 조정합니다.
const change_category_order = async (req, res) => {    
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

    get_booklist(req, res);
};

// 새 책을 만듭니다.
const create_book =  async (req, res) => {
    console.log('책 만들러 왔냐');

    // 새 책에 쓸 seq_in_category를 계산합니다.
    let max_seq_in_category = await get_max_seq(req.body.category_id);

    // 새 책을 생성하고    
    let book = await Book.create({        
        title : req.body.book_title,
        type : 'self',
        owner : req.session.passport.user,
        author : req.session.passport.user,
        category_id : req.body.category_id,
        seq_in_category : max_seq_in_category + 1,
    });
    
    // 기본 목차도 생성하고
    let index = await Index.create({
        book_id : book._id,
        seq : 0,
        index_name : '기본',        
    });
    
    // 카테고리에 책 정보를 추가하고
    let category = await Category.updateOne(
        {_id : req.body.category_id},
        {$push : {book_ids : book._id}}
    );     
    
    res.json({isloggedIn : true, msg : "새 책 생성 완료!"});      
};

// 책을 삭제합니다.
const delete_book =  async (req, res) => {
    console.log('책 삭제하러 왔냐');

    // 카드를 삭제 하고
    
    // 책을 삭제 하고    
    let delete_result = await Book.deleteOne({_id : req.body.book_id});        

    // 카테고리 내의 책 정보를 수정하고
    let category = await Category.updateOne(
        {_id : req.body.category_id},
        {$pull : {books : req.body.book_id}}
    );

    // 나머지 책들의 카테고리 내 시퀀스도 변경해주고
    let seq_changed_books = await Book.updateMany(
        {
            category_id : req.body.category_id, 
            seq_in_category : {$gte : req.body.seq_in_category}
        },
        {
            $inc : {seq_in_category : -1}
        }
    );
        
    // 즐겨찾기 시퀀스도 수정해주고
    if (book.like != null){
        let like_changed_books = Book.updateMany(
            {user_id : req.session.passport.user,
            seq_in_like : {$gte : book.seq_in_like}},
            {$inc : {seq_in_like : 1}},
        );
    };

    get_booklist(req, res);    
};

// 책의 카테고리를 변경합니다.
const move_book_between_category = async(req, res) => {
    console.log('책의 카테고리를 바꿔줄게');
    console.log(req.body);
    
    // // 기존 카테고리에서 책 정보 삭제하고    
    let prev_category_update_result = await Category.updateOne(
        {_id : req.body.prev_category_id},
        {$pull : {book_ids : req.body.book_id}}
    );
        
    // 타겟 카테고리에 책 정보 생성하고
    // let target_category = await Category.findOne({_id : req.body.target_category_id});
    let target_category_update_result = await Category.updateOne(
        {_id : req.body.target_category_id},
        {$push : {book_ids : req.body.book_id}}
    );    

    // target category를 받아서 book의 카테고리 정보를 변경하고
    // 최대값 찾는 것을 함수로 빼버려야겠어
    let max_seq_in_category = await get_max_seq(req.body.target_category_id);
    let book = await Book.updateOne(
        {_id : req.body.book_id},
        {category_id : req.body.target_category_id,
        seq_in_category : max_seq_in_category + 1}
    );
    
    get_booklist(req, res);    
};

// 카테고리 내에서 책의 순서를 변경합니다.
const change_book_order = async(req, res) => {
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
    } else {
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

    get_booklist(req, res); 
};

const apply_likebook = async(req, res) => {
    console.log('즐겨찾기를 수정할게');
    // console.log(req.body);

    if(req.body.like == 'true'){
        let num_like = await Book.countDocuments({owner : req.session.passport.user,like : true});
        console.log('num_like', num_like);
        let book = await Book.updateOne(
            {_id : req.body.book_id},
            {like : true, seq_in_like : num_like},
        );        
    } else {        
        let book = await Book.find({_id : req.body.book_id});
        let book_update_result = await Book.updateOne(
            {_id : req.body.book_id},
            {like : false, seq_in_like : null},
        );
        let like_change_result = await Book.updateMany(
            {owner : req.session.passport.user, seq_in_like : {$gt : book.seq_in_like}},
            {$inc : {seq_in_like : -1}}
        )      
    };

    get_booklist(req, res); 

};

// 즐겨찾기 내에서 책의 순서를 변경합니다.
const change_likebook_order = async(req, res) => {
    console.log('즐겨찾기 순서를 변경할게');
    console.log(req.body);

    let destination_book;
    if (req.body.action === 'up'){
        destination_book = await Book
            .find({                
                owner : req.session.passport.user,
                seq_in_like : {$lt : req.body.seq_in_like}
            })
            .sort({seq_in_like : -1})
            .limit(1);            
    } else {
        destination_book = await Book
            .find({
                owner : req.session.passport.user,
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
    
    get_booklist(req, res); 

};

// 책을 숨김처리합니다.
const change_hide_or_show = async(req, res) => {
    console.log('책을 숨기거나 살립니다.');
    console.log(req.body);

    const book = await Book.updateOne(
        {_id : req.body.book_id},
        {hide_or_show : req.body.hide_or_show}
    );

    get_booklist(req, res); 
};

// 책 이름을 변경합니다.
const change_book_title = async(req, res) => {
    console.log('책 이름을 변경합니다.');
    console.log(req.body);

    const book = await Book.updateOne(
        {_id : req.body.book_id},
        {title : req.body.name}
    );

    get_booklist(req, res); 
};

// 카테고리 이름을 변경합니다.
const change_category_name = async(req, res) => {
    console.log('책 이름을 변경합니다.');
    console.log(req.body);

    const book = await Category.updateOne(
        {_id : req.body.category_id},
        {name : req.body.name}
    );

    get_booklist(req, res); 
};


module.exports ={
    get_categorylist,
    get_booklist,    
    create_category,
    change_category_order,
    delete_category,
    create_book,
    delete_book,
    move_book_between_category,
    change_book_order,
    apply_likebook,
    change_likebook_order,
    change_hide_or_show,
    change_book_title,
    change_category_name,
};
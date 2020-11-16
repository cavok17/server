const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');
const book = require('../models/book');

// 카테고리 리스트만 보여줍니다.
const get_categorylist = async (req, res) => {    
    console.log('categorylist 가지러 왔냐');
    const categories = await Category
        .find({user: req.session.passport.user});
    categories.sort((a,b) => a.seq - b.seq);
    // const unique_categories = Array.from(new Set(categories));
    // console.log(categories);
    res.json({isloggedIn : true, categories});
};

// 전체 카테고리와 책 리스트를 보여줍니다.
const get_booklist = async (req, res) => {    
    console.log('책 정보 가지러 왔냐');
    
    let categorybooklist = await Category
        .find({user: req.session.passport.user})
        .populate({
            path : 'books',
            populate : {
                path : 'category',
                select : 'name'
            }
        });
    
    categorybooklist = categorybooklist.sort((a,b) => a.seq - b.seq);
    
    for (i=0; i<categorybooklist.length; i++){
        categorybooklist[i].books.sort((a,b) => a.seq_in_category-b.seq_in_category);
    };    
    // console.log('5', categorybooklist[0]);
    
    let likebooklist = await Book
        .find({book_owner: req.session.passport.user, like : true})
        .populate({path : 'category', select : 'name'});    
    if (likebooklist){        
        likebooklist.sort((a,b) => a.seq_in_like - b.seq_in_like);
    };
        
    res.json({isloggedIn : true, categorybooklist, likebooklist});
};


// 새 카테고리를 만듭니다.
const create_category = async (req, res) => {    
    console.log('category 만들어줄게');

    // let user = await User.findOne({user: req.session.passport.user});
    
    // 기존 카테고리의 시퀀스 정보 수정해주고
    let seq_changed_categories = await Category.updateMany(
        {            
            user : req.session.passport.user,
            seq : {$gt : req.body.prev_category_seq}
        },
        {
            $inc : {seq : 1}
        }
    );
    
    // 새로운 카테고리 정보 생성해주고
    let category = await Category.create({
        user : req.session.passport.user,
        // category_id: req.session.passport.user +'_'+user.newcategory_no,
        name: req.body.new_category,
        seq: req.body.prev_category_seq+1,
    });

    // 유저 정보 수정해주고
    // user.newcategory_no +=1; //id용    
    // user = await user.save();

    get_booklist(req, res);    
};

// 카테고리를 삭제합니다.
const delete_category = async (req, res) => {    
    console.log('category를 삭제할게');
    
    // 해당 카테고리를 삭제하고, 다른 카테고리의 seq를 수정합니다.
    let category = await Category.deleteOne({_id : req.body.category_id});
    let seq_change_result = await Category.updateMany(
        {user_id : req.session.passport.user, seq : {$gt : req.body.seq}}, 
        {$inc : {seq : -1}});

    // 해당 카테고리의 책을 타겟 카테고리로 이동시킵니다.
    let num_books_in_target_category = await Book
        .find({_id : req.body.target_category})
        .sort({seq : -1})
        .limit(1);
    let new_seq_num_of_target_category = num_books_in_target_category[0].seq_in_category+1;    
    let book_move_result = await Book.updateMany(
        {category : req.body.category_id}, 
        {
            $set : {_id : req.body.target_category},
            $inc : {seq_in_category : max_seq_num_of_target_category}
        }
    );    

    res.json({isloggedIn : true, msg : '카테고리 삭제 완료'});
};

// 카테고리 순서를 조정합니다.
const change_category_order = async (req, res) => {    
    console.log('category 순서 좀 조정할게');
    
    let destination_category;
    if (req.body.action === 'up'){
        destination_category = await Category
            .find({
                user : req.session.passport.user,
                seq : {$lt : req.body.seq}
            })
            .sort({seq : -1})
            .limit(1);            
    } else {
        destination_category = await Category
            .find({
                user : req.session.passport.user,
                seq : {$gt : req.body.seq}
            })
            .sort({seq : 1})
            .limit(1);
    };

    console.log(destination_category[0]);
    console.log(req.body.category_id);
    console.log(destination_category[0]._id);

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

    // 새 책의 seq_in_category를 생성합니다.    
    let category = await Category.findOne({_id : req.body.category_id});    
    let max_seq_book = await Book
        .find({category : req.body.category_id})
        .sort({seq_in_category : -1})
        .limit(1);

    let max_seq_in_category;    
    if (max_seq_book.length === 0){
        max_seq_in_category = -1;
    } else {
        max_seq_in_category = max_seq_book[0].seq_in_category;
    };    
    console.log('max_seq_in_category',max_seq_in_category);

    // 새 책을 생성하고    
    let book = await Book.create({        
        title : req.body.book_title,
        type : 'self',
        owner : req.session.passport.user,
        author : req.session.passport.user,
        category : category._id,        
        seq_in_category : max_seq_in_category + 1,
    });
    
    // 기본 목차도 생성하고
    let index = await Index.create({
        book : book._id,
        seq : 0,
        index_name : '기본',        
    });
    
  
    category.books.push(book._id);    
    let result = await category.save();    
    
    res.json({isloggedIn : true, msg : "새 책 생성 완료!"});      
};

// 책을 삭제합니다.
const delete_book =  async (req, res) => {
    console.log('책 삭제하러 왔냐');

    // 카드를 삭제 하고
    
    // 책을 삭제 하고
    // let book = await Book.findOne({_id : req.body.book_id});    
    let delete_result = await Book.deleteOne({_id : req.body.book_id});        

    // 카테고리 내의 책 정보를 수정하고
    let category = await Category.updateOne(
        {_id : req.body.category_id},
        {$pull : {books : req.body.book_id}}
    );

    // 나머지 책들의 시퀀스도 변경해주고
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
            {                
                seq_in_like : {$gte : book.seq_in_like}
            },
            {
                $inc : {seq_in_like : 1}
            }
        );
    }

    get_booklist(req, res);    
};

// 책의 카테고리를 변경합니다.
const move_book_between_category = async(req, res) => {
    // target category를 받아서 book의 카테고리 정보를 변경하고
    let book = await Book.findOne({_id : req.body.book_id});
    
    // // 기존 카테고리에서 북 정보 삭제하고
    // let prev_category = await category.findOne({category_id : req.body.prev_category_id});
    // let will_delete_book_position = prev_category.books.indexOf(book._id);
    // prev_category.books.splice(will_delete_book_position, 1);
    // prev_category = await prev_category.save();
    console.log(book._id);
    // let ObjectId = require('mongoose').Types.ObjectId; 
    let prev_category_update_result = await Category.updateOne(
        {_id : req.body.prev_category_id},
        {$pull : {books : book._id}}
    );
    
    // 신규 카테고리에 북 정보 생성하고
    let target_category = await Category.findOne({_id : req.body.target_category_id});
    let target_category_update_result = await Category.updateOne(
        {_id : req.body.target_category_id},
        {$push : {books : book._id}}
    );
    console.log(target_category);

    // book의 정보도 변경해주고
    book.seq_in_category = target_category.books.length;
    book.category_id = target_category._id;
    book = await book.save();

    get_booklist(req, res);    
};

// 책의 순서를 변경합니다.
const change_book_order = async(req, res) => {
    console.log('책 순서 좀 조정할게');
    let current_book = await Book
        .findOne({_id : req.body.book_id})        
    console.log(current_book);

    if (req.body.action === 'up'){
        var destination_book = await Book
            .find({                
                category_objectID : current_book.category_objectID,
                seq_in_category : {$lt : req.body.seq_in_category}
            })
            .sort({seq_in_category : -1})
            .limit(1);            
    } else {
        var destination_book = await Book
            .find({
                category_objectID : current_book.category_objectID,
                seq_in_category : {$gt : req.body.seq_in_category}
            })
            .sort({seq_in_category : 1})
            .limit(1);
    };
    console.log(destination_book[0]);

    let current_book_move_result = await Book.updateOne(
        {book_id : req.body.book_id},
        {seq_in_category : destination_book[0].seq_in_category}        
    );

    let destination_book_move_result = await Book.updateOne(
        {book_id : destination_book[0].book_id},
        {seq_in_category : req.body.seq_in_category}        
    );

    get_booklist(req, res); 
};

const create_cardtype = async(req, res) => {

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
};
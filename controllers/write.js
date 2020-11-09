// 모델 경로
const User = require('../models/user');
const Book = require('../models/book');
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');

// 책 리스트를 보여줍니다.
exports.get_booklist = async (req, res) => {    
    console.log('왔냐');
    let books = await Book.find({book_owner: req.session.passport.user});    
    res.json({isloggedIn : true, books : books});
};

exports.get_categorylist = async (req, res) => {    
    console.log('왔냐');
    const categories = await Book.find({book_owner: req.session.passport.user}, {category : 1, _id : -1});
    console.log(categories);
    const unique_categories = Array.from(new Set(categories));
    console.log(unique_categories);
    res.json({isloggedIn : true, unique_categories});
};

// 새 책을 만듭니다.
exports.create_book =  async (req, res) => {
    // 새 책에 쓸 아이디를 만듭니다.
    let user = await User.findOne({id: req.session.passport.user});
    let newbook_no = user.newbook_no;
    console.log('냐하하핫');

    // 새 책을 생성하고    
    let book = await Book.create({
        book_id : req.session.passport.user +'_'+ newbook_no,
        title : req.body.book_title,
        type : 'self',
        owner : req.session.passport.user,
        author : req.session.passport.user,
        category : req.body.category,
        like : false,
        recent_visit_index : req.session.passport.user +'_'+ newbook_no +'_'+ 0,        
    });        
    // (미지정)목차도 생성하고
    let index = await Index.create({
        book_id : req.session.passport.user +'_'+ user.newbook_no,        
        index_id : req.session.passport.user +'_'+ user.newbook_no +'_'+ 0,
        position : 0,
        index_name : '기본',        
    });

    user.newbook_no = user.newbook_no+1;
    user = await user.save();    
    res.json({isloggedIn : true});      
};
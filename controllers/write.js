// 모델 경로
const User = require('../models/user');
const Book = require('../models/book');
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');

// 카테고리 리스트만 보여줍니다.
exports.get_categorylist = async (req, res) => {    
    console.log('categorylist 가지러 왔냐');
    const categories = await Category
        .find({user_id: req.session.passport.user});
    categories.sort((a,b) => a.seq - b.seq);
    // const unique_categories = Array.from(new Set(categories));
    console.log(categories);
    res.json({isloggedIn : true, categories});
};

// 전체 카테고리와 책 리스트를 보여줍니다.
exports.get_booklist = async (req, res) => {    
    console.log('책 정보 가지러 왔냐');
    
    let categorybooklist = await Category
        .find({user_id: req.session.passport.user})
        .populate('books');
        categorybooklist = categorybooklist.sort((a,b) => a.seq - b.seq);
        
    for (i=0; i<categorybooklist.length; i++){
        categorybooklist[i].books.sort((a,b) => a.seq_in_category-b.seq_in_category);
    };
    
    console.log('5', categorybooklist[0]);
        
    // const unique_categories = Array.from(new Set(categories));    
    res.json({isloggedIn : true, categorybooklist});
};

// 즐겨찾기 리스트를 보여줍니다.
exports.get_likebooklist = async (req, res) => {    
    console.log('즐겨찾기 리스트 가지러 왔냐');
    let likebooks = await Book
        .find({book_owner: req.session.passport.user, like : true})
        .sort((a,b) => a.seq_in_like - b.seq_in_like);        
    res.json({isloggedIn : true, likebooks});
};

// 새 카테고리를 만듭니다.
exports.create_category = async (req, res) => {    
    console.log('category 만들어줄게');
    let user = await User.findOne({user_id: req.session.passport.user});

    let category = await Category.create({
        user_id : req.session.passport.user,
        category_id: req.session.passport.user + user.newcategory_no,
        name: req.body.name,
        seq: user.num_category,         
    });

    user.newcategory_no +=1; //id용
    user.num_category +=1; //seq용
    user = await user.save();

    res.json({isloggedIn : true});
};

// 새 책을 만듭니다.
exports.create_book =  async (req, res) => {
    console.log('책 만들러 왔냐');
    // 새 책에 쓸 아이디를 만듭니다.
    let user = await User.findOne({user_id: req.session.passport.user});
    let category = await Category.findOne({category_id : req.body.category_id});       

    // 새 책을 생성하고    
    let book = await Book.create({
        book_id : req.session.passport.user +'_'+ user.newbook_no,
        title : req.body.book_title,
        type : 'self',
        owner : req.session.passport.user,
        author : req.session.passport.user,
        category_id : req.body.category_id,
        like : false,
        recent_visit_index : req.session.passport.user +'_'+ user.newbook_no +'_'+ 0,
        seq_in_category : category.new_seq_no_in_category,
    });
    
    // (미지정)목차도 생성하고
    let index = await Index.create({
        book_id : req.session.passport.user +'_'+ user.newbook_no,        
        index_id : req.session.passport.user +'_'+ user.newbook_no +'_'+ 0,
        seq : 0,
        index_name : '기본',        
    });
    
    // 유저 정보 수정하고
    user.newbook_no += 1;
    user = await user.save();    
    
    // 카테고리에 정보 수정하고
    category.num_books += 1;    
    category.new_seq_no_in_category += 1;    
    category.books.push(book._id);    
    let result = await category.save();    
    
    res.json({isloggedIn : true, msg : "새 책 생성 완료!"});      
};
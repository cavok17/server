// 모델 경로
const User = require('../models/user');
const Book = require('../models/book');
const Card = require('../models/card');
const Index = require('../models/index');
const Card_spec = require('../models/card_spec');
const Category = require('../models/category');

// 카테고리 리스트만 보여줍니다.
const get_categorylist = async (req, res) => {    
    console.log('categorylist 가지러 왔냐');
    const categories = await Category
        .find({user_id: req.session.passport.user});
    categories.sort((a,b) => a.seq - b.seq);
    // const unique_categories = Array.from(new Set(categories));
    console.log(categories);
    res.json({isloggedIn : true, categories});
};

// 전체 카테고리와 책 리스트를 보여줍니다.
const get_booklist = async (req, res) => {    
    console.log('책 정보 가지러 왔냐');
    
    console.log(req.session.passport.user);
    let categorybooklist = await Category
        .find({user_id: req.session.passport.user})
        .populate({
            path : 'books',
            populate : {
                path : 'category_objectID',
                select : 'category_id name'
            }
        });
        // .populate('books.category_objectID');
    categorybooklist = categorybooklist.sort((a,b) => a.seq - b.seq);
    console.log(categorybooklist[2].books[0]);    
        
    for (i=0; i<categorybooklist.length; i++){
        categorybooklist[i].books.sort((a,b) => a.seq_in_category-b.seq_in_category);
    };
    
    // console.log('5', categorybooklist[0]);
    
    let likebooklist = await Book
        .find({book_owner: req.session.passport.user, like : true})
        .populate({path : 'category_objectID', select : 'category_id'});
    // console.log('likebooklist', likebooklist);    
    if (likebooklist){
        // likebooklist = await Book.populate(likebooklist, {path: 'category_objectID'});
        likebooklist.sort((a,b) => a.seq_in_like - b.seq_in_like);
    };
    
    // const unique_categories = Array.from(new Set(categories));    
    res.json({isloggedIn : true, categorybooklist, likebooklist});
};


// 새 카테고리를 만듭니다.
const create_category = async (req, res) => {    
    console.log('category 만들어줄게');
    let user = await User.findOne({user_id: req.session.passport.user});
    
    // let num_category = await Category.where({user_id: req.session.passport.user}).count();
    
    // 기존 카테고리의 시퀀스 정보 수정해주고
    let seq_changed_categories = await Category.updateMany(
        {            
            seq : {$gt : req.body.prev_category_seq}
        },
        {
            $inc : {seq : 1}
        }
    );
    
    // 새로운 카테고리 정보 생성해주고
    let category = await Category.create({
        user_id : req.session.passport.user,
        category_id: req.session.passport.user +'_'+user.newcategory_no,
        name: req.body.new_category,
        seq: req.body.prev_category_seq+1,         
    });

    // 유저 정보 수정해주고
    user.newcategory_no +=1; //id용
    user.num_category +=1; //seq용
    user = await user.save();

    get_booklist(req, res);    
};

// 카테고리를 삭제합니다.
const delete_category = async (req, res) => {    
    console.log('category를 삭제할게');
    
    // 카테고리 갯수를 수정합니다. 그냥 변수를 없애버릴까? 쓸 데가 없네
    let user = await User.findOne({user_id: req.session.passport.user});
    user.num_category -= 1;
    user = await user.save();

    // 해당 카테고리를 삭제하고, 다른 카테고리의 seq를 수정합니다.
    let category = await Category.deleteOne({category_id : req.body.category_id});
    let seq_change_result = await Category.updateMany({seq : {$gt : req.body.seq}}, {$inc : {seq : -1}});

    // 해당 카테고리의 책을 (미지정)카테고리로 이동시킵니다.
    // let books = await Book.find({category_id : req.body.category_id});
    // let num_category_of_unspecified = await (await Category.findOne({category_id : req.session.passport.user+'_0'})).length;
    // let new_seq_no_in_category = unspecified.new_seq_no_in_category;
    let book_move_result = await Book.updateMany(
        {category_id : req.body.category_id}, 
        {
            $set : {category_id : req.session.passport.user+'_0'},
            $inc : {seq_in_category : num_category_of_unspecified}
        }
    );
    // for (i=0; i<books.length; i++){
    //     books[i].seq_in_category = new_seq_no_in_category++;
    //     books[i].category_id = req.session.passport.user+'_0';
    // };
    // unspecified.new_seq_no_in_category = new_seq_no_in_category;
    // unspecified = unspecified.save();

    // 카드도 삭제합시다.



    res.json({isloggedIn : true, msg : '카테고리 삭제 완료'});
};

// 새 책을 만듭니다.
const create_book =  async (req, res) => {
    console.log('책 만들러 왔냐');
    // 새 책에 쓸 아이디를 만듭니다.
    let user = await User.findOne({user_id: req.session.passport.user});
    let category = await Category.findOne({category_id : req.body.category_id});       
    // let new_seq_no_in_category = await Book.find({category_id : req.body.category_id}).estimatedDocumentCount();
    // console.log('new_seq_no_in_category', new_seq_no_in_category);

    // 새 책을 생성하고    
    let book = await Book.create({
        book_id : req.session.passport.user +'_'+ user.newbook_no,
        title : req.body.book_title,
        type : 'self',
        owner : req.session.passport.user,
        author : req.session.passport.user,
        category_objectID : category._id,
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

// 책을 삭제합니다.
const delete_book =  async (req, res) => {
    console.log('책 삭제하러 왔냐');

    // 카드를 삭제 하고
    
    // 책을 삭제 하고
    let book = await Book.findOne({book_id : req.body.book_id});    
    let delete_result = await Book.deleteOne({book_id : req.body.book_id});        

    // 카테고리 내의 책 정보를 수정하고
    let category = await Category.findOne({category_id : req.body.category_id});    
    let will_delete_book_id = category.books.indexOf(book._id);    
    category.books.splice(will_delete_book_id, 1);
    category.num_books -= 1;
    category = await category.save();

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
    
    console.log(book.like);
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

module.exports ={
    get_categorylist,
    get_booklist,    
    create_category,
    delete_category,
    create_book,
    delete_book,

};
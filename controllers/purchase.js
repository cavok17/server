const mongoose = require("mongoose");

const Purchase = require('../models/purchase');

const mongoose = require("mongoose");


// 모델 경로
const User = require('../models/user');
const Category = require('../models/category');
const Book = require('../models/book');
const Card = require('../models/card');
const Card_external = require('../models/card_external');
const Index = require('../models/index');
const Cardtype = require('../models/cardtype');
const Candibook = require('../models/candibook');
const Sellbook = require('../models/sellbook');
const Contents_tong = require('../models/contents_tong');
const Book_comment = require("../models/book_comment");


// 구매한 책을 내 책 리스트에 추가합니다.
const add_sellbook_to_mybook = async (req, res) => {

    let sellbook = await Sellbook.findOne({ _id: req.body.sellbook_id })
    let unde_category = await Category.findOne({ user_id: req.session.passport.user, name: '(미지정)' })
    let max_seq_category = await Book.find({ user_id: req.session.passport.user, category_id: unde_category._id })
        .select('seq_in_category')
        .sort({ seq: -1 })
        .limit(1)
    console.log(max_seq_category[0])

    // 일단 book을 생성하자
    let mybook = new Book.create({
        category_id : unde_category._id,
        title : sellbook.book_info.title,
        type : 'buy',
        user_id : req.session.passport.user,
        author : sellbook.book_info.author,
        seq_in_category : (max_seq_category[0].seq_in_category) * 1 + 1,
        sellbook_id : sellbook._id,
    })    

    // // 카드타입을 저장하고 카드타입 매퍼 만들고
    // for (i = 0; i < sellbook.cardtype_set.length; i++) {
    //     sellbook.cardtype_set[i].book_id = mybook._id
    //     sellbook.cardtype_set[i].seq = i
    // }
    // let cardtypes = await Cardtype.insertMany(sellbook.cardtype_set)
    // let cardtype_mapper = {}
    // for (i = 0; i < cardtypes.length; i++) {
    //     cardtype_mapper[sellbook.cardtype_set[i].original_cardtype_id] = cardtypes[i]._id
    // }

    // // 인덱스를 저장하고 인덱스 매퍼 만들고
    // for (i = 0; i < sellbook.index_set.length; i++) {
    //     sellbook.index_set[i].book_id = mybook._id
    //     sellbook.index_set[i].seq = i
    // }
    // let indexes = await Index.insertMany(sellbook.index_set)
    // let index_mapper = {}
    // for (i = 0; i < indexes.length; i++) {
    //     index_mapper[sellbook.index_set[i].original_index_id] = indexes[i]._id
    // }

    // // 카드 인포를 가공하고    
    // for (i = 0; i < sellbook.cardinfo_set.length; i++) {
    //     sellbook.cardinfo_set[i].book_id = mybook._id
    //     sellbook.cardinfo_set[i].cardtype_id = cardtype_mapper[sellbook.cardinfo_set[i].original_cardtype_id]
    //     sellbook.cardinfo_set[i].index_id = index_mapper[sellbook.cardinfo_set[i].original_index_id]
    // }

    // let cards = await Card.insertMany(sellbook.cardinfo_set)

    return
    // res.json({ isloggedIn: true, cardtype_mapper, index_mapper, cardinfo: sellbook.cardinfo_set, cards });

}


// 구매를 생성합니다.
exports.create_purchase = async (req, res) => {
    console.log("구매를 생성합니다.");
    console.log('body', req.body);

    Purchase.create({
        user_id : req.session.passport.user,
        sellbook_id : req.body.sellbook_id,
        price : 1
    })

    add_sellbook_to_mybook(req)

}
const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Card_external = require('../models/card_external');
const Index = require('../models/index');
const Cardtype = require('../models/cardtype');
const Sellbook_candidate = require('../models/sellbook_candidate');



// 책 판매를 요청합니다..
exports.req_book_sell = async (req, res) => {
    console.log("책 판매를 요청합니다.");
    console.log(req.body);

    let book_info = await Book.findOne({_id : req.body.book_id.book_id})

    let new_book_candidate = await Sellbook_candidate.create({
        book_id : book_info._id,
        user_id : book_info.user_id,
        title : book_info.title,
        num_cards_by_status : book_info.num_cards,
        thumbnail : null,
        intro_book : req.body.book_id.book_info,
        intro_author : req.body.book_id.profile,
        indexes : req.body.book_id.index,
        price_hope : req.body.book_id.price,
    });     

    res.json({isloggedIn : true, });

};

// 판매 요청 받은 책 리스트를 보여줍니다.
exports.show_sellbooklist = async (req, res) => {
    console.log("판매 요청 받은 책 리스트를 보여줍니다..");
    console.log(req.body);

    let sellbooklist = await Sellbook_candidate.find({})
    console.log(sellbooklist)

    res.json({isloggedIn : true, sellbooklist});
}



// 책 판매를 허가합니다.
exports.permit_book_sell = async (req, res) => {
    console.log("책 판매를 허가합니다.");
    console.log(req.body);

    // let book = await 
    // let cards = await Card.find({_id : })

    res.json({isloggedIn : true, cardlist});

};


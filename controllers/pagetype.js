const mongoose = require("mongoose");

// 모델 경로
const Book = require('../models/book');


// 카드타입 리스트를 보여줍니다.
exports.get_pagetype = async(req, res) => {
    console.log('페이지 타입을 보여줍니다.');
    console.log(req.body);

    let pagetype = await Book.find({book_id : req.body.book_id})
        .select('pagetype')

    res.json({isloggedIn : true, cardtypes});
};

// 페이지타입을 수정합니다.
exports.update_pagetype = async(req, res) => {
    console.log('페이지타입을 수정합니다.');
    console.log(req.body);

    let pagetype = await Book.updateOne(
        {_id : req.body.book_id},
        {pagetype : req.body.updated_pagetype}
    )

    res.json({isloggedIn : true, pagetype});

}
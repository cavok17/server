const mongoose = require("mongoose");


// 모델 경로
// const User = require('../models/user');
// const Category = require('../models/category');
// const Book = require('../models/book');
// const Card = require('../models/card');
// const Card_external = require('../models/card_external');
// const Index = require('../models/index');
// const Cardtype = require('../models/cardtype');
// const Candibook = require('../models/candibook');
// const Sellbook = require('../models/sellbook');
// const Contents_tong = require('../models/contents_tong');
const Book_comment = require("../models/book_comment");

// 북코멘트를 등록합니다.
exports.create_book_comment = async (req, res) => {
    console.log("북코멘트를 등록합니다.");
    console.log('body', req.body);

    req.body.sellbook_id = mongoose.Types.ObjectId(req.body.sellbook_id)

    let book_comment = new Book_comment()
    book_comment.user_id = req.session.passport.user
    book_comment.sellbook_id = req.body.sellbook_id
    book_comment.root_id = req.body.root_id
    book_comment.parent_id = req.body.parent_id
    book_comment.level = req.body.level
    book_comment.isDeleted = req.body.isDeleted
    book_comment.rating = req.body.rating
    book_comment.content = req.body.content
    book_comment = await book_comment.save()
    console.log(book_comment)

    Promise.all([
        Sellbook.findOne({ _id: req.body.sellbook_id }).select('book_info'),        
        Book_comment.aggregate([
            { $match: { sellbook_id: req.body.sellbook_id, level: 1 } },            
            { $sort: { time_created: 1 } },            
            {
                $lookup: {
                    from: 'book_comments',
                    let: { tmp_id: '$_id', },                    
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ['$root_id', '$$tmp_id'] } }
                        },
                        {
                            $sort: { 'time_created': 1 }
                        }
                    ],
                    as: 'children',
                },
            },
        ]),
        Book_comment.aggregate([
            { $match: { sellbook_id: req.body.sellbook_id, level: 1 } },
            {
                $group: { _id: "$rating", count: { $sum: 1 } }
            }
        ])
    ])
    .then(([sellbook, book_comment, rating]) => {
        // console.log('sellbook', sellbook)
        console.log('book_comment', book_comment)
        console.log('rating', rating)
        res.json({ isloggedIn: true, sellbook, book_comment, rating });
    })
    .catch((err) => {
        console.log('err: ', err);
        return res.json(err);
    });

    // res.json({ isloggedIn: true, msg: '잘 왔음' })
}

// 북코멘트를 수정합니다.
exports.update_book_comment = async (req, res) => {
    console.log("북코멘트를 수정합니다.");
    console.log(req.body);

    await book_comment.replaceOne(
        { _id: req.body.book_comment._id },
        { ...req.body.book_comment }
    )

    res.json({ isloggedIn: true, msg: '잘 왔음' })
}

// 북코멘트를 삭제합니다.
exports.delete_book_comment = async (req, res) => {
    console.log("북코멘트를 삭제합니다.");
    console.log(req.body);

    await book_comment.updateOne(
        { _id: req.body.book_comment._id },
        { isDeleted : 'yes'}
    )

    res.json({ isloggedIn: true, msg: '잘 왔음' })
}
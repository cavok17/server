// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

// 스키마 객체를 생성
const book_schema = new mongoose.Schema({
    book_id: String,
    book_title: String,
    book_type: String,
    book_owner: String,
    book_author: String,
    category: String,
    like: Boolean,
    make_time: {type : Date, default : Date.now},
    recent_study_time: {type : String, default : null},
    no_of_index : {type : Number, default : 1},
    new_index_no : {type : Number, default : 1},
    recent_visit_index: String,
    // recent_card_id : {type : Number, default : -1},
    no_of_card: {type : Number, default : 0},
    new_card_no : {type : Number, default : 0},
    recent_study_mode : {type : String, default : '0'},
    index_position_array : {type : Array}
});

module.exports = mongoose.model("book", book_schema)
// module.exports = mongoose.model("users", userschema)



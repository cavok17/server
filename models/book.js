// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

// 스키마 객체를 생성
const book_schema = new mongoose.Schema({
    book_id: String,
    title: String,
    type: String,
    owner: String,
    author: String,
    category: String,
    like: Boolean,
    recent_visit_index: String,
    num_pages : {type : Number, default : 0},
    num_indexes : {type : Number, default : 1},
    num_cards: {type : Number, default : 0},
    new_index_no : {type : Number, default : 1},
    new_card_no : {type : Number, default : 0},
    time_create: {type : Date, default : Date.now},
    recent :{
        num_card_made : {type : Number, default : null},
        time_study: {type : Date, default : null},
        time_modify: {type : Date, default : null},
        study_mode : {type : String, default : '0'},
    },     
});

module.exports = mongoose.model("book", book_schema)
// module.exports = mongoose.model("users", userschema)



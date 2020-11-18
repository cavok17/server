// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

// 스키마 객체를 생성
const book_schema = new mongoose.Schema({
    // book_id: mongoose.ObjectId,
    // book_id: String,
    // category_id: {type:mongoose.Schema.Types.ObjectId, ref:'Category'},
    // category_id: {type:mongoose.ObjectId, ref:'Category'},
    category_id: {type:mongoose.ObjectId, ref:'Category'},
    title: String,
    type: String,
    owner: String,
    author: String,
    like: {type : Boolean, default : false},
    hide_or_show : {type : Boolean, default : true},
    // recent_visit_index: String,
    seq_in_category : Number,
    seq_in_like : {type : Number, default : null},
    num_pages : {type : Number, default : 0},
    // num_indexes : {type : Number, default : 1},
    // num_cards: {type : Number, default : 0},
    // new_index_no : {type : Number, default : 1},
    // new_card_no : {type : Number, default : 0},
    time_create: {type : Date, default : Date.now},    
    recent :{
        num_card_created : {type : Number, default : null},
        time_study: {type : Date, default : null},
        time_modify: {type : Date, default : null},
        study_mode : {type : String, default : '0'},
    },     
});

module.exports = mongoose.model("Book", book_schema)
// module.exports = mongoose.model("users", userschema)



const mongoose = require("mongoose");

// 스키마 객체를 생성
const sellbook_candidate_schema = new mongoose.Schema({
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    title : {type : String},
    thumbnail : {type : String},
    intro_book : {type : String},
    intro_author : {type : String},
    indexes : {type : String},
    price_hope : {type : Number},
    time_created : {type : Date, default : Date.now},
});

module.exports = mongoose.model("Sellbook_candidate", sellbook_candidate_schema)
// module.exports = mongoose.model("users", userschema)


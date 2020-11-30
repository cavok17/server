const mongoose = require("mongoose");

// 스키마 객체를 생성
const index_schema = new mongoose.Schema({
    book_id : mongoose.ObjectId,
    // index_id : String,
    // position : Number,
    name : String,
    seq : Number,
    level : { type : Number, default : 1},    
    // num_total_created_cards : {type : Number,default : 0,},    
});

module.exports = mongoose.model("Index", index_schema)
// module.exports = mongoose.model("users", userschema)


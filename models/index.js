const mongoose = require("mongoose");

// 스키마 객체를 생성
const index_schema = new mongoose.Schema({
    book_id : String,
    index_id : String,
    index_name : String,
    level : { type : Number, default : 1},    
    no_of_total_created_cards : {type : Number,default : 0,},
    card_position_array : {type : Array,default : [],}
});

module.exports = mongoose.model("index", index_schema)
// module.exports = mongoose.model("users", userschema)


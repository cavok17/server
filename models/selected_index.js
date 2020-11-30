const mongoose = require("mongoose");

// 스키마 객체를 생성
const selected_index_schema = new mongoose.Schema({
    user_id : String,
    book_id: {type:mongoose.ObjectId, ref:'Book'},
    seq : Number,    
    selected_index : Array,            
});

module.exports = mongoose.model("Selected_index", selected_index_schema)
// module.exports = mongoose.model("users", userschema)


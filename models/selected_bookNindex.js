const mongoose = require("mongoose");

// 스키마 객체를 생성
const selected_bookNindex_schema = new mongoose.Schema({    
    session_id : {type:mongoose.ObjectId, ref:'Session'},
    book_id: {type:mongoose.ObjectId, ref:'Book'},
    seq : Number,   
    index_ids : [{type:mongoose.ObjectId, ref:'Index'}]
});

module.exports = mongoose.model("Selected_bookNindex", selected_bookNindex_schema)



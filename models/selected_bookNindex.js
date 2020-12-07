const mongoose = require("mongoose");

// 스키마 객체를 생성
const selected_bookNindex_schema = new mongoose.Schema({    
    session_id : {type:mongoose.ObjectId, ref:'Session'},
    book_id: {type:mongoose.ObjectId, ref:'Book'},
    title : String,
    seq : Number,   
    indexes : Array,
    // index_id와 카드 수량들이 들어갑니다.
        // num_total_cards : {
        //     yet : {type : Number, default : 0},
        //     re : {type : Number, default : 0},
        //     hold : {type : Number, default : 0},
        //     completed : {type : Number, default : 0},
        //     total : {type : Number, default : 0},
        //     re_until_now : {type : Number, default : 0},
        //     re_until_today : {type : Number, default : 0},
        // },
});

module.exports = mongoose.model("Selected_bookNindex", selected_bookNindex_schema)



const mongoose = require("mongoose");

// 스키마 객체를 생성
const session_schema = new mongoose.Schema({
    user_id : String,
    time_create : {type : Date, default : Date.now},
    num_cards : {
        yet : {type : Number, default : 0},
        re : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
        total : {type : Number, default : 0},
        re_until_now : {type : Number, default : 0},
        re_until_today : {type : Number, default : 0},
    },
    // book_and_index_list: Array,
});

module.exports = mongoose.model("Session", session_schema)

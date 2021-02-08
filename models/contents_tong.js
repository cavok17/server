const mongoose = require("mongoose");

// 스키마 객체를 생성
const contents_tong_schema = new mongoose.Schema({
    original_card_id : {type : String},
    contents : {
        user_flag : {type : Array, default : []},
        maker_flag : {type : Array, default : []},
        none : {type : Array, default : []},
        share : {type : Array, default : []},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},
        annotation : {type : Array, default : []},
        memo : {type : Array, default : []},
    },
});

module.exports = mongoose.model("Contents_tong", contents_tong_schema)
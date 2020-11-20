const mongoose = require("mongoose");
// const Card = require('../models/card');

// 스키마 객체를 생성
const card_spec_schema = new mongoose.Schema({
    book_id: String,
    index_id: String,    
    card_type: String,
    seq_in_index: Number,
    recent_study_time : {type : Date, default : null},
    willstudy_time: {type : Date, default : null},
    level : {type : Number, default : 0},
    contents : {type:mongoose.Schema.Types.ObjectId, ref:'Card'},
},
{
    timestamps : {
        createdAt : 'createdAt',
        updatedAt : 'updatedAt'
    }
});

card_spec_schema.index({card_position_in_index :1});
// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card_spec", card_spec_schema)
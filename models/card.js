const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({  
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},  
  common_face_use_yeobu : {type : String, default : 'not_use'}, // use, not_use
  seq_in_index: Number,
  seq_in_total_list: Number,
  // seq_in_studying_list: Number,
  position_of_content : {type : String, default : 'internal'},
  external_card_id : {type:mongoose.ObjectId, ref:'Card_external', default : null}, // 반댓말은 external
  parent_card_id : {type:mongoose.ObjectId, ref:'Card', default : null},
  child_card_ids : [{type:mongoose.ObjectId, ref:'Card'}],
  contents : {
    user_flag : {type : Array, default : []},
    maker_flag : {type : Array, default : []},
    share : {type : Array, default : []},
    face1 : {type : Array, default : []},
    selection : {type : Array, default : []},
    face2 : {type : Array, default : []},
    annotation : {type : Array, default : []},
  },
  status : {type : String, default : 'yet'}, // yet, ing, hold, completed
  time_created : {type : Date, default : Date.now},
  study_result : {
    recent_study_time : {type : Date, default : null},
    need_study_time: {type : Date, default : null},
    recent_difficulty : {type : String, default : null},
    total_study_times : {type : Number, default : 0},
    current_lev_study_times : {type : Number, default : 0},
    total_study_hour : {type : Date, default : 0},
    recent_study_hour : {type : Date, default : 0},
    exp : {type : Number, default : 0},
    level : {type : Number, default : 0},
  },
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card", cardschema)




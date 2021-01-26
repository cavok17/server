const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({  
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  type : {type : String, default : null},
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},  
  common_face_use_yeobu : {type : String, default : 'not_use'}, // use, not_use
  seq_in_index: {type : Number, default : null},
  seq_in_total_list: {type : Number, default : null},
  // seq_in_studying_list: Number,
  
  position_of_content : {type : String, default : 'internal'},
  external_card_id : {type:mongoose.ObjectId, ref:'Card_external', default : null}, // 반댓말은 external

  child_card_ids : [{type:mongoose.ObjectId, ref:'Card'}],
  // child_yeobu : {type : String, default : null}, //child
  parent_card_id : {type:mongoose.ObjectId, ref:'Card', default : null},
  
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
  status : {type : String, default : 'yet'}, // yet, ing, hold, completed
  former_status : {type : String, default : null}, 
  time_created : {type : Date, default : Date.now},
  detail_status : {
    recent_study_time : {type : Date, default : null},
    need_study_time: {type : Date, default : null},
    recent_difficulty : {type : String, default : null},
    session_study_times : {type : Number, default : null},
    total_study_times : {type : Number, default : 0},
    current_lev_study_times : {type : Number, default : 0},
    total_study_hour : {type : Number, default : 0},
    recent_study_hour : {type : Number, default : 0},
    exp_gained  : {type : Number, default : null},
    exp_stacked : {type : Number, default : null},
    level : {type : Number, default : 0},
  },
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card", cardschema)




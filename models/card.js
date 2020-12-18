const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({
  cardtype : String,
  // read, flip-general, flip-select, non, common
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  common_face_use_yeobu : {type : String, default : 'not_use'},
  // use, not_use
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},
  child_card_ids : [{type:mongoose.ObjectId, ref:'Card'}],
  // common 카드인 경우만
  seq_in_index: Number,
  seq_in_total_list: Number,
  // seq_in_studying_list: Number,
  source_of_content : {type : String, default : 'internal'},
  source_of_common_face : {type:mongoose.ObjectId, ref:'Cardtype'},  
  external_card_id : {type:mongoose.ObjectId, ref:'Card_external', default : null},
  // 반댓말은 external
  content : {
    flag : Array,
    importance : Array,
    common_face : Array,
    // 여기에 카드 아이디를 뿌려주라고
    // 그래가지고 first_face를 populate 시켜서 보내주는 것이지
    first_face : Array,
    selection : Array,
    second_face : Array,
    third_face : Array,
    annot : Array,   
  },
  status : {type : String, default : 'yet'},
  // yet, ing, hold, completed
  time_created : {type : Date, default : Date.now},
  need_study_time: {type : Date, default : null},
  study_result : {
    recent_study_time : {type : Date, default : null},
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




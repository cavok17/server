const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  cardtype : String,
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},
  seq_in_index: Number,
  seq_in_total: Number,
  // seq_in_working: Number,
  source_of_content : {type : String, default : 'internal'},
  status : {type : String, default : 'yet'},
  // 반댓말은 external
  content_of_importance : Array,
  content_of_first_face : Array,
  content_of_second_face : Array,
  content_of_third_face : Array,
  content_of_annot : Array,  
  external_card_id : {type:mongoose.ObjectId, ref:'Card_external', default : null},
  flag : {type : Number, default : null},
  time_created : {type : Date, default : null},
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




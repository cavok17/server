const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},
  source_of_content : {type : String, default : 'self'},
  content_id : {type:mongoose.ObjectId, ref:'Content'},
  seq_in_index: Number,
  importance : Number,
  flag : Number,
  time_created : {type : Date, default : null},
  recent_study_time : {type : Date, default : null},
  willstudy_time: {type : Date, default : null},
  level : {type : Number, default : 0},
});


// ref : 'card_spec'
// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card", cardschema)




const mongoose = require("mongoose");

// 스키마 객체를 생성
const card_externalschema = new mongoose.Schema({
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},    
  seq_in_index: Number,
  content_of_importance : String,
  content_of_first_face : Array,
  content_of_second_face : Array,
  content_of_third_face : Array,
  content_of_annot : Array,    
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card_external", card_externalschema)
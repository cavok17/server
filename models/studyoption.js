const mongoose = require("mongoose");

// 스키마 객체를 생성
const studyoptionschema = new mongoose.Schema({
  difficulty_1: Number,
  difficulty_2: Number,
  difficulty_3: Number,
  difficulty_4: Number,
  difficulty_5: Number,
  difficulty_1_levelchange: Number,
  difficulty_2_levelchange: Number,
  difficulty_3_levelchange: Number,
  difficulty_4_levelchange: Number,
  difficulty_5_levelchange: Number,
  book_id: String,
  index_id: String,
  cardtype_id: String,
  created_date : Date,
  recent_study_time : Date,
  restudy_time:Date,
  contents: []  
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("studyoption", studyoptionschema)




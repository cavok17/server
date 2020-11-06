const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardschema = new mongoose.Schema({
  card_id: {
    type : String,
  },
  book_id: String,
  index_id: String,  
  cardtype_id: String,    
  contents: []
});


// ref : 'card_spec'
// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card", cardschema)




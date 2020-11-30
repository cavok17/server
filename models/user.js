const mongoose = require("mongoose");

// 스키마 객체를 생성
const userschema = new mongoose.Schema({
  // user: {type : String, unique : true},
  user_id: {type : String},
  password: String,
  name: String,
  nickname: String,
  email: String,
  phone: String,
  write_config : {
    likebook : {type : Boolean, default : true},
    hide_or_show : {type : Boolean, default : true}
  },
  study_config : {
    num_card_new : {type : Number, default : 50},
    num_card_re : {type : Number, default : 50},
    card_order : {type : String, default : 'standard'}
  }

  
  // newbook_no: {type: Number, default :0},
  // newcategory_no: {type: Number, default :1}
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("user", userschema)

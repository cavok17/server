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
  from: String,
  mentor : [{
    book_id : String,
    mentor_id : String,    
  }],
  mentee : [{
    book_id : String,    
    mentee_id : String,
    // status : String,
    group : String,
  }],
  menteegroup: [{
    name : String,
    seq : Number
  }],
  write_config : {
    likebook : {type : Boolean, default : true},
    hide_or_show : {type : Boolean, default : true}
  },
  study_config : {
    study_mode : {type : String, default : 'read'},
    card_order : {type : String, default : 'sort_by_index'},
    re_card_collect_criteria : {type : String, default : 'all'},
    on_off : {
        yet : {type : String, default : 'on'},
        re : {type : String, default : 'on'},
        hold : {type : String, default : 'off'},
        completed : {type : String, default : 'off'},
    },
    num_cards : {
        yet : {type : Number, default : 100},
        re : {type : Number, default : 100},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
    }              
}

  
  // newbook_no: {type: Number, default :0},
  // newcategory_no: {type: Number, default :1}
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("user", userschema)

const mongoose = require("mongoose");

contact_history = {
  recent_select_time : {type : Date, default : null},    
  recent_selection  : {type : String, default : null},
  recent_stay_hour : {type : Number, default : null},
}

const cardschema = new mongoose.Schema({  
  cardtype_id: {type:mongoose.ObjectId, ref:'Cardtype'},
  type : {type : String, default : null},
  book_id: {type:mongoose.ObjectId, ref:'Book'},
  index_id: {type:mongoose.ObjectId, ref:'Index'},  
  seq_in_index: {type : Number, default : null},
  seq_in_session: {type : Number, default : null}, //임시임
  status : {type : String, default : 'yet'}, // yet, ing, hold, completed  
  time_created : {type : Date, default : Date.now},
  
  position_of_content : {type : String, default : 'internal'},
  external_card_id : {type:mongoose.ObjectId, ref:'Card_external', default : null}, // 반댓말은 external
  
  parent_exist_yeobu : {type : String, default : 'no'}, // yes, no
  // child_card_ids : [{type:mongoose.ObjectId, ref:'Card'}],
  // child_yeobu : {type : String, default : null}, //child
  parent_card_id : {type:mongoose.ObjectId, ref:'Card', default : null},
  
  contents : {
    user_flag : {type : Array, default : []},
    maker_flag : {type : Array, default : []},    
    face1 : {type : Array, default : []},
    selection : {type : Array, default : []},
    face2 : {type : Array, default : []},
    annotation : {type : Array, default : []},
    memo : {type : Array, default : []},
  },
  detail_status : {    
    recent_selection : {type : String, default : null},
    recent_know_time : {type : Date, default : null},    
    recent_study_result  : {type : String, default : null},
    recent_study_time : {type : Date, default : null},    
    recent_selection  : {type : String, default : null},
    recent_select_time : {type : Date, default : null},   
    need_study_time: {type : Date, default : null},
        
    current_lev_study_times : {type : Number, default : 0},
    current_lev_accu_study_time : {type : Number, default : null},    

    total_study_times : {type : Number, default : 0},
    
    recent_stay_hour : {type : Number, default : null},
    total_stay_hour : {type : Number, default : null},
        
    level : {type : Number, default : 0},
  },
  contact_history : {type : [contact_history]},    
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Card", cardschema)




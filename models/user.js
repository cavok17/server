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
  mentors : [{
    book_id : String,
    mentor_id : String,
    group : String,    
  }],
  mentees : [{
    book_id : String,    
    mentee_id : String,
    // status : String,
    group : String,
  }],
  menteegroup: [{
    name : String,    
  }],
  write_config : {
    likebook : {type : Boolean, default : true},
    hide_or_show : {type : Boolean, default : true}
  },
  recent_study_config : {
    read_mode : {            
        sort_option : {type : String, default : 'standard'},   //standard, time, random     
        card_on_off : {
            read_card : {type : String, default : 'on'},
            flip_card : {type : String, default : 'on'},
        },
        status_on_off : {
            yet : {type : String, default : 'on'},
            ing : {type : String, default : 'on'},            
            hold : {type : String, default : 'off'},
            completed : {type : String, default : 'off'},
        },
        collect_criteria : {type : String, default : 'by_today'}, //all, by_now, by_today
        needstudytime_filter : {
            low : {type : Date, default : null},
            low_gap : {type : Number, default : 0},
            high : {type : Date, default : null},
            high_gap : {type : Number, default : 1},
        },
        num_cards : {            
            on_off : {type : String, default : 'off'},
            yet : {type : Number, default : 50},
            ing : {type : Number, default : 50},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
    },
    flip_mode : {            
        sort_option : {type : String, default : 'standard'},   //standard, time, random     
        card_on_off : {
            read_card : {type : String, default : 'on'},
            flip_card : {type : String, default : 'on'},
        },
        status_on_off : {
            yet : {type : String, default : 'on'},
            ing : {type : String, default : 'on'},            
            hold : {type : String, default : 'off'},
            completed : {type : String, default : 'off'},
        },
        collect_criteria : {type : String, default : 'by_today'}, //all, by_now, by_today
        needstudytime_filter : {
            low : {type : Date, default : null},
            low_gap : {type : Number, default : 0},
            high : {type : Date, default : null},
            high_gap : {type : Number, default : 1},
        },
        num_cards : {            
            on_off : {type : String, default : 'off'},
            yet : {type : Number, default : 50},
            ing : {type : Number, default : 50},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
    },
    exam_mode : {            
        sort_option : {type : String, default : 'standard'},   //standard, time, random     
        card_on_off : {
            read_card : {type : String, default : 'off'},
            flip_card : {type : String, default : 'on'},
        },
        status_on_off : {
            yet : {type : String, default : 'on'},
            ing : {type : String, default : 'on'},            
            hold : {type : String, default : 'off'},
            completed : {type : String, default : 'off'},
        },
        collect_criteria : {type : String, default : 'by_today'}, //all, by_now, by_today
        needstudytime_filter : {
            low : {type : Date, default : null},
            low_gap : {type : Number, default : 0},
            high : {type : Date, default : null},
            high_gap : {type : Number, default : 1},
        },
        num_cards : {            
            on_off : {type : String, default : 'off'},
            yet : {type : Number, default : 50},
            ing : {type : Number, default : 50},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
    },
    advanced_filter : {
        user_flag : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            none : {type : String, default : null},
            flag1 : {type : String, default : null},
            flag2 : {type : String, default : null},
            flag3 : {type : String, default : null},
            flag4 : {type : String, default : null},
            flag5 : {type : String, default : null},
        },
        maker_flag : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            none : {type : String, default : null},
            flag1 : {type : String, default : null},
            flag2 : {type : String, default : null},
            flag3 : {type : String, default : null},
            flag4 : {type : String, default : null},
            flag5 : {type : String, default : null},
        },
        recent_study_time : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            low : {type : String, default : null},
            high : {type : String, default : null},            
        },                    
        level : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            low : {type : String, default : null},
            high : {type : String, default : null},            
        },
        study_times : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            low : {type : String, default : null},
            high : {type : String, default : null},            
        },
        difficulty : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            none : {type : String, default : null},
            diffi1 : {type : String, default : null},
            diffi2 : {type : String, default : null},
            diffi3 : {type : String, default : null},
            diffi4 : {type : String, default : null},
            diffi5 : {type : String, default : null},
        },
        test_result : {
            on_off : {type : String, default : null},
            and_group : {type : String, default : null},
            none : {type : String, default : null},
            right : {type : String, default : null},
            wrong : {type : String, default : null},
        },
    },  
},          
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("user", userschema)

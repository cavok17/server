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
        sort_option : {type : String, default : 'standard'},        
        read_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
        flip_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
    },
    flip_mode : {            
        sort_option : {type : String, default : 'standard'},        
        read_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
        flip_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
    },
    test_mode : {            
        sort_option : {type : String, default : 'standard'},        
        read_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
        flip_card : {
            on_off : {type : String, default : 'on'},
            yet : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            ing : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
                collect_criteria : {type : String, default : 'all'},
            },
            hold : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
            completed : {
                on_off : {type : String, default : 'on'},
                num_cards : {type : Number, default : 50},
                select_all_yeobu : {type : String, default : 'on'},
            },
        },
    },
  },           
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("user", userschema)

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
    study_config : {
        study_mode : {type : String, default : 'read_mode'},
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
                low_gap_date : {type : Number, default : 0},
                high : {type : Date, default : null},
                high_gap_date : {type : Number, default : 1},
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
                low_gap_date : {type : Number, default : 0},
                high : {type : Date, default : null},
                high_gap_date : {type : Number, default : 1},
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
                low_gap_date : {type : Number, default : 0},
                high : {type : Date, default : null},
                high_gap_date : {type : Number, default : 1},
            },
            num_cards : {            
                on_off : {type : String, default : 'off'},
                yet : {type : Number, default : 50},
                ing : {type : Number, default : 50},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
        },
    },
    advanced_filter : {
        mode : {type : String, default : 'and'}, 
        user_flag_on_off : {type : Boolean, default : false},
        user_flag_group : {type : Boolean, default : false},
        user_flag_value : {type : [String], default : ['0','1','2','3','4','5']},
        maker_flag_on_off : {type : Boolean, default : false},
        maker_flag_group : {type : Boolean, default : false},
        maker_flag_value : {type : [String], default : ['0','1','2','3','4','5']},
        recent_study_time_on_off : {type : Boolean, default : false},
        recent_study_time_group : {type : Boolean, default : false},
        recent_study_time_value : {type : [Date], default : [null,null]},
        recent_study_time_gap : {type : [Number], default : [-3,0]},
        level_on_off : {type : Boolean, default : false},
        level_group : {type : Boolean, default : false},
        level_value : {type : [Number], default : [1,10]},
        study_times_on_off : {type : Boolean, default : false},
        study_times_group : {type : Boolean, default : false},
        study_times_value : {type : [Number], default : [0,100]},
        difficulty_on_off : {type : Boolean, default : false},
        difficulty_group : {type : Boolean, default : false},
        difficulty_value : {type : [String], default : ['none','diffi1','diffi2','diffi3','diffi4','diffi5']},
        test_result_on_off : {type : Boolean, default : false},
        test_result_group : {type : Boolean, default : false},
        test_result_value : {type : [String], default : ['none', 'right', 'wrong']},
        writer_on_off : {type : Boolean, default : false},
        writer_group : {type : Boolean, default : false},
        writer_value : {type : [String], default : ['internal','external']},
    },         
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("user", userschema)

// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { addColors } = require("winston/lib/winston/config");

// 스키마 객체를 생성
const book_schema = new mongoose.Schema({
    // book_id: mongoose.ObjectId,
    // book_id: String,
    // category_id: {type:mongoose.Schema.Types.ObjectId, ref:'Category'},
    // category_id: {type:mongoose.ObjectId, ref:'Category'},
    category_id: {type:mongoose.ObjectId, ref:'Category'},
    title: String,
    type: String,
    sellbook_id: {type:mongoose.ObjectId, ref:'Sellbook'},
    user_id: String,
    author: String,
    like: {type : Boolean, default : false},
    hide_or_show : {type : Boolean, default : true},
    // recent_visit_index: String,
    seq_in_category : Number,
    seq_in_like : {type : Number, default : null},    
    time_created: {type : Date, default : Date.now},
    pagetype : {
        size : {
            width : {type : Number, default : 790},
            height : {type : Number, default : 1000},
        },
        annot_ratio : {type : Number, default : 20},
        color : {type : String, default :  "#FFFFFF"},
        inner_padding : {
            top : {type : Number, default : 75},
            bottom : {type : Number, default : 75},
            left : {type : Number, default : 75},
            right : {type : Number, default : 75},
        }
    },
    result : {
        total : {
            num_cards_change : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            studied_cards : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            study_times : {
                total : {type : Number, default : 0},
                diffi1 : {type : Number, default : 0},
                diffi2 : {type : Number, default : 0},
                diffi3 : {type : Number, default : 0},
                diffi4 : {type : Number, default : 0},
                diffi5 : {type : Number, default : 0},
            },
            study_hour : {type : Number, default : 0},
            exp_gained : {type : Number, default : 0},    
        },
        read : {
            num_cards_change : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            studied_cards : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            study_times : {
                total : {type : Number, default : 0},
                diffi1 : {type : Number, default : 0},
                diffi2 : {type : Number, default : 0},
                diffi3 : {type : Number, default : 0},
                diffi4 : {type : Number, default : 0},
                diffi5 : {type : Number, default : 0},
            },
            study_hour : {type : Number, default : 0},
            exp_gained : {type : Number, default : 0},    
        },
        flip : {
            num_cards_change : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            studied_cards : {
                total : {type : Number, default : 0},
                yet : {type : Number, default : 0},
                ing : {type : Number, default : 0},
                hold : {type : Number, default : 0},
                completed : {type : Number, default : 0},
            },
            study_times : {
                total : {type : Number, default : 0},
                diffi1 : {type : Number, default : 0},
                diffi2 : {type : Number, default : 0},
                diffi3 : {type : Number, default : 0},
                diffi4 : {type : Number, default : 0},
                diffi5 : {type : Number, default : 0},
            },
            study_hour : {type : Number, default : 0},
            exp_gained : {type : Number, default : 0},    
        },
        recent_modify_time : {type : Date, default : 0},
        recent_study_time : {type : Date, default : 0},
    },
    num_cards_by_status : {
        read : {type : Number, default : 0},
        flip : {type : Number, default : 0},
    },
    num_cards : {
        total : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        read : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        flip : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        }
    },
    // recent :{
    //     // num_card_created : {type : Number, default : null},
    //     // time_study: {type : Date, default : null},
    //     time_modify: {type : Date, default : null},
    //     // study_mode : {type : String, default : '0'},
    // },
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

module.exports = mongoose.model("Book", book_schema)
// module.exports = mongoose.model("users", userschema)



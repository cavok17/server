const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardlist_studying_schema = new mongoose.Schema({
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    _id : {type:mongoose.ObjectId, ref:'Card'},
    status : {type : String, default : 'yet'}, //done
    study_time : {type : Date, default : null},
    need_study_time : {type : Date, default : null},
    difficulty : {type : String, default : null}, 
    study_hour : {type : Date, default : null},
    exp :  {type : Number, default : null},
})

const study_result_schema = new mongoose.Schema({
    run : {type : String, default : 'yet'}, // done
    study_hour_total : {type : Date, default : null}, 
    study_hour_history : {type : Array, default : []},
    exp_total : {type : Number, default : 0},
    num_study_cards : {
        yet : {type : Number, default : 0},
        re : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
    },
    num_click : {
        lev_1 : {type : Number, default : 0},
        lev_2 : {type : Number, default : 0},
        lev_3 : {type : Number, default : 0},
        lev_4 : {type : Number, default : 0},
        lev_5 : {type : Number, default : 0},
    }
})

const session_schema = new mongoose.Schema({
    user_id : String,
    // current_seq : {type : Number, default : 0},
    time_started : {type : Date, default : Date.now},
    time_finished : {type : Date, default : null},
    // booksnindexes : [booksnindexes_schema],
    booksnindexes : [{    
        book_id: {type:mongoose.ObjectId, ref:'Book'},
        title : String,
        // seq : Number,   
        index_ids : [{type:mongoose.ObjectId, ref:'Index'}],
    }],
    num_selected_cards : {
        yet : {type : Number, default : 0},
        ing : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
        total : {type : Number, default : 0},
        re_until_now : {type : Number, default : 0},
        re_until_today : {type : Number, default : 0},
    },
    num_used_cards : {
        yet : {type : Number, default : 0},
        ing : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
    },
    
    study_mode : {type : String, default : null},
    study_config : {            
        sort_option : {type : String, default : null},   //standard, time, random     
        card_on_off : {
            read_card : {type : String, default : null},
            flip_card : {type : String, default : null},
        },
        status_on_off : {
            yet : {type : String, default : null},
            ing : {type : String, default : null},            
            hold : {type : String, default : null},
            completed : {type : String, default : null},
        },
        collect_criteria : {type : String, default : null}, //all, by_now, by_today
        needstudytime_filter : {
            low : {type : Date, default : null},
            low_gap : {type : Number, default : null},
            high : {type : Date, default : null},
            high_gap : {type : Number, default : null},
        },
        num_cards : {            
            on_off : {type : String, default : null},
            yet : {type : Number, default : null},
            ing : {type : Number, default : null},
            hold : {type : Number, default : null},
            completed : {type : Number, default : null},
        },
    },
    advanced_filter_mode : {type : String, default : null}, //on, off
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
    // cardlist_total : Array,
    cardlist_studying : [cardlist_studying_schema],
    cardlist_sepa : {
        yet : Array,
        ing : Array,
        hold : Array,
        completed : Array
    },
    study_result : [study_result_schema],
});

module.exports = mongoose.model("Session", session_schema)

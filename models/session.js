const mongoose = require("mongoose");


// 스키마 객체를 생성
const cardlist_object = {
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    _id : {type:mongoose.ObjectId, ref:'Card'},
    status : {type : String, default : 'yet'}, 
    former_status : {type : String, default : null},
    original_status : {type : String, default : null},

    type : {type : String, default : null},
    // apply_sepa 어따 쓰냐
    apply_sepa : {type : String, default : 'no'},
    seq_in_session : {type : Number},
    detail_status : {        
        recent_selection : {type : String, default : null},

        recent_know_time : {type : Date, default : null},    
        recent_study_result  : {type : String, default : null},
        recent_study_time : {type : Date, default : null},    
        recent_selection  : {type : String, default : null},
        recent_select_time : {type : Date, default : null},    
        recent_select_date : {type : Date, default : null}, //study_result용
        former_status_in_session : {type : String, default : 'on'},
        status_in_session : {type : String, default : 'on'},

        need_study_time: {type : Date, default : null},
        need_study_time_tmp: {type : Date, default : null},

        session_click_times : {type : Number, default : 0},
        session_study_times : {type : Number, default : 0},
        current_lev_study_times : {type : Number, default : null},
        current_lev_accu_study_time : {type : Number, default : null},    
        
        total_study_times : {type : Number, default : null},        
        recent_stay_hour : {type : Number, default : null},
        total_stay_hour : {type : Number, default : null},
        retention_for_regression : {type : Number, default : null},
        studytimes_for_regression : {type : Number, default : null},
        
        level : {type : Number, default : null},
        original_level : {type : Number, default : 0},
    },    
}

const session_schema = new mongoose.Schema({
    user_id : String,
    status : {type : String, default : 'ing'}, //finished
    time_started : {type : Date, default : Date.now},
    time_finished : {type : Date, default : null},    
    booksnindexes : [{    
        book_id: {type:mongoose.ObjectId, ref:'Book'},
        title : String,
        // seq : Number,   
        index_ids : [{type:mongoose.ObjectId, ref:'Index'}],
    }],
    num_cards : {
        yet : {
            selected : {type : Number, default : 0},
            inserted : {type : Number, default : 0},
        },
        ing : {
            selected : {type : Number, default : 0},
            inserted : {type : Number, default : 0},
        },
        hold : {
            selected : {type : Number, default : 0},
            inserted : {type : Number, default : 0},
        },
        completed : {
            selected : {type : Number, default : 0},
            inserted : {type : Number, default : 0},
        },
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
            low_gap_date : {type : Number, default : null},
            high : {type : Date, default : null},
            high_gap_date : {type : Number, default : null},
        },
        num_cards : {            
            on_off : {type : String, default : null},
            yet : {type : Number, default : null},
            ing : {type : Number, default : null},
            hold : {type : Number, default : null},
            completed : {type : Number, default : null},
        },
    },    
    advanced_filter_on_off : {type : Boolean, default : null}, //on, off    
    advanced_filter_save : {type : Boolean, default : null}, //on, off    
    advanced_filter : {        
        mode : {type : String, default : null}, //or, and
        user_flag_on_off : {type : Boolean, default : 'false'},
        user_flag_group : {type : Boolean, default : null},
        user_flag_value : {type : [String], default : null},
        maker_flag_on_off : {type : Boolean, default : 'false'},
        maker_flag_group : {type : Boolean, default : null},
        maker_flag_value : {type : [String], default : null},
        recent_study_time_on_off : {type : Boolean, default : 'false'},
        recent_study_time_group : {type : Boolean, default : null},
        recent_study_time_value : {type : [Date], default : null},
        recent_study_time_gap : {type : [Number], default : null},
        level_on_off : {type : Boolean, default : 'false'},
        level_group : {type : Boolean, default : null},
        level_value : {type : [Number], default : null},
        study_times_on_off : {type : Boolean, default : 'false'},
        study_times_group : {type : Boolean, default : null},
        study_times_value : {type : [Number], default : null},
        difficulty_on_off : {type : Boolean, default : 'false'},
        difficulty_group : {type : Boolean, default : null},
        difficulty_value : {type : [String], default : null},
        test_result_on_off : {type : Boolean, default : 'false'},
        test_result_group : {type : Boolean, default : null},
        test_result_value : {type : [String], default : null},
        writer_on_off : {type : Boolean, default : 'false'},
        writer_group : {type : Boolean, default : null},
        writer_value : {type : [String], default : null},
    },    
    // cardlist_total : [{
    //     _id : {type:mongoose.ObjectId, ref:'Card'},
    //     seq_in_total : {type : Number},
    //     status : {type : String},
    //     status_in_session : {type : String, default : null},
    // }],
    cardlist_studied : [{
        ...cardlist_object,
        result_include_yeobu : {type : String, default : 'no'},
    }],
    cardlist_sepa : {
        yet : [cardlist_object],
        ing : [cardlist_object],
        hold : [cardlist_object],
        completed : [cardlist_object],
    },    
});

module.exports = mongoose.model("Session", session_schema)

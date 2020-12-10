const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardlist_working_schema = new mongoose.Schema({
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    _id : {type:mongoose.ObjectId, ref:'Card'},
    need_study_time : {type : Date, default : null},
    status : {type : String, default : 'yet'}, //done
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
    time_created : {type : Date, default : Date.now},
    // booksnindexes : [booksnindexes_schema],
    booksnindexes : [{    
        book_id: {type:mongoose.ObjectId, ref:'Book'},
        title : String,
        seq : Number,   
        indexes : Array,
    }],
    num_cards : {
        yet : {type : Number, default : 0},
        re : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
        total : {type : Number, default : 0},
        re_until_now : {type : Number, default : 0},
        re_until_today : {type : Number, default : 0},
    },
    num_used_cards : {
        yet : {type : Number, default : 0},
        re : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
    },
    current_study_config : {
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
            yet : {type : Number, default : 50},
            re : {type : Number, default : 50},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        }              
    },
    cardlist_total : Array,
    cardlist_working : [cardlist_working_schema],
    cardlist_sepa : {
        yet : Array,
        re : Array,
        hold : Array,
        complited : Array
    },
    study_result : [study_result_schema],
});

module.exports = mongoose.model("Session", session_schema)

const mongoose = require("mongoose");

// 스키마 객체를 생성
const study_result_schema = new mongoose.Schema({
    session_id : {type:mongoose.ObjectId, ref:'Session'},
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    study_date : {type : String, default : 0},     
    status_change : {
        total : {
            plus : {type : Number, default : 0},
            minus : {type : Number, default : 0},
        },
        yet : {
            plus : {type : Number, default : 0},
            minus : {type : Number, default : 0},
        },
        ing : {
            plus : {type : Number, default : 0},
            minus : {type : Number, default : 0},
        },
        hold : {
            plus : {type : Number, default : 0},
            minus : {type : Number, default : 0},
        },
        completed : {
            plus : {type : Number, default : 0},
            minus : {type : Number, default : 0},
        },
    },
    num_cards : {
        selected : {type : Number, default : 0},
        inserted : {type : Number, default : 0},
        started : {type : Number, default : 0},
        finished : {
            total: {type : Number, default : 0}, 
            know : {type : Number, default : 0},
            pass : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        }
    },
    selection_stats : {
        total : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        short : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        long : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        know : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        pass : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        hold : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        completed : {
            count : {type : Number, default : 0},
            hour : {type : Number, default : 0},
        },
        back_mode : {
            count : {type : Number, default : 0}, //안 쓰는 놈
            hour : {type : Number, default : 0},
        },
    },
    level_change : {type : Number, default : 0},
})

module.exports = mongoose.model("Study_result", study_result_schema)
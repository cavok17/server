const mongoose = require("mongoose");

// 스키마 객체를 생성
const study_result_schema = new mongoose.Schema({
    session_id : {type:mongoose.ObjectId, ref:'Session'},
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    study_date : {type : String, default : 0}, 
    total : {
        num_cards_change : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        study_cards : {
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
        exp : {type : Number, default : 0},    
    },
    read : {
        num_cards_change : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        study_cards : {
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
        exp : {type : Number, default : 0},    
    },
    flip : {
        num_cards_change : {
            total : {type : Number, default : 0},
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        study_cards : {
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
        exp : {type : Number, default : 0},    
    }
})

module.exports = mongoose.model("Study_result", study_result_schema)
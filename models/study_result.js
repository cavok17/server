const mongoose = require("mongoose");

// 스키마 객체를 생성
const study_result_schema = new mongoose.Schema({
    session_id : {type:mongoose.ObjectId, ref:'Session'},
    book_id : {type:mongoose.ObjectId, ref:'Book'},
    study_date : {type : String, default : 0},
    time : {
        start :{type : Date, default : 0},
        finish : {type : Date, default : 0},
    },
    level_change : {
        plus : {
            count : {type : Number, default : 0},
            amount : {type : Number, default : 0},
        },
        minus : {
            count : {type : Number, default : 0},
            amount : {type : Number, default : 0},
        },
    },
    num_cards : {
        status_change :  {
            // total : {
            //     plus : {type : Number, default : 0},
            //     minus : {type : Number, default : 0},
            // },
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
        selected : {
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        inserted : {
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        started : {
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
        finished : {
            yet : {type : Number, default : 0},
            ing : {type : Number, default : 0},
            hold : {type : Number, default : 0},
            completed : {type : Number, default : 0},
        },
    },
    num_click:{
        total : {type : Number, default : 0},
        short : {type : Number, default : 0},
        long : {type : Number, default : 0},
        know : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
        pass : {type : Number, default : 0},
        restore : {type : Number, default : 0},
        back : {type : Number, default : 0},
        move : {type : Number, default : 0},
        finish : {type : Number, default : 0},
    },
    stay_hour:{
        total : {type : Number, default : 0},
        short : {type : Number, default : 0},
        long : {type : Number, default : 0},
        know : {type : Number, default : 0},
        hold : {type : Number, default : 0},
        completed : {type : Number, default : 0},
        pass : {type : Number, default : 0},
        restore : {type : Number, default : 0},
        back : {type : Number, default : 0},
        move : {type : Number, default : 0},
        finish : {type : Number, default : 0},
    },     
    
})

module.exports = mongoose.model("Study_result", study_result_schema)
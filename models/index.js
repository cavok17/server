const mongoose = require("mongoose");

// 스키마 객체를 생성
const index_schema = new mongoose.Schema({
    book_id : mongoose.ObjectId,    
    name : String,
    seq : Number,
    level : { type : Number, default : 1},
    progress : { type : Number, default : 0},
    num_cards : {
        total : {
            yet : { type : Number, default : 0},    
            ing : {
                not_studying : { type : Number, default : 0},
                until_now : { type : Number, default : 0},
                until_today : { type : Number, default : 0},
                after_tomorrow : { type : Number, default : 0},
                total : { type : Number, default : 0},
            },
            hold : { type : Number, default : 0},
            completed : { type : Number, default : 0},
        },    
        read : {
            yet : { type : Number, default : 0},    
            ing : {
                not_studying : { type : Number, default : 0},
                until_now : { type : Number, default : 0},
                until_today : { type : Number, default : 0},
                after_tomorrow : { type : Number, default : 0},
                total : { type : Number, default : 0},
            },
            hold : { type : Number, default : 0},
            completed : { type : Number, default : 0},
        },
        flip : {
            yet : { type : Number, default : 0},    
            ing : {
                not_studying : { type : Number, default : 0},
                until_now : { type : Number, default : 0},
                until_today : { type : Number, default : 0},
                after_tomorrow : { type : Number, default : 0},
                total : { type : Number, default : 0},
            },
            hold : { type : Number, default : 0},
            completed : { type : Number, default : 0},
        },
    }
});

module.exports = mongoose.model("Index", index_schema)
// module.exports = mongoose.model("users", userschema)


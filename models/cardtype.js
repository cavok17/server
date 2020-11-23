const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardtypeschema = new mongoose.Schema({  
    book_id: {type:mongoose.Schema.Types.ObjectId, ref:'Book'},
    seq : Number,
    type: String,
    nick : String,
    importance: Boolean,
    annotation : Boolean,
    num_column: {
        face1 : {type : Number, default : 0},
        face2 : {type : Number, default : 0},        
        face3 : {type : Number, default : 0},        
        annot : {type : Number, default : 0},
    },
    direction : {type : String, default : 0},
    ratio: {
        face1 : Number,
        face2 : Number,
        face3 : Number,
        annot : Number,
    },
    background_color : {type : String, default : null},
    outer_margin : {
        top : {type : Number, default : 0},
        bottom : {type : Number, default : 0},
        left : {type : Number, default : 0},
        right : {type : Number, default : 0},
    },
    inner_padding : {
        top : {type : Number, default : 0},
        bottom : {type : Number, default : 0},
        left : {type : Number, default : 0},
        right : {type : Number, default : 0},
    },
    border : {
        mode : {type : String, default : 'package'},
        package : {
            type : {type : String, default : null},
            thickness : {type : Number, default : null},
            color : {type : String, default : null},
        },
        top : {
            type : {type : String, default : null},
            thickness : {type : Number, default : null},
            color : {type : String, default : null},
        },
        bottom : {            
            type : {type : String, default : null},
            thickness : {type : Number, default : null},
            color : {type : String, default : null},
        },
        left : {            
            type : {type : String, default : null},
            thickness : {type : Number, default : null},
            color : {type : String, default : null},
        },
        ringt : {            
            type : {type : String, default : null},
            thickness : {type : Number, default : null},
            color : {type : String, default : null},
        },
    },
});

// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Cardtype", cardtypeschema)


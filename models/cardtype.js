const mongoose = require("mongoose");

// 스키마 객체를 생성
const cardtypeschema = new mongoose.Schema({  
    book_id: {type:mongoose.Schema.Types.ObjectId, ref:'Book'},
    // seq : Number,
    cardtype: String,
    // read, flip-normal, flip-select, none, share
    name : String,
    // importance: {type : String, default : 'off'},
    num_row: {
        flag_of_maker : {type : Number, default : 0},
        common : {type : Number, default : 0},        
        face1 : {type : Number, default : 0},
        face2 : {type : Number, default : 0},        
        // annot : {type : Number, default : 1},
    },
    nick_of_row : [String],
    direction : {type : String, default : 'top-bottom'},
    ratio: {
        face1 : {type : Number, default : 0.8},
        face2 : {type : Number, default : 0.2}
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


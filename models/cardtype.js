const mongoose = require("mongoose");

const style_schema = new mongoose.Schema({
    
})

// 스키마 객체를 생성
const cardtypeschema = new mongoose.Schema({  
    // original_cardtype_id : {type : String},
    book_id: {type:mongoose.Schema.Types.ObjectId, ref:'Book'},    
    type: String,
    // read, flip-normal, flip-select, none, share
    name : String,
    seq : Number,    
    num_of_row: {        
        maker_flag : {type : Number, default : 0},        
        none : {type : Number, default : 0},        
        share : {type : Number, default : 0},        
        face1 : {type : Number, default : 0},
        selection : {type : Number, default : 0},        
        face2 : {type : Number, default : 0},
        annotation : {type : Number, default : 1},        
    },
    nick_of_row : {
        maker_flag : {type : Array, default : ['제작자플래그']},
        none : {type : Array, default : []},
        share : {type : Array, default : []},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},
        annotation : {type : Array, default : ['주석']},
    },
    card_style : {
        card_direction : {type : String, default : 'top-bottom'},
        left_right_ratio: {
            face1 : {type : Number, default : 0.5},
            face2 : {type : Number, default : 0.5}
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
            mode : {type : String, default : 'package'}, //each
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
            right : {            
                type : {type : String, default : null},
                thickness : {type : Number, default : null},
                color : {type : String, default : null},
            },
        },
    },
    face_style : {type : Object, default : {}},
    row_style : {
        maker_flag : {type : Array, default : []},
        none : {type : Array, default : []},
        share : {type : Array, default : []},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},
        annotation : {type : Array, default : []},
    },
    font : {
        maker_flag : {type : Array, default : []},
        none : {type : Array, default : []},
        share : {type : Array, default : []},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},
        annotation : {type : Array, default : []},
    },
});



module.exports = mongoose.model("Cardtype", cardtypeschema)


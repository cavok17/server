const mongoose = require("mongoose");

const style_object = {
    background_color : {type : String, default : "#FFFFFF"},
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
            type : {type : String, default : "solid"},
            thickness : {type : Number, default : 1},
            color : {type : String, default :  "#FFFFFF"},
        },
        top : {
            type : {type : String, default : "solid"},
            thickness : {type : Number, default : 1},
            color : {type : String, default :  "#FFFFFF"},
        },
        bottom : {            
            type : {type : String, default : "solid"},
            thickness : {type : Number, default : 1},
            color : {type : String, default :  "#FFFFFF"},
        },
        left : {            
            type : {type : String, default : "solid"},
            thickness : {type : Number, default : 1},
            color : {type : String, default :  "#FFFFFF"},
        },
        right : {            
            type : {type : String, default : "solid"},
            thickness : {type : Number, default : 1},
            color : {type : String, default :  "#FFFFFF"},
        },
    },    
}

const font_object = {
    font : {type : String, default : '맑은 고딕'},
    size : {type : Number, default : 10},
    color : {type : String, default :  "#000000"},
    align : {type : String, default : 'left'},
    bold : {type : String, default : 'off'},
    italic : {type : String, default : 'off'},
    underline : {type : String, default : 'off'},

}

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
        face1 : {type : Number, default : 0},
        selection : {type : Number, default : 0},
        face2 : {type : Number, default : 0},                
        annotation : {type : Number, default : 1},        
    },
    excel_column : {
        maker_flag : {type : Array, default : []},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},       
        annotation : {type : Array, default : []},
    },    
    nick_of_row : {
        maker_flag : {type : Array, default : ['제작자플래그']},
        face1 : {type : Array, default : []},
        selection : {type : Array, default : []},
        face2 : {type : Array, default : []},        
        annotation : {type : Array, default : ['주석']},
    },
    card_style : {
        card_direction : {type : String, default : 'top-bottom'},
        left_right_ratio: {
            face1 : {type : Number, default : 50},
            face2 : {type : Number, default : 50}
        },
        ...style_object        
    },
    face_style : [style_object],
    row_style : {
        maker_flag : [style_object],
        face1 : [style_object],
        selection : [style_object],
        face2 : [style_object],        
        annotation : [style_object],
    },
    font : {
        maker_flag : [font_object],
        face1 : [font_object],
        selection : [font_object],
        face2 : [font_object],
        annotation : [font_object],
    },
});



module.exports = mongoose.model("Cardtype", cardtypeschema)


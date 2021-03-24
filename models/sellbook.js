const mongoose = require("mongoose");

// 스키마 객체를 생성
const sellbook_schema = new mongoose.Schema({
    // book_id : {type:mongoose.ObjectId, ref:'Book'},
    candibook_id : {type:mongoose.ObjectId, ref:'Candibook'},
    book_info : {
        original_book_id : {type : String},
        category : {type : Array},
        hashtag : {type : Array},
        title : {type : String},
        author : {type : String},
        publisher : {type : String},
        thumbnail : {type : String},
        intro_book : {type : String},
        intro_author : {type : String},
        indexes : {type : String},
        price : {type : Number},
        promotion : {
            name : {type : String},
            gap : {type : String},
            price : {type : Number},
            period : {
                from : {type : Date},
                to : {type : Date},
            }
        }
        
    },
    time_created : {type : Date, default : Date.now},
    index_set : {type : Array, default : []},
    cardtype_set : {type : Array, default : []},
    cardinfo_set : {type : Array, default : []},
    // indexes : [{
    //     seq : {type : Number},
    //     name : {type : String},
    //     index_id : {type : mongoose.ObjectId}
    // }],
    // cardtypes : [{
    //     book_id: {type:mongoose.Schema.Types.ObjectId, ref:'Book'},    
    //     type: String,        
    //     name : String,
    //     seq : Number,    
    //     num_of_row: {        
    //         maker_flag : {type : Number, default : 0},        
    //         none : {type : Number, default : 0},        
    //         share : {type : Number, default : 0},        
    //         face1 : {type : Number, default : 0},
    //         selection : {type : Number, default : 0},        
    //         face2 : {type : Number, default : 0},
    //         annotation : {type : Number, default : 1},        
    //     },
    //     nick_of_row : {
    //         maker_flag : {type : Array, default : ['제작자플래그']},
    //         none : {type : Array, default : []},
    //         share : {type : Array, default : []},
    //         face1 : {type : Array, default : []},
    //         selection : {type : Array, default : []},
    //         face2 : {type : Array, default : []},
    //         annotation : {type : Array, default : ['주석']},
    //     },  
    //     card_direction : {type : String, default : 'top-bottom'},
    //     left_right_ratio: {
    //         face1 : {type : Number, default : 0.5},
    //         face2 : {type : Number, default : 0.5}
    //     },
    //     background_color : {type : String, default : null},
    //     outer_margin : {
    //         top : {type : Number, default : 0},
    //         bottom : {type : Number, default : 0},
    //         left : {type : Number, default : 0},
    //         right : {type : Number, default : 0},
    //     },
    //     inner_padding : {
    //         top : {type : Number, default : 0},
    //         bottom : {type : Number, default : 0},
    //         left : {type : Number, default : 0},
    //         right : {type : Number, default : 0},
    //     },
    //     border : {
    //         mode : {type : String, default : 'package'},
    //         package : {
    //             type : {type : String, default : null},
    //             thickness : {type : Number, default : null},
    //             color : {type : String, default : null},
    //         },
    //         top : {
    //             type : {type : String, default : null},
    //             thickness : {type : Number, default : null},
    //             color : {type : String, default : null},
    //         },
    //         bottom : {            
    //             type : {type : String, default : null},
    //             thickness : {type : Number, default : null},
    //             color : {type : String, default : null},
    //         },
    //         left : {            
    //             type : {type : String, default : null},
    //             thickness : {type : Number, default : null},
    //             color : {type : String, default : null},
    //         },
    //         ringt : {            
    //             type : {type : String, default : null},
    //             thickness : {type : Number, default : null},
    //             color : {type : String, default : null},
    //         },
    //     },
    // }],
    // Cardlists : [],
    // Contents : [{
    //     user_flag : {type : Array, default : []},
    //     maker_flag : {type : Array, default : []},
    //     none : {type : Array, default : []},
    //     share : {type : Array, default : []},
    //     face1 : {type : Array, default : []},
    //     selection : {type : Array, default : []},
    //     face2 : {type : Array, default : []},
    //     annotation : {type : Array, default : []},
    //     memo : {type : Array, default : []},
    // }]
});

module.exports = mongoose.model("Sellbook", sellbook_schema)
// module.exports = mongoose.model("users", userschema)


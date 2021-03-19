const mongoose = require("mongoose");


const regression_object = new mongoose.Schema({
  num_sample : {type: Number, default : 0},  
  original : {    
    gradient : {type: Number, default : 0},
    yintercept : {type: Number, default : 0},
    r_value : {type: Number, default : 0},
  },
  log : {    
    gradient : {type: Number, default : 0},
    yintercept : {type: Number, default : 0},
    r_value : {type: Number, default : 0},
  },
  exp : {    
    gradient : {type: Number, default : 0},
    yintercept : {type: Number, default : 0},
    r_value : {type: Number, default : 0},
  },
})

// 스키마 객체를 생성
const level_config_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
  retention_curve : {
    type : {type: String, default : 'linear'},
    gradient : {type: Number, default : 1},
    yintercept : {type: Number, default : 1},
    r_value : {type: Number, default : 1},
  },
  regression_histrory : [regression_object],
  restudy_ratio : {type: Number, default : 80},  
  sensitivity : {type : Number, default : 75},

});



module.exports = mongoose.model("Level_config", level_config_schema)




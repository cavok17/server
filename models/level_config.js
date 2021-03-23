const mongoose = require("mongoose");


const regression_object = new mongoose.Schema()

// 스키마 객체를 생성
const level_config_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
  retention_count_curve : {
    type : {type: String, default : 'linear'},
    a : {type: Number, default : -7},
    b : {type: Number, default : 7},
    r_value : {type: Number, default : 1},
  },
  restudy_period : {
    short : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '짧게 한번 더'},
      period : {type: Number, default : 10},
    },
    long : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '길게 한번 더'},
      period : {type: Number, default : 30},
    },
  },
  regression_history : [{
    num_sample : {type: Number, default : 0},  
    original : {    
      a : {type: Number, default : 0},
      b : {type: Number, default : 0},
      r_value : {type: Number, default : 0},
    },
    log : {    
      a : {type: Number, default : 0},
      b : {type: Number, default : 0},
      r_value : {type: Number, default : 0},
    },
    exp : {    
      a : {type: Number, default : 0},
      b : {type: Number, default : 0},
      r_value : {type: Number, default : 0},
    },
  }],
  restudy_ratio : {type: Number, default : 80},  
  sensitivity : {type : Number, default : 80},

});



module.exports = mongoose.model("Level_config", level_config_schema)




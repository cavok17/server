const mongoose = require("mongoose");

// 스키마 객체를 생성
const level_config_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
  retention_count_curve : {
    type : {type: String, default : 'linear'},
    a : {type: Number, default : -7},
    b : {type: Number, default : 7},
    r_value : {type: Number, default : 1},
  },
  retention : {
    t1 : {type: Number, default : 0.857},
    t2 : {type: Number, default : 0.714},
    t3 : {type: Number, default : 0.571},
    t4 : {type: Number, default : 0.429},
    t5 : {type: Number, default : 0.286},
    t6 : {type: Number, default : 0.143},
    t7 : {type: Number, default : 0.133},
    t8 : {type: Number, default : 0.124},
    t9 : {type: Number, default : 0.114},
    t10 : {type: Number, default : 0.105},
    t11 : {type: Number, default : 0.095},
    t12 : {type: Number, default : 0.086},
    t13 : {type: Number, default : 0.076},
    t14 : {type: Number, default : 0.067},
    t15 : {type: Number, default : 0.057},
    t16 : {type: Number, default : 0.048},
    t17 : {type: Number, default : 0.038},
    t18 : {type: Number, default : 0.029},
    t19 : {type: Number, default : 0.019},
    t20 : {type: Number, default : 0.010},
  },
  restudy_option : {
    veryshort : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '5분 뒤 한번 더'},
      period : {type: Number, default : 5},
      swipe : {type: String},
      gesture : {type: String}
    },
    short : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '10분 뒤 한번 더'},
      period : {type: Number, default : 10},
      swipe : {type: String},
      gesture : {type: String}
    },
    long : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '20분 뒤 한번 더'},
      period : {type: Number, default : 20},
      swipe : {type: String},
      gesture : {type: String}
    },
    verylong : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '30분 뒤 한번 더'},
      period : {type: Number, default : 30},
      swipe : {type: String},
      gesture : {type: String}
    },
    know : {
      on_off : {type: String, default : 'on'},
      nick : {type: String, default : '세션 탈출'},
      period : {type: Number, default : 10},
      swipe : {type: String},
      gesture : {type: String}
    },
  },
  restudy_ratio : {type: Number, default : 80},  
  sensitivity : {type : Number, default : 80},

  regression_data : {type : Array, default : []},
  regression_sample_count : {type : Number, default : 500},
  regression_result : [{
    // num_sample : {type: Number, default : 0},  
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
});



module.exports = mongoose.model("Level_config", level_config_schema)




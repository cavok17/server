const mongoose = require("mongoose");

// 스키마 객체를 생성
const level_config_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
  difficulty_setting : {
    diffi1 : {
      name : {type : String, default : 'diffi1'},
      nick : {type : String, default : '모르겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 5},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : null},
      gesture : {type : String, default : null},
    },
    diffi2 : {
      name : {type : String, default : 'diffi2'},
      nick : {type : String, default : '잘모르겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 10},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : null},
      gesture : {type : String, default : null},
    },
    diffi3 : {
      name : {type : String, default : 'diffi3'},
      nick : {type : String, default : '애매함'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 20},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : null},
      gesture : {type : String, default : null},
    },
    diffi4 : {
      name : {type : String, default : 'diffi4'},
      nick : {type : String, default : '거의알겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 30},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : null},
      gesture : {type : String, default : null},
    },
    diffi15 : {
      name : {type : String, default : 'diffi5'},
      nick : {type : String, default : '알겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 60},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : null},
      gesture : {type : String, default : null},
    },
  },
  exp_setting : {
    one_time : {type : Number, default : 2000},
    two_times : {type : Number, default : 1000},
    three_times : {type : Number, default : 500},
    four_times : {type : Number, default : 0},
    five_times : {type : Number, default : -500},
  },
  lev_setting : {
    lev_1 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 0.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_2 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 1},
      time_unit : {type : String, default : 'day'},
    },
    lev_3 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 1.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_4 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 2},
      time_unit : {type : String, default : 'day'},
    },
    lev_5 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 2.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_6 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 3},
      time_unit : {type : String, default : 'day'},
    },
    lev_7 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 3.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_8 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 4},
      time_unit : {type : String, default : 'day'},
    },
    lev_9 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 4.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_10 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 5},
      time_unit : {type : String, default : 'day'},
    },    
  }
});



module.exports = mongoose.model("Level_config", level_config_schema)




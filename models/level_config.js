const mongoose = require("mongoose");

// 스키마 객체를 생성
const level_config_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
//   difficulty : {
//     dontknow : {
//       name : {type : String, default : 'dontknow'},
//       nick : {type : String, default : '짧게 한번 더~'},
//       on_off : {type : String, default : 'on'},
//       interval : {type : Number, default : 10},
//       time_unit : {type : String, default : 'min'},
//       hot_key : {type : String, default : 'q'},
//       gesture : {type : String, default : null},
//     },
//     ambiguous : {
//       name : {type : String, default : 'ambiguous'},
//       nick : {type : String, default : '길게 한번 더~'},
//       on_off : {type : String, default : 'on'},
//       interval : {type : Number, default : 30},
//       time_unit : {type : String, default : 'min'},
//       hot_key : {type : String, default : 'q'},
//       gesture : {type : String, default : null},
//     },    
//     know : {
//       name : {type : String, default : 'know'},
//       nick : {type : String, default : '세션 탈출~'},
//       on_off : {type : String, default : 'on'},
//       interval : {type : Number, default : null},
//       time_unit : {type : String, default : 'min'},
//       hot_key : {type : String, default : 'q'},
//       gesture : {type : String, default : null},
//     },
//     just : {
//       name : {type : String, default : 'just'},
//       nick : {type : String, default : '한번 더~'},
//       on_off : {type : String, default : 'on'},
//       interval : {type : Number, default : 10},
//       time_unit : {type : String, default : 'min'},
//       hot_key : {type : String, default : 'q'},
//       gesture : {type : String, default : null},
//     },
//   },
//   level : {
//     lev_0 : {
//       interval : {type : Number, default : 0.5},
//       coefficient : {type : Number, default : 2.241},
//     },
//     lev_1 : {
//       interval : {type : Number, default : 1},
//       coefficient : {type : Number, default : 4.481},
//     },
//     lev_2 : {
//       interval : {type : Number, default : 2},
//       coefficient : {type : Number, default : 8.963},
//     },
//     lev_3 : {
//       interval : {type : Number, default : 4},
//       coefficient : {type : Number, default : 17.926},
//     },
//     lev_4 : {
//       interval : {type : Number, default : 8},
//       coefficient : {type : Number, default : 35.851},
//     },
//     lev_5 : {
//       interval : {type : Number, default : 16},
//       coefficient : {type : Number, default : 71.703},
//     },
//     lev_6 : {
//       interval : {type : Number, default : 32},
//       coefficient : {type : Number, default : 143.405},
//     },
//     lev_7 : {
//       interval : {type : Number, default : 64},
//       coefficient : {type : Number, default : 286.811},
//     },
//     lev_8 : {
//       interval : {type : Number, default : 128},
//       coefficient : {type : Number, default : 573.622},
//     },
//     lev_9 : {
//       interval : {type : Number, default : 256},
//       coefficient : {type : Number, default : 1147.244},
//     },
//     lev_10 : {
//       interval : {type : Number, default : 512},
//       coefficient : {type : Number, default : 2294.487},
//     },    
//   },
//   max_ratio_for_restudy : {type : Number, default : 80},
//   sensitivity : {type : Number, default : 75},
//   study_times_by_ratio : [
//     {
//       // 1회
//       to : {type : Number, default : 100},
//       from : {type : Number, default : 90},
//     },
//     {
//       // 2회
//       to : {type : Number, default : 90},
//       from : {type : Number, default : 70},
//     },
//     {
//       // 3회
//       to : {type : Number, default : 70},
//       from : {type : Number, default : 40},
//     },
//     {
//       // 4회
//       to : {type : Number, default : 40},
//       from : {type : Number, default : 0},
//     },
// ],
  difficulty_setting : {
    diffi1 : {
      name : {type : String, default : 'diffi1'},
      nick : {type : String, default : '모르겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 5},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : 'q'},
      gesture : {type : String, default : null},
    },
    diffi2 : {
      name : {type : String, default : 'diffi2'},
      nick : {type : String, default : '잘모르겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 10},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : 'w'},
      gesture : {type : String, default : null},
    },
    diffi3 : {
      name : {type : String, default : 'diffi3'},
      nick : {type : String, default : '애매함'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 20},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : 'e'},
      gesture : {type : String, default : null},
    },
    diffi4 : {
      name : {type : String, default : 'diffi4'},
      nick : {type : String, default : '거의알겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 30},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : 'r'},
      gesture : {type : String, default : null},
    },
    diffi5 : {
      name : {type : String, default : 'diffi5'},
      nick : {type : String, default : '알겠음'},
      on_off : {type : String, default : 'on'},
      interval : {type : Number, default : 60},
      time_unit : {type : String, default : 'min'},
      hot_key : {type : String, default : 't'},
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
    lev_0 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 1},
      time_unit : {type : String, default : 'day'},
    },
    lev_1 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 1.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_2 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 2},
      time_unit : {type : String, default : 'day'},
    },
    lev_3 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 2.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_4 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 3},
      time_unit : {type : String, default : 'day'},
    },
    lev_5 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 3.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_6 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 4},
      time_unit : {type : String, default : 'day'},
    },
    lev_7 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 4.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_8 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 5},
      time_unit : {type : String, default : 'day'},
    },
    lev_9 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 5.5},
      time_unit : {type : String, default : 'day'},
    },
    lev_10 : {
      need_exp : {type : Number, default : 1000},
      interval : {type : Number, default : 6},
      time_unit : {type : String, default : 'day'},
    },    
  }
});



module.exports = mongoose.model("Level_config", level_config_schema)




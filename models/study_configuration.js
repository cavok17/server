const mongoose = require("mongoose");

// 스키마 객체를 생성
const study_configuration_schema = new mongoose.Schema({
  book_id : {type:mongoose.ObjectId, ref:'Book'},
  difficulty_setting : {
    lev_1 : {
      name : {type : String, default : '모르겠음'},
      nick : {type : String, default : '모르겠음'},
      on_off : {type : String, default : 'on'},
      term : {type : String, default : 5},
      gesture : {type : String, default : null},
    },
    lev_2 : {
      name : {type : String, default : '잘모르겠음'},
      nick : {type : String, default : '잘모르겠음'},
      on_off : {type : String, default : 'on'},
      term : {type : String, default : 5},
      gesture : {type : String, default : null},
    },
    lev_3 : {
      name : {type : String, default : '애매함'},
      nick : {type : String, default : '애매함'},
      on_off : {type : String, default : 'on'},
      term : {type : String, default : 5},
      gesture : {type : String, default : null},
    },
    lev_4 : {
      name : {type : String, default : '거의알겠음'},
      nick : {type : String, default : '거의알겠음'},
      on_off : {type : String, default : 'on'},
      term : {type : String, default : 5},
      gesture : {type : String, default : null},
    },
    lev_5 : {
      name : {type : String, default : '알겠음'},
      nick : {type : String, default : '알겠음'},
      on_off : {type : String, default : 'on'},
      term : {type : String, default : 5},
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
      study_term : {type : Number, default : 1},
    },
    lev_1 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_2 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_3 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_4 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_5 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_6 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_7 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_8 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_9 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
    lev_10 : {
      need_exp : {type : Number, default : 1000},
      study_term : {type : Number, default : 1},
    },
  }
});


// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Study_configuration", study_configuration_schema)




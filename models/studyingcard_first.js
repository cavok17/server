const mongoose = require("mongoose");

// 스키마 객체를 생성
const studyingcard_first_schema = new mongoose.Schema({
    user_id : String,    
    cardlist : Array
});

module.exports = mongoose.model("Studyingcard_first", studyingcard_first_schema)

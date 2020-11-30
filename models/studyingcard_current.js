const mongoose = require("mongoose");

// 스키마 객체를 생성
const studyingcard_current_schema = new mongoose.Schema({
    user_id : String,
    num_card : Number,
    cardlist : Array
});

module.exports = mongoose.model("Studyingcard_current", studyingcard_current_schema)
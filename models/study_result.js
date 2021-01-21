const mongoose = require("mongoose");

// 스키마 객체를 생성
const study_result_schema = new mongoose.Schema({
    session_id : {},
    book_id : {},
})

module.exports = mongoose.model("Study_result", study_result_schema)
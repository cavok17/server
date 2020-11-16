const mongoose = require("mongoose");

// 스키마 객체를 생성
const studyingcardschema = new mongoose.Schema({
    user : String,
    phase : String,
    studyingcardlist : {
        type : Array,
        default : null,
    }
});

module.exports = mongoose.model("studyingcard", studyingcardschema)

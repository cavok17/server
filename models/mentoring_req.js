const mongoose = require("mongoose");

// 스키마 객체를 생성
const mentoring_req_schema = new mongoose.Schema({
    book_id : mongoose.ObjectId,
    title : String,
    mentee_id : String,    
    name : String,    
    mentor_id : String,
    from : String,
    msg : String,
    time_created : {type : Date, default : Date.now},
});

module.exports = mongoose.model("Mentoring_req", mentoring_req_schema)
// module.exports = mongoose.model("users", userschema)


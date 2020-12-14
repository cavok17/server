const mongoose = require("mongoose");

const session_managing_schema = new mongoose.Schema({
    user_id : String,
    time_created : {type : Date, default : Date.now},
    session_id : {type:mongoose.ObjectId, ref:'Session'},
});

module.exports = mongoose.model("Session_managing", session_managing_schema)

const mongoose = require("mongoose");

// 스키마 객체를 생성
const contentschema = new mongoose.Schema({
  card_id: {type:mongoose.ObjectId, ref:'Card'},  
  first_face : Array,
  second_face : Array,
  third_face : Array,
  annotation : Array,
});

module.exports = mongoose.model("Content", contentschema)
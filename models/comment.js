const mongoose = require("mongoose");

// 스키마 객체를 생성
const commentschema = new mongoose.Schema({
    user_id: String,
    level: { type: Number },
    delete_yeobu: { type: String, default: 'on' }, //off
    root_yeobu: { type: String }, //root, non-root
    root_id: { type: mongoose.ObjectId, ref: 'Comment' },
    parent_id: { type: mongoose.ObjectId, ref: 'Comment' },
    child_id: { type: Array },
    time_created: { type: Date, default: Date.now },
    content: String,
    book_id: { type: mongoose.ObjectId, ref: 'Book' },
    index_id: { type: mongoose.ObjectId, ref: 'Index' },
    card_id: { type: mongoose.ObjectId, ref: 'Card' },
});

// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Comment", commentschema)

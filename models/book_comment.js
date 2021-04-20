const mongoose = require("mongoose");

// 스키마 객체를 생성
const book_comment_schema = new mongoose.Schema({
    user_id: { type: String, ref: 'User' },
    // book_id: { type: mongoose.ObjectId, ref: 'Book' },
    book_id: { type: String },

    // root_id: { type: mongoose.ObjectId, ref: 'Comment' },
    root_id: { type: String },
    // parent_id: { type: mongoose.ObjectId, ref: 'Comment' },
    parent_id: { type: String },
    level: { type: Number, default: 1 },

    isDeleted: { type: String, default: 'no' }, //yet,no
        
    time_created: { type: Date, default: Date.now },
    rating: { type: Number, default : 1},
    content: {type : String},
    // 좋아요 또는 추천~
});

// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Book_comment", book_comment_schema)

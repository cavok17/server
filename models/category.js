const mongoose = require("mongoose");

// 스키마 객체를 생성
const categoryschema = new mongoose.Schema({
    user_id : String,
    // category_id: mongoose.Schema.Types.ObjectId,
    name: String,
    seq: Number,
    // num_books : {type : Number, default : 0},
    // new_seq_no_in_category : {type : Number, default : 0},
    book_ids : [{type:mongoose.Schema.Types.ObjectId, ref:'Book'}],
    // books : Array,
});


// ref : 'card_spec'
// users라는 모델을 생성하고 이걸 export하는 겅가? 뒤에 커렉션도 정의할 수 있는 듯
module.exports = mongoose.model("Category", categoryschema)

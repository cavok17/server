const mongoose = require("mongoose");

const book_purchase_schema = new mongoose.Schema({
    user_id : {type:String},
    sellbook_id : {type:mongoose.ObjectId, ref:'Sellbook'},
    promotion : {type:String},
    price : {type:Number},
    time_purchased: {type : Date, default : Date.now},
    payment_id : {type:mongoose.ObjectId, ref:'Payment'},
    status: {type : String},//취소나 환불 같은 거
    // payment_method: {type : String},
})

module.exports = mongoose.model("Book_purchase", book_purchase_schema)
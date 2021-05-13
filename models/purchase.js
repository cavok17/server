const mongoose = require("mongoose");

const purchawse_schema = new mongoose.Schema({
    user_id : {type:String},
    sellbook_id : {type:mongoose.ObjectId, ref:'Sellbook'},
    price : {type:Number},
    time_purchased: {type : Date, default : Date.now},
    status: {type : String},//취소나 환불 같은 거
    // payment_method: {type : String},
})

module.exports = mongoose.model("Purchase", purchase_schema)
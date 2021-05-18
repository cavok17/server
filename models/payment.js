const mongoose = require("mongoose");

const payment_schema = new mongoose.Schema({
    user_id: { type: String },
    product: [{
        type: { type: String, default: 'sellbook' },
        product_id: { type: mongoose.ObjectId, ref: 'Sellbook' },
        title : { type: String },
        author  : { type: String },
        price: { type: Number },
        count: { type: Number },
    }],
    total_price: { type: Number },
    time_purchased: { type: Date, default: Date.now },
    status: { type: String, default: '정상' },//취소나 환불 같은 거
    // payment_method: {type : String},
})

module.exports = mongoose.model("Payment", payment_schema)
const mongoose = require("mongoose");

const User = require("../models/user");

// 북카트 정보를 가져옵니다.
exports.get_book_cart = async (req, res, next) => {
    console.log('북카트 정보를 가져옵니다.')
    console.log('body', req.body)

    try{
        let user = await User.findOne({user_id: req.session.passport.user})
            .select('cart')
            .populate({path : 'cart', select : 'book_info'})    
        res.json({isloggedIn : true, user});
    } catch(err) {
        console.log(err)
        next(err)
    }
}


// 북카트를 생성합니다.
exports.create_book_cart = async (req, res) => {
    console.log('북카트를 생성합니다.')
    console.log('body', req.body)

    try{
        await User.updateOne(
            {user_id : req.session.passport.user},
            {$push : {cart : req.body.sellbook_id}}
            // {cart : req.body.sellbook_id}
        )
        res.json({isloggedIn : true, msg : "카트에 추가되었습니다."});
    } catch(err) {
        console.log(err)
        next(err)
    }
}

// 북카트를 수정합니다.
exports.update_book_cart = async (req, res) => {
    console.log('북카트를 수정합니다.')
    console.log('body', req.body)

    try{
        await User.updateOne(
            {user_id : req.session.passport.user},
            {cart : req.body.cart}        
        )
        res.json({isloggedIn : true, msg : "카트가 수정되었습니다."});
    }catch(err) {
        console.log(err)
        next(err)
    }

}
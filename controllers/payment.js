const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Category = require('../models/category');
const Book = require('../models/book');
const Sellbook = require('../models/sellbook');
const Payment  = require('../models/payment');
const Book_purchase  = require('../models/book_purchase');



const create_purchase = async (req, payment_id) => {

    let unde_category = await Category.findOne({ user_id: req.session.passport.user, name: '(미지정)' })
    let max_seq_category = await Book.find({ user_id: req.session.passport.user, category_id: unde_category._id })
        .select('seq_in_category')
        .sort({ seq: -1 })
        .limit(1)
    for (i=0; i<req.body.product.length; i++){
        let sellbook = await Sellbook.findOne({_id :  req.body.product[i].product_id})
            .select('book_info')
        let position = (max_seq_category[0].seq_in_category) * 1 + i
        
        Promise.all([
            Book.create({
                category_id : unde_category._id,
                title : sellbook.book_info.title,
                type : 'buy',
                user_id : req.session.passport.user,
                author : sellbook.book_info.author,
                seq_in_category : position,
                sellbook_id : sellbook._id,
            }),        
            Book_purchase.create({
                user_id : req.session.passport.user,
                sellbook_id : sellbook._id,
                title : sellbook.book_info.title,
                author : sellbook.book_info.author,
                promotion : sellbook.book_info.promotion,
                price : sellbook.book_info.price,
                payment_id
            })
        ]). then()
    }
    
    return

}

// 구매한 책을 내 책 리스트에 추가합니다.
const add_sellbook_to_mybook = async (req, res) => {



    // 일단 book을 생성하자
    

    // // 카드타입을 저장하고 카드타입 매퍼 만들고
    // for (i = 0; i < sellbook.cardtype_set.length; i++) {
    //     sellbook.cardtype_set[i].book_id = mybook._id
    //     sellbook.cardtype_set[i].seq = i
    // }
    // let cardtypes = await Cardtype.insertMany(sellbook.cardtype_set)
    // let cardtype_mapper = {}
    // for (i = 0; i < cardtypes.length; i++) {
    //     cardtype_mapper[sellbook.cardtype_set[i].original_cardtype_id] = cardtypes[i]._id
    // }

    // // 인덱스를 저장하고 인덱스 매퍼 만들고
    // for (i = 0; i < sellbook.index_set.length; i++) {
    //     sellbook.index_set[i].book_id = mybook._id
    //     sellbook.index_set[i].seq = i
    // }
    // let indexes = await Index.insertMany(sellbook.index_set)
    // let index_mapper = {}
    // for (i = 0; i < indexes.length; i++) {
    //     index_mapper[sellbook.index_set[i].original_index_id] = indexes[i]._id
    // }

    // // 카드 인포를 가공하고    
    // for (i = 0; i < sellbook.cardinfo_set.length; i++) {
    //     sellbook.cardinfo_set[i].book_id = mybook._id
    //     sellbook.cardinfo_set[i].cardtype_id = cardtype_mapper[sellbook.cardinfo_set[i].original_cardtype_id]
    //     sellbook.cardinfo_set[i].index_id = index_mapper[sellbook.cardinfo_set[i].original_index_id]
    // }

    // let cards = await Card.insertMany(sellbook.cardinfo_set)

    return
    // res.json({ isloggedIn: true, cardtype_mapper, index_mapper, cardinfo: sellbook.cardinfo_set, cards });

}


// 구매를 생성합니다.
exports.create_payment = async (req, res) => {
    console.log("구매를 생성합니다.");
    console.log('body', req.body);

    // 책을 구매한 경우 금액 맞는지 확인
    let total_price = 0    
    for (i=0; i<req.body.product.length; i++){        
        let sellbook = await Sellbook.findOne({_id : req.body.product[i].product_id})
            .select('book_info')
        total_price += sellbook.book_info.price * req.body.product[i].count        
    }
    
    let permission
    if (total_price == req.body.total_price){
        permission = 'ok'
    } else {
        permission = 'no'
    }        
    console.log(req.body.product,)
    

    if (permission === 'ok'){
        let payment = await Payment.create({            
            user_id : req.session.passport.user,
            product : req.body.product,
            total_price : req.body.total_price
        })
        await create_purchase(req, payment._id)        
        res.json({ isloggedIn: true, msg : '정상 결제되었습니다..' });
    } else {
        res.json({ isloggedIn: true, msg : '금액에 오류가 있습니다.' });
    }  

}


// 결제 정보를 가져옵니다.
exports.get_payment = async (req, res) => {
    console.log("// 결제 정보를 가져옵니다..");
    console.log('body', req.body);

    // 책을 구매한 경우 금액 맞는지 확인
    let payment = await Payment.find({user_id : req.session.passport.user})
        // .populate({path : 'product.product_id', select:'book_info'})
    res.json({ isloggedIn: true, payment });
}

// 책 구매 정보를 가져옵니다.
exports.get_purchase_book = async (req, res) => {
    console.log("// 책 구매 정보를 가져옵니다.");
    console.log('body', req.body);

    // 책을 구매한 경우 금액 맞는지 확인
    let book_purchase = await Book_purchase.find({user_id : req.session.passport.user})
        // .populate({path : 'product', select:'book_info'})

    res.json({ isloggedIn: true, book_purchase });
}
const mongoose = require("mongoose");
const {ObjectId} = require('mongodb');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Session = require('../models/session');
const Study_configuration = require('../models/study_configuration');
// const { session } = require("passport");


// // 선택된 책 정보를 DB에 저장하면서 세션을 만듭니다.
// exports.save_booklist= async (req, res) => {
//     console.log("선택된 책 정보를 DB에 저장합니다.");
//     console.log(req.body);

//     let booksnindexes = []
//     for (i=0; i<req.body.book_ids.length; i++){
//         let book = await Book.findOne({_id : req.body.book_ids[i]})
//         let single_book = {                        
//             book_id : book._id,
//             title : book.title,            
//             index_ids : []
//         }            
//         booksnindexes.push(single_book)
//     }    
//     console.log('booksnindexes', booksnindexes)
        
//     // 셀렉된 걸 저장합니다.
//     let session = await Session.create(
//         {user_id : req.session.passport.user,
//         booksnindexes})    

//     res.json({msg : 'Sucess!!!!!!!!!!!!!', session_id : session._id})
// }

// 스터디 콘피그를 보내줍니다.
exports.get_session_config = async (req, res) => {
    console.log("스터디 콘피그를 보내줍니다..");
    console.log('body', req.body);    
    
    // // 책과 인덱스 리스트를 받아옵니다.
    // let session_id = req.body.session_id
    // let session = await Session.findOne({_id : session_id},{booksnindexes : 1})    
    // let booksnindexes = await get_booksnindexes(session)    
    
    // 학습 설정 관련 값도 뿌려주려고 합니다.
    // 책마다 설정이 있긴 한데, 두 권 이상인 경우에는 두권 이상짜리 설정을 사용합니다.    


    // 전체 Booklist를 보내주는 게 낫지 않을까 싶음
    let study_config
    if (session.booksnindexes.length >= 2){        
        study_config = await User.findOne({user_id : req.session.passport.user}, {study_config : 1, _id : 0})                
    } else if (session.booksnindexes.length === 1) {
        study_config = await Book.findOne({_id : session.booksnindexes[0].book_id}, {study_config : 1, _id : 0})
    }
    
    res.json({isloggedIn : true, session_id, booksnindexes, study_config});    
}

// // 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
// exports.click_index = async (req, res) => {
//     console.log("인덱스 선택했니? 잘했다야");
//     console.log(req.body);

//     let session_id = req.body.session_id
//     let session = await Session.findOne({_id:session_id},{booksnindexes:1})
//     console.log(session)
//     // 불안헝께 book seq도 그냥 찾어불자.
//     // let seq_of_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id === req.body.book_id)
//     let seq_of_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)
//     console.log(seq_of_book)

//     breakme : if (req.body.status ===true) {
//         // 인덱스 정보가 동일하게 들어가는 것인지 확인을 해야해요.
//         let position_of_the_index = session.booksnindexes[seq_of_book].indexes.findIndex((single_index) => {
//             return single_index.index_id === req.body.index_id })
//         if (position_of_the_index >= 0){
//             console.log('중복이네요')
//             break breakme
//         } else {
//             console.log('중복이 아니네요')
//         }

//         // 일단 카드가 몇 개인지 세어보죠
//         let cards = await Card.find(
//             {index_id : req.body.index_id},
//             {status : 1, need_study_time :1, _id:0})
                
//         let tomorrow = new Date()
//         tomorrow.setDate(tomorrow.getDate()+1)
//         tomorrow.setHours(0,0,0,0)

//         let yet = cards.filter((card) => card.status === 'yet').length                
//         let re = cards.filter((card) => card.status === 're').length
//         let hold = cards.filter((card) => card.status === 'hold').length
//         let completed = cards.filter((card) => card.status === 'completed').length
//         let total = yet + re + hold +completed        
//         let re_until_now = cards
//             .filter((card) => card.status === 're')
//             .filter((card) => card.need_study_time < Date.now()).length
//         let re_until_today = cards
//             .filter((card) => card.status === 're')
//             .filter((card) => card.need_study_time < tomorrow.getTime()).length

//         // 데이터 구조화해서 추가해야제
//         let new_index_info = {
//             index_id : req.body.index_id,
//             yet, re, hold, completed, total, re_until_now, re_until_today}
        
//         session.booksnindexes[seq_of_book].indexes.push(new_index_info)
//         session = await session.save()            
//     } else if (req.body.status === false) {
//         // 일단 index_id가 어디있는지 찾아보자고
//         let position_of_the_index = session.booksnindexes[seq_of_book].indexes.findIndex((single_index) => {
//             return single_index.index_id === req.body.index_id })
//         if (position_of_the_index === -1){
//             console.log('그런 애 없다는디')
//             break breakme
//         } else {
//             console.log('좋아요 지워드릴게요')
//         }        
        
//         // 찾았으니까 지워야지
//         session.booksnindexes[seq_of_book].indexes.splice(position_of_the_index, 1)
//         session = await session.save()
//     }
    
//     // 이제 카드 갯수를 세어보자고
//     let num_total_cards = {
//         yet : 0, 
//         re :0, 
//         hold : 0, 
//         completed :0, 
//         total :0, 
//         re_until_now : 0, 
//         re_until_today : 0,
//     }

//     for (i=0; i<session.booksnindexes.length; i++){
//         for(j=0; j<session.booksnindexes[i].indexes.length; j++){
//             num_total_cards.yet += session.booksnindexes[i].indexes[j].yet
//             num_total_cards.re += session.booksnindexes[i].indexes[j].re
//             num_total_cards.hold += session.booksnindexes[i].indexes[j].hold
//             num_total_cards.completed += session.booksnindexes[i].indexes[j].completed
//             num_total_cards.total += session.booksnindexes[i].indexes[j].total
//             num_total_cards.re_until_now += session.booksnindexes[i].indexes[j].re_until_now
//             num_total_cards.re_until_today += session.booksnindexes[i].indexes[j].re_until_today            
//         }    
//     }

//     // 일단 num total cards는 저장 안 하고 넘어가도록 함

//     res.json({isloggedIn : true, session_id, num_total_cards});    
// }


// 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
exports.get_index = async (req, res) => {
    console.log(req.body);
    
    // aggregation을 통해 total_index_info를 만들고
    let total_index_info = []
    // total_index_info와 index 콜렉션 정보를 조합하여 single_book_info를 완성한다.
    let single_book_info = {
        book_id : req.body.selected_books.book_id,
        title : req.body.selected_books.title,
        index_info : []
    }    

    // ---------------------- 시~시~시~자악 ----------------------

    // book_id를 그냥 넣으니깐 filter를 안 먹어요. objectid로 바꿔서 넣었어요.
    let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
    let filter = {book_id : converted_book_id}    
    
    // 현재는 복습 필요시점이 시간으로 되어 있는데, 그룹핑을 해줘야 해요.
    let current_time = Date.now()
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate()+1)
    tomorrow.setHours(0,0,0,0)    
    tomorrow = tomorrow.getTime()
    
    let project_by_switch = {
        index_id : 1,
        status : 1,
        // need_study_time : 1,
        // need_study_time_by_milli : {$toDecimal : '$need_study_time'} ,
        book_id : 1,
        body_id_body : {$toObjectId : req.body.book_id},        
        need_study_time_group : {
            $switch : {
                branches : [
                    {
                        case : { $eq :['$need_study_time', null]},
                        then : 'not_studying'
                    },                    {
                        case : { $lt :[{$toDecimal : '$need_study_time'}, current_time]},
                        then : 'until_now'
                    },{
                        case : {$and : [{$gte : [{$toDecimal : '$need_study_time'}, current_time]}, {$lt : [{$toDecimal : '$need_study_time'}, tomorrow]}]},
                        then : 'until_today'
                    },{
                        case : { $gt : [{$toDecimal : '$need_study_time'}, tomorrow]},
                        then : 'after_tomorrow'
                    }
                ],
                default : 'not_studying'
            }
        }
    }

    // 조건에 맞는 카드 갯수를 구해야해요
    // index별, status별, 복습시점별
    let group = {_id : {index_id : '$index_id', status : '$status', need_study_time_group : '$need_study_time_group'}, count : {$sum : 1}}
    let lookup = {
        from : 'indexes',
        localField : '_id.index_id',
        foreignField : '_id',
        as : 'index_info'
    }
    
    // aggregate를 실행해요        
    let num_cards_of_index = await Card.aggregate([
        {$match : filter}, 
        {$project : project_by_switch},
        {$group : group},
        {$lookup : lookup}
    ])    
    num_cards_of_index.sort((a,b)=> a.index_info.seq - b.index_info.seq)
    // console.log('num_cards_of_index', num_cards_of_index)

    // aggregate결과를 보기좋게 정리해요                  
    let single_index_info ={
        index_id : null,
        name : null,
        yet : 0,
        ing : {
            until_now : 0,
            until_today : 0,
            after_tomorrow : 0,
            total : 0
        },
        hold : 0,
        completed : 0
    }
    for (i=0; i<num_cards_of_index.length; i++){
        // 학습 중이냐 아니냐에 따라 데이터 넣는 방식이 달라져요
        if (num_cards_of_index[i]._id.status != 'ing'){
            single_index_info[num_cards_of_index[i]._id.status] = num_cards_of_index[i].count
        } else {
            let need_study_time_group = num_cards_of_index[i]._id.need_study_time_group            
            single_index_info.ing[need_study_time_group] = num_cards_of_index[i].count
        }

        if (num_cards_of_index.length === i+1 || String(num_cards_of_index[i]._id.index_id) !== String(num_cards_of_index[i+1]._id.index_id) ){
            single_index_info.index_id = num_cards_of_index[i]._id.index_id                
            single_index_info.ing.total = single_index_info.ing.until_now + single_index_info.ing.until_today + single_index_info.ing.after_tomorrow
            console.log('single_index_info', single_index_info)
            total_index_info.push(single_index_info)
        }
    }

    let indexes = await Index
        .find({book_id : req.body.selected_books.book_id})
        .select('name level seq')
        .sort({seq : 1})

    // let index_info_for_push
    for (i=0; i<indexes.length; i++){
        let position_of_index = total_index_info.findIndex((index_info) => {            
            return String(index_info.index_id) == String(indexes[i]._id)
        }) 
        let index_info_for_push ={}
        if (position_of_index === -1) {
            index_info_for_push = {            
                index_id : indexes[i]._id,
                name : indexes[i].name,
                level : indexes[i].level,
                seq : indexes[i].seq,
                yet : 0,
                ing : {
                    until_now : 0,
                    until_today : 0,
                    after_tomorrow : 0,
                    total : 0
                },
                hold : 0,
                completed : 0,
            }            
        } else {
            index_info_for_push = {            
                index_id : indexes[i]._id,
                name : indexes[i].name,
                level : indexes[i].level,
                seq : indexes[i].seq,
                yet : total_index_info[position_of_index].yet,
                ing : total_index_info[position_of_index].ing,
                hold : total_index_info[position_of_index].hold,
                completed : total_index_info[position_of_index].completed,
            }
        }
        single_book_info.index_info.push(index_info_for_push)
    }

     res.json({isloggedIn : true,  single_book_info});    
}

// 선택된 책과 인덱스로 세션을 만듭니다.
exports.create_session= async (req, res) => {
    console.log("선택된 책 정보를 DB에 저장합니다.");
    console.log(req.body);

    let booksnindexes = []
    for (i=0; i<req.body.book_ids.length; i++){
        let book = await Book.findOne({_id : req.body.book_ids[i]})
        let single_book = {                        
            book_id : book._id,
            title : book.title,            
            index_ids : []
        }            
        booksnindexes.push(single_book)
    }    
    console.log('booksnindexes', booksnindexes)
        
    // 셀렉된 걸 저장합니다.
    let session = await Session.create(
        {user_id : req.session.passport.user,
        booksnindexes})    

    res.json({msg : 'Sucess!!!!!!!!!!!!!', session_id : session._id})
}

// // 책의 순서를 올립니다.
// exports.click_up = async (req, res) => {
//     console.log("책아! 위로 올라갓!");
//     console.log(req.body);

//     // 기본 정보를 만들고
//     let session = await Session.findOne({_id : req.body.session_id},{booksnindexes : 1})
//     // 대상 책의 시퀀스를 찾아보자.
//     let seq_of_the_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)

//     // 순서를 조정하자
//     if(seq_of_the_book === 0) {
//         console.log('오를 데가 없어요')
//         return
//     } else {        
//         [session.booksnindexes[seq_of_the_book-1], session.booksnindexes[seq_of_the_book]] = [session.booksnindexes[seq_of_the_book], session.booksnindexes[seq_of_the_book-1]]        
//         session = await session.save()
//     }    
    
    
//     // 책과 인덱스 리스트를 받아옵니다.
//     let booksnindexes = await get_booksnindexes(session)

//     res.json({isloggedIn : true, booksnindexes,});    
// }

// // 책의 순서를 내립니다.
// exports.click_down = async (req, res) => {
//     console.log("책아! 아래로 내려갓!");
//     console.log(req.body);

//     // 기본 정보를 만들고
//     let session = await Session.findOne({_id : req.body.session_id},{booksnindexes : 1})    
//     // 대상 책의 시퀀스를 찾아보자.
//     let seq_of_the_book = session.booksnindexes.findIndex((booknindex) => booknindex.book_id == req.body.book_id)    

//     // 순서를 조정하자
//     if(seq_of_the_book === (session.booksnindexes.length-1)) {
//         console.log('내릴 데가 없어요')        
//     } else {        
//         [session.booksnindexes[seq_of_the_book], session.booksnindexes[seq_of_the_book+1]] = [session.booksnindexes[seq_of_the_book+1], session.booksnindexes[seq_of_the_book]]        
//         session = await session.save()        
//     }    
    
//     // 책과 인덱스 리스트를 받아옵니다.
//     let booksnindexes = await get_booksnindexes(session)

//     res.json({isloggedIn : true, booksnindexes,});  
// }

// 해당 목차의 카드를 전달합니다.
exports.start_study = async (req, res) => {
    console.log("공부를 시작합시다.");
    console.log(req.body);
    
    let session = await Session.findOne({_id : req.body.session_id})
    // console.log('session', session)
    
    // let bookNindex_list = await Selected_bookNindex
    //     .find({session_id : req.body.session_id})
    //     .sort({seq : 1})

    // 스터디 콘피그 수정해주고
    let study_config_update_object = {
        'study_config.study_mode' : req.body.study_mode,
        // read, flip, exam
        'study_config.card_order' : req.body.card_order,
        // sort_by_index, sort_by_restudytime, random
        'study_config.re_card_collect_criteria' : req.body.re_card_collect_criteria,
        // all, now, today
        'study_config.on_off.yet' : req.body.on_off.yet,
        'study_config.on_off.re' : req.body.on_off.re,
        'study_config.on_off.hold' : req.body.on_off.hold,
        'study_config.on_off.completed' : req.body.on_off.completed,
        'study_config.num_cards.yet' : req.body.num_cards.yet,
        'study_config.num_cards.re' : req.body.num_cards.re,
        'study_config.num_cards.hold' : req.body.num_cards.hold,
        'study_config.num_cards.completed' : req.body.num_cards.completed,
    }
    if(session.booksnindexes.length ===1){
        let book_config_modi_result = await Book.updateOne(
            {_id : session.booksnindexes[0].book_id}, study_config_update_object)
    } else if(session.booksnindexes.length > 2){
        let user_config_modi_result = await User.updateOne(
            {user_id : req.session.passport.user}, study_config_update_object)            
    };

    // -------------------------------------- 토 탈 -----------------------------------------------------
    // 리스트를 하나로 통합하고
    let cardlist_total = []
    // 책 단위로 카드를 받아서 통합하자
    for (i=0; i<session.booksnindexes.length; i++){
        let index_ids = session.booksnindexes[i].indexes.map((index_array) => index_array.index_id)
        cardlist_of_singlebook = await Card
            .find({index_id : index_ids})
            .select('cardtype book_id index_id status seq_in_index need_study_time study_result')                
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }

    // 토탈 카드리스트에 시퀀스 정보를 생성합니다.
    for (i=0; i<cardlist_total.length; i++) {        
        cardlist_total[i].seq_in_total_list = i        
    }

    // 이걸 세션에 저장하고
    session.cardlist_total = cardlist_total
    
    // -------------------------------------- 세 파 -----------------------------------------------------
    // 이걸 속성으로 분리하고
    session.cardlist_sepa.yet = cardlist_total.filter((card) => card.status === 'yet')
    // console.log(session.cardlist_sepa.yet)
    session.cardlist_sepa.re = cardlist_total.filter((card) => card.status === 're')
    // console.log(session.cardlist_sepa.re)
    session.cardlist_sepa.hold = cardlist_total.filter((card) => card.status === 'hold')
    session.cardlist_sepa.completed = cardlist_total.filter((card) => card.status === 'completed')

// -------------------------------------- 워 킹 템 프 -----------------------------------------------------
    // 다시 하나로 묶어서 정리해주고 cardlist_working으로 만들어준다.
    let cardlist_working = []
    cardlist_working = cardlist_working.concat(session.cardlist_sepa.yet.slice(0, req.body.num_cards.yet))
    cardlist_working = cardlist_working.concat(session.cardlist_sepa.re.slice(0, req.body.num_cards.re))
    cardlist_working = cardlist_working.concat(session.cardlist_sepa.hold.slice(0, req.body.num_cards.hold))
    cardlist_working = cardlist_working.concat(session.cardlist_sepa.completed.slice(0, req.body.num_cards.completed))
    
    // cardlist_working_tmp
    //     .sort((a,b) => a.index_id.seq - b.index_id.seq)
    //     .sort((a,b) => a.seq_in_index - b.seq_in_index)
    
    // 불필요한 거 지워주자
    delete cardlist_working.status
    delete cardlist_working.index_id
    delete cardlist_working.seq_in_index
    delete cardlist_working.seq_in_total

    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    let now = Date.now()        
    for (i=0; i<cardlist_working.length; i++){        
        if (cardlist_working[i].need_study_time === null || cardlist_working_tmp[i].need_study_time > now){
            cardlist_working[i].need_study_time = now
        }
    }
    
    session.num_used_cards = {
        yet : req.body.num_cards.yet,
        re : req.body.num_cards.re,
        hold : req.body.num_cards.hold,
        completed : req.body.num_cards.completed,
    }
    
    // -------------------------------------- 워 킹 -----------------------------------------------------
    session.cardlist_working = cardlist_working
    // console.log('cardlist_working', session.cardlist_working)
    session = await session.save()

    res.json({isloggedIn : true, cardlist_working, });
}

exports.get_studying_cards = async (req, res) => {
    console.log("카드 받으셔요~");
    console.log(req.body);

    // 여기서 current_seq와 num_request_cards를 받아야 해
    let session = await Session.findOne({_id : req.body.session_id}, {seq_in_working : 1, cardlist_working : 1})        
    // console.log('session', session.cardlist_working)
    
    // 필요 없는 영역은 잘라내고
    session.cardlist_working.splice(req.body.current_seq+req.body.num_request_cards,1000000)
    if (req.body.current_seq >0){
        session.cardlist_working.splice(0,req.body.current_seq)
    }

    // seq_in_working 만들어주고,
    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    for (i=0; i<session.cardlist_working.length; i++){
        session.cardlist_working[i].seq_in_working = req.body.current_seq+i
    }

    // 컨텐츠 붙여주고
    let cards_to_send = await Session.populate(session, 
        {path : 'cardlist_working._id', 
        select : 'cardtype_id cardtype status content_of_importance content_of_first_face content_of_second_face content_of_third_face content_of_annot exp level'})

    // console.log('cards_to_send', cards_to_send)
    res.json({isloggedIn : true, cards_to_send});
}


exports.get_study_configuration = async (req, res) => {
    console.log("학습 설정을 보내드립니다.");
    console.log(req.body);

    let study_configuration = await Study_configuration.findOne({book_id : req.body.book_id})

    res.json({isloggedIn : true, study_configuration})  
}


exports.set_study_configuration = async (req, res) => {
    console.log("학습 설정을 바꾸셨군요.");
    console.log(req.body);

    let study_configuration = await Study_configuration.findOne({book_id : req.body.book_id})

    study_configuration.difficulty_setting = req.body.difficulty_setting
    study_configuration.exp_setting = req.body.exp_setting
    study_configuration.lev_setting = req.body.lev_setting

    study_configuration = await study_configuration.save()

    res.json({isloggedIn : true, msg : "수정 완료"})  
}

exports.get_all_study_configurations = async (req, res) => {
    console.log("학습 설정을 다 보내드립죠.");
    console.log(req.body);

    let selected_bookNindex_list = await Selected_bookNindex
        .find({session_id : req.body.session_id})
        .sort({seq : 1})

    let book_ids = []
    for (i=0; i<selected_bookNindex_list.length; i++){
        book_ids.push(selected_bookNindex_list[i].book_id)
    }

    let study_configurations = await Study_configuration.find({book_id : book_ids})

    res.json({isloggedIn : true, study_configurations})  
}

exports.temp = async (req, res) => {
    // 순서를 섞어야되믄 순서를 섞고
    if(req.body.card_order === 'shuffle'){
        for (let i = total_cardlist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
            [array[i], array[j]] = [array[j], array[i]];
        }    
    }

    // 복습 필요 순서로 정렬해야되믄 정렬도 하고
    if(req.body.card_order === 'sort_by_time'){
        cardlist.sort((a,b) => a.willstudy_time - b.willstudy_time)
    }

    // 다 됐으믄 전체 리스트를 수정하자고하자고
    let studyingcard_total = await Studyingcard_total.updateOne(
        {user_id : req.user},
        {cardlist : total_cardlist}
    )
    
    // 복습카드와 신규카드를 구분하는 작업이 필요함

    // 다 됐으믄 현재 공부카드만 남겨놓자고
    
    let studyingcard_current = await Studyingcard_current.updateOne(
        {user_id : req.user},
        {cardlist : current_cardlist}
    )

    res.json({isloggedIn : true, cardlist});
};


// 순서 섞는 함수
const shuffle = function(array) {
    // Math.floor -> 내림
    // Math.random -> 0과 1사이 난수
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
      [array[i], array[j]] = [array[j], array[i]];
    }
}

const get_booksnindexes = async function(session){
    // let session = await Session.findOne({_id : session_id},{booksnindexes : 1})    
    let booksnindexes = []
    for (i=0; i<session.booksnindexes.length; i++){
        let indexes_of_the_book = await Index
            .find({book_id : session.booksnindexes[i].book_id})
            .sort({seq : 1})        
        let single_bookNindex = {
            book_id : session.booksnindexes[i].book_id,
            title : session.booksnindexes[i].title,
            index_ids : indexes_of_the_book,
        }
        booksnindexes.push(single_bookNindex)
    }
    return booksnindexes
}


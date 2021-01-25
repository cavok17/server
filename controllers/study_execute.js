const mongoose = require("mongoose");
const {ObjectId} = require('mongodb');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Session = require('../models/session');
const Level_config = require('../models/level_config');

// 해당 목차의 카드 리스트를 전달합니다.
exports.get_cardlist = async (req, res) => {
    console.log("카드 리스트를 보내줘야 해요.");
    console.log(req.body);
    
    let session = await Session.findOne({_id : req.body.session_id})    
    // console.log(session)

    // read에 standard이면 그냥 통과시켜야 함
    if (session.study_mode === 'read' && session.study_config.sort_option ==='standard'){
        // start_standard_read_mode(session)
        return
    }
    console.log('어이어이~')
    // -------------------------------------- 필터 세팅 -----------------------------------------------------
    let filters = {}

    // 1번
    let cardtype_filter = []    
    // read, flip-normal, flip-select, none, share    
    if (session.study_config.card_on_off.read_card === 'on' ){
        cardtype_filter = cardtype_filter.concat(['read'])
    }
    if (session.study_config.card_on_off.flip_card === 'on' ){
        cardtype_filter = cardtype_filter.concat(['flip-normal', 'flip-select'])
    }
    filters.type = cardtype_filter
    
    // 2번
    let cardstatus_filter = []
    for (let card_status of ['yet', 'ing', 'hold', 'completed']) {        
        if (session.study_config.status_on_off[card_status] === 'on'){
            cardstatus_filter.push(card_status)
        }
    }
    filters.status = cardstatus_filter
    
    // 3번
    let needstudytime_high
    let needstudytime_low
    if(session.study_config.status_on_off.ing === 'on'){
        switch (session.study_config.collect_criteria){
            case 'all' :                
                break
            case 'by_now' :                 
                needstudytime_high = Date.now()
                filters.$or= [{'detail_status.need_study_time' : {$lt : needstudytime_high}}, {'detail_status.need_study_time' : null}]
                break
            case 'by_today' :
                let needstudytime_high = new Date()
                needstudytime_high.setDate(needstudytime_high.getDate()+1)
                needstudytime_high.setHours(0,0,0,0)                             
                filters.$or= [{'detail_status.need_study_time' : {$lt : needstudytime_high}}, {'detail_status.need_study_time' : null}]
                break
            case 'custom' :
                // 필터 날짜 변환하는 거 확인 필요함
                needstudytime_low = new Date(session.study_config.needstudytime_filter.low)
                needstudytime_high = new Date(session.study_config.needstudytime_filter.high)
                filters.$or= [{$and : [{'detail_status.need_study_time' : {$gt : needstudytime_low,}}, {'detail_status.need_study_time' : {$lt : needstudytime_high}}]}, {'detail_status.need_study_time' : null}]
                break
        }
    }
    
    // -------------------------------------- 토 탈 -----------------------------------------------------
    
    // 리스트를 하나로 통합하고
    let cardlist_total = []

    // 책 단위로 카드를 받아서 통합하자
    for (i=0; i<session.booksnindexes.length; i++){
        filters.index_id = session.booksnindexes[i].index_ids
        // console.log('filters', filters)                
        cardlist_of_singlebook = await Card            
            .find(filters)
            .select('cardtype_name book_id index_id type status seq_in_index detail_status')                
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
        // 위에서는 인덱스 내 순서로만 정렬되어 있고, 이제 인덱스 순서로도 정렬해줘야 함.
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        // 통합 리스트를 만들기 위해 concat함
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }
    // console.log(cardlist_total)

    // -------------------------------------- 소트를 적용합시다. -----------------------------------------------------
    // 원본 그대로, 복습시점 빠른 순, 랜덤
    switch (req.body.card_order) {
        case 'standard' :
            // 이미 소트를 적용해놔서 손 댈 거 없쯤
            break
        case 'time' :
            cardlist_total.sort((a,b) => a.detail_status.need_study_time - b.detail_status.need_study_time)
            break
        case 'random' :            
            for (let i = cardlist_total.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
                [cardlist_total[i], cardlist_total[j]] = [cardlist_total[j], cardlist_total[i]];
              }
            break
    }

    // 토탈 카드리스트에서의 시퀀스 정보를 생성합니다.
    for (i=0; i<cardlist_total.length; i++) {        
        cardlist_total[i].seq_in_total_list = i        
        cardlist_total[i].former_status = null
    }

    // 불필요한 정보를 지워줍니다.
    for (i=0; i<cardlist_total.length; i++){
        delete cardlist_total[i].seq_in_index        
        delete cardlist_total[i].index_id
    }
    session.cardlist_total = cardlist_total
    // console.log('cardlist_total', cardlist_total)

// -------------------------------------- 세 파 -----------------------------------------------------
    // 이걸 속성으로 분리하고
    let cardlist_sepa = {}
    cardlist_sepa.yet = cardlist_total.filter((card) => card.status === 'yet')        
    cardlist_sepa.ing = cardlist_total.filter((card) => card.status === 'ing')    
    cardlist_sepa.hold = cardlist_total.filter((card) => card.status === 'hold')    
    cardlist_sepa.completed = cardlist_total.filter((card) => card.status === 'completed')    

    // 이걸 세션에 저장하고
    session.cardlist_sepa = {
        yet : cardlist_sepa.yet,
        ing : cardlist_sepa.ing,
        hold : cardlist_sepa.hold,
        completed : cardlist_sepa.completed,
    }

    // 카드 갯수를 업데이트 합니다.
    session.num_cards.yet.total = cardlist_sepa.yet.length
    session.num_cards.ing.total = cardlist_sepa.ing.length
    session.num_cards.hold.total = cardlist_sepa.hold.length
    session.num_cards.completed.total = cardlist_sepa.completed.length

// -------------------------------------- 스터딩 -----------------------------------------------------

    // 다시 하나로 묶어서 정리해주고 cardlist_studying으로 만들어준다.
    let cardlist_studying = []
    let cardlist_studying_yet = []
    let cardlist_studying_ing = []
    let cardlist_studying_hold = []
    let cardlist_studying_completed = []

    if (session.study_config.num_cards.on_off === 'on'){
        cardlist_studying_yet = cardlist_sepa.yet.slice(0, session.study_config.num_cards.yet)
        cardlist_studying_ing = cardlist_sepa.ing.slice(0, session.study_config.num_cards.ing)
        cardlist_studying_hold = cardlist_sepa.hold.slice(0, session.study_config.num_cards.hold)
        cardlist_studying_completed = cardlist_sepa.completed.slice(0, session.study_config.num_cards.completed)
    } else {
        cardlist_studying_yet = cardlist_sepa.yet
        cardlist_studying_ing = cardlist_sepa.ing
        cardlist_studying_hold = cardlist_sepa.hold
        cardlist_studying_completed = cardlist_sepa.completed
    }

    cardlist_studying = cardlist_studying.concat(cardlist_studying_yet, cardlist_studying_ing, cardlist_studying_hold, cardlist_studying_completed)
    

    // 사용한 카드가 몇 장인지 업데이트 해주자
    session.num_cards.yet.selected = cardlist_studying_yet.length
    session.num_cards.ing.selected = cardlist_studying_ing.length
    session.num_cards.hold.selected = cardlist_studying_hold.length
    session.num_cards.completed.selected = cardlist_studying_completed.length
    

    // // 정보가 필요하면 넣어
    // let now = new Date()       
    // for (i=0; i<cardlist_studying.length; i++){        
    //     if (cardlist_studying[i].detail_status.need_study_time === null || cardlist_studying[i].detail_status.need_study_time > now){
    //         // cardlist_studying[i].detail_status.need_study_time = now
    //         cardlist_studying[i].detail_status.need_study_time = now.toString()
    //         // ardlist_studying[i].detail_status.need_study_time = now.toISOString()
            
    //     }
    //     cardlist_studying[i].detail_status.session_study_times = 0
    // }

    // seq_in_total_list로 정렬함 -> 그럼 원래 순서로 돌아옴
    cardlist_studying
        .sort((a,b) => a.seq_in_total_list - b.seq_in_total_list)
    
    session = await session.save()

    // 학습 설정도 받아주시고요
    let book_ids = []
    for (i=0; i<session.booksnindexes.length; i++){
        book_ids.push(session.booksnindexes[i].book_id)
    }
    let level_config = await Level_config.find({book_id : book_ids})
    // console.log(level_config)


    // console.log('cardlist_studying', cardlist_studying)
    // console.log(cardlist_studying)
    console.log('1', cardlist_studying)
    res.json({isloggedIn : true, cardlist_studying, level_config, num_cards : session.num_cards});
}


exports.get_studying_cards = async (req, res) => {
    console.log("카드 받으셔요~");
    console.log(req.body);

    // 컨텐츠를 받아오고
    let cards = await Card.find({_id : req.body.card_ids})
        .select ('parent_card_id external_card_id seq_in_index contents book_id')        
        .populate({path : 'parent_card_id',select : 'contents'})
        .populate({path : 'external_card_id',select : 'contents'})
    
    // 날라온 카드 아이디 순서랑 맞춰주고
    for (i=0; i<req.body.card_ids.length; i++){
        if (cards[i]._id != req.body.card_ids[i]) {
            let position = cards.findIndex((card) => card._id == req.body.card_ids[i]);            
            [cards[i], cards[position]] = [cards[position], cards[i]]
        }
    }
    
    // 익스터널이나, 쉐어 카드의 컨텐츠 정리해주고
    for (i=0; i<cards.length; i++) {
        if (cards[i].parent_card_id != null) {
            cards[i].contents.share = cards[i].parent_card_id.contents.share
        }
        if (cards[i].external_card_id != null) {
            cards[i].contents.share = cards[i].external_card_id.contents.share,
            cards[i].contents.face1 = cards[i].external_card_id.contents.face1,
            cards[i].contents.selection = cards[i].external_card_id.contents.selection,
            cards[i].contents.face2 = cards[i].external_card_id.contents.face2,
            cards[i].contents.annotation = cards[i].external_card_id.contents.annotation
        }
    }

    delete cards.parent_card_id
    delete cards.external_card_id
    delete cards.seq_in_index

    res.json({isloggedIn : true, cards, });
}

exports.show_the_rest_of_cards = async (req, res) => {

}



exports.get_studying_cards_in_read_mode = async (req, res) => {
    console.log("목차별로 카드를 쏴드려요. 필터가 적용된 걸루요");
    console.log(req.body);

    // 세션 아이디와 인덱스 아이디를 보내주삼

    let session = await Session.findOne({_id : req.body.session_id})

    // -------------------------------------- 필터 세팅 -----------------------------------------------------
    let filters = {}

    // 1번
    filters.index_id = [req.body.index_id]

    // 2번
    let cardtype_filter = []    
    // read, flip-normal, flip-select, none, share
    // 스탠하고 랜덤은 쉐어를 넣고 차일드를 빼야하고, 타임은 쉐어를 빼고 차일드를 넣어야 해. 아님 취소
    if (session.study_config.card_on_off.read_card === 'on' ){
        cardtype_filter = cardtype_filter.concat(['read'])
    }
    if (session.study_config.card_on_off.flip_card === 'on' ){
        cardtype_filter = cardtype_filter.concat(['flip-normal', 'flip-select'])
    }
    // 중복제거
    [...new Set(cardtype_filter)]
    filters.type = cardtype_filter
    
    // 3번
    let cardstatus_filter = []
    for (let card_status in ['yet', 'ing', 'hold', 'completed']) {
        if (session.study_config.status_on_off[card_status] === 'on')
        cardstatus_filter.push(card_status)
    }
    filters.status = cardstatus_filter
    
    // 4,5번
    let needstudytime_high_filter
    let needstudytime_low_filter
    if(session.study_config.status_on_off.ing === 'on'){
        switch (session.study_config.collect_criteria){
            case 'all' :
                needstudytime_low_filter = new Date('2000/1/1/00:00:00')
                needstudytime_high_filter = new Date('2050/1/1/00:00:00')
                break
            case 'by_now' : 
                needstudytime_low_filter = new Date('2000/1/1/00:00:00')
                needstudytime_high_filter = Date.now()
                break
            case 'by_today' :
                let tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate()+1)
                tomorrow.setHours(0,0,0,0)
                // console.log(tomorrow.getTime())         
                needstudytime_high_filter = tomorrow.getTime()
                needstudytime_low_filter = new Date('2000/1/1/00:00:00')
                break
            case 'custom' :
                // 필터 날짜 변환하는 거 확인 필요함
                needstudytime_low_filter = session.study_config.needstudytime_filter.low
                needstudytime_high_filter = session.study_config.needstudytime_filter.low
        }
        
        filters.$or= {$and : {'study_result.need_study_time' : {$gt : needstudytime_low_filter,}, 'study_result.need_study_time' : {$lt : needstudytime_high_filter}}, 'study_result.need_study_time' : null}
        // 이게 되는지 모르겠다야!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!        
    }

    // 리스트를 하나로 통합하고
    let cardlist_total = []

    // 책 단위로 카드를 받아서 통합하자
    for (i=0; i<session.booksnindexes.length; i++){
        filters.index_id = session.booksnindexes[i].index_ids
        // let index_ids = session.booksnindexes[i].indexes.map((index_array) => index_array.index_id)
        // console.log(filters)
        cardlist_of_singlebook = await Card           
            .find(filters)
            .select('type index_id seq_in_index parent_card_id position_of_contents external_card_id contents')                
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
            .populate({path : 'external_card_id',select : 'contents'})
            // position_of_contents
        
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }
    
    // 하위카드가 없는 share카드의 삭제 --> 쉐어 카드 자체가 들어오지 않으므로 상관없을 듯
    // 포문으로 share 카드를 찾아서, 그 다음 카드의 parent와 동일하지 않다면 share를 삭제    
    let delete_list = []
    for (i=0; i<cardlist_total.length; i++){
        if (cardlist_total[i].type ==='share'){
            if (cardlist_total[i]._id != cardlist_total[i+1].parent_card_id || i === cardlist_total.length-1){
                delete_list.push(i)
            }
        }
    }    
    delete_list.reverse()
    for (i=0; i<delete_list.length; i++){
        cardlist_total.splice(delete_list[i], 1)
    }

    //익스터널은 데이터를 다시 만들어줘야...
    for (i=0; i<cardlist_total.length; i++){
        if (cardlist_total[i].position_of_content ==='external'){
            cardlist_total[i].contents = {
                none : cardlist_total[i].external_card_id.contents.none,
                share : cardlist_total[i].external_card_id.contents.share,
                face1 : cardlist_total[i].external_card_id.contents.face1,
                selection : cardlist_total[i].external_card_id.contents.selection,
                face2 : cardlist_total[i].external_card_id.contents.face2,
                annotation : cardlist_total[i].external_card_id.contents.annotation,                
            }
        }
    }

    delete cardlist_total.external_card_id    

    res.json({isloggedIn : true, cardlist_studying, });

}




exports.req_add_cards = async (req, res) => {
    console.log("추가 카드를 요청하셨군요.");
    console.log(req.body);

    req.body.session_id
    req.body.add_cards.yet

    let session = await Session.findOne({_id : req.body.session_id})
        .select('num_used_cards cardlist_sepa ')

    let cardlist_add = []
    // 사용 카드 갯수 정보를 업데이트 하고
    for (status of ['yet', 'ing', 'hold', 'completed']){
        if (req.body.add_cards[status] > 0){
            cardlist_add = cardlist_add.concat(session.cardlist_sepa[status].slice(session.num_used_cards[status]-1, session.num_used_cards[status]+req.body.add_cards[status]-1))
            session.num_used_cards[status] += req.body_add_cards[status]        
        }
    }
    
    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    let now = Date.now()        
    for (i=0; i<cardlist_add.length; i++){        
        if (cardlist_add[i].detail_status.need_study_time === null || cardlist_studying[i].detail_status.need_study_time > now){
            cardlist_studying[i].detail_status.need_study_time = now
        }
    }

    // seq_in_total_list로 정렬함 -> 그럼 원래 순서로 돌아옴
    cardlist_studying
        .sort((a,b) => a.seq_in_total_list - b.seq_in_total_list)

    res.json({isloggedIn : true, cardlist_studying, });

}







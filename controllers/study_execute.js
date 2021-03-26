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
        cardlist_of_singlebook = await Card            
            .find(filters)
            .select('cardtype_id type book_id index_id seq_in_index status position_of_content parent_exist_yeobu detail_status')                
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
        // 위에서는 인덱스 내 순서로만 정렬되어 있고, 이제 인덱스 순서로도 정렬해줘야 함.
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        // 통합 리스트를 만들기 위해 concat함
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }

    // -------------------------------------- 소트를 적용합시다. -----------------------------------------------------
    // 원본 그대로, 복습시점 빠른 순, 랜덤
    switch (session.study_config.sort_option) {
        case 'standard' :
            // 이미 소트를 적용해놔서 손 댈 거 없쯤
            break
        case 'time' :
            cardlist_total.sort((a,b) => a.detail_status.need_study_time - b.detail_status.need_study_time)
            // 널이 앞으로 와버리니까 뒤로 옮기는 작업이 필요함
            let not_null
            for (i=0; i<cardlist_total.length; i++){
                if(cardlist_total[i].detail_status.need_study_time != null){
                    not_null = i
                    break
                }
            }
            if (not_null>0){
                let sliced_cardlist = cardlist_total.splice(0,not_null)
                cardlist_total = cardlist_total.concat(sliced_cardlist)
            }
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
        cardlist_total[i].seq_in_session = i                
    }

// -------------------------------------- 세 파 -----------------------------------------------------
    // 이걸 속성으로 분리하고
    let cardlist_sepa = {}
    cardlist_sepa.yet = cardlist_total.filter((card) => card.status === 'yet')        
    cardlist_sepa.ing = cardlist_total.filter((card) => card.status === 'ing')    
    cardlist_sepa.hold = cardlist_total.filter((card) => card.status === 'hold')    
    cardlist_sepa.completed = cardlist_total.filter((card) => card.status === 'completed')    

    // 이걸 세션에 저장하고... 이 때 불필요한 필드가 날라갑니다.
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
        cardlist_studying_yet = session.cardlist_sepa.yet.slice(0, session.study_config.num_cards.yet)
        cardlist_studying_ing = session.cardlist_sepa.ing.slice(0, session.study_config.num_cards.ing)
        cardlist_studying_hold = session.cardlist_sepa.hold.slice(0, session.study_config.num_cards.hold)
        cardlist_studying_completed = session.cardlist_sepa.completed.slice(0, session.study_config.num_cards.completed)
    } else {
        cardlist_studying_yet = session.cardlist_sepa.yet
        cardlist_studying_ing = session.cardlist_sepa.ing
        cardlist_studying_hold = session.cardlist_sepa.hold
        cardlist_studying_completed = session.cardlist_sepa.completed
    }

    cardlist_studying = cardlist_studying.concat(cardlist_studying_yet, cardlist_studying_ing, cardlist_studying_hold, cardlist_studying_completed)

    // 오리지날 스테이터스를 남겨둔다.
    for (i=0; i<cardlist_studying.length; i++){
        cardlist_studying[i].original_status = cardlist_studying[i].status
    }
    

    // 사용한 카드가 몇 장인지 업데이트 해주자
    session.num_cards.yet.selected = cardlist_studying_yet.length
    session.num_cards.ing.selected = cardlist_studying_ing.length
    session.num_cards.hold.selected = cardlist_studying_hold.length
    session.num_cards.completed.selected = cardlist_studying_completed.length

    // seq_in_session로 정렬함 -> 그럼 원래 순서로 돌아옴
    cardlist_studying
        .sort((a,b) => a.seq_in_session - b.seq_in_session)
    
    session = await session.save()

// -------------------------------------- 레벨 설정  -----------------------------------------------------
    let book_ids = []    
    for (i=0; i<session.booksnindexes.length; i++){
        book_ids.push(session.booksnindexes[i].book_id)
    }
    let level_config = await Level_config.find({book_id : book_ids})
    
    res.json({isloggedIn : true, cardlist_studying, level_config, num_cards : session.num_cards});
}

// ******************************************************************************************************************************************
// ******************************************************************************************************************************************
exports.get_cardlist_for_continue = async (req, res) => {
    console.log("기존에 진행했던 session을 이어합니다.");
    console.log(req.body);

    // 세션을 가져오고
    let session = await Session.findOne({_id : req.body.session_id})
        .select('num_cards cardlist_sepa cardlist_studied')

    // 카드리스트_토탈을 다시 보내면 어떨까.

    // 이 때 카드 갯수가 꼬일 수 있어 300 - 200을 공부했고, 100이 남았다..
    // cardlist_studied의 중복 제거
    // 나중에는 cardlist_studied에 신규 여부를 관리할 거야. 그 때 반영해줘.
    // 근데 카드리스트 스터디드가 심플해진다면, 중복 제거하는 작업이 오히려 번거로워질 수도 있겠다.
    session.cardlist_studied.reverse()
    let dup = []
    for (i=0; i<session.cardlist_studied.length; i++){
        for (j=0; j<i; j++){
            if (session.cardlist_studied[i]._id == session.cardlist_studied[j]._id){
                dup.push(i)
                break;
            }
        }
    }
    dup.reverse()
    for (i=0; i<dup.length; i++){
        cardlist_studied.splice(dup[i],1)
    }
    session.cardlist_studied.reverse()

    for (status of ['yet', 'ing', 'hold', 'completed']){
        // cardlist_sepa에 status_in_session을 업데이트 하고        
        for (i=0; i<cardlist_sepa[status].length; i++){
            if (cardlist_sepa[status][i].detail_status.status_in_session === 'on'){
                // on인 녀석이 카드리스트 스터디드 어디에 있는지 찾아야 해요
                let position = session.cardlist_studied.findIndex(cardlist => cardlist._id == cardlist_sepa[status][i]._id)
                cardlist_sepa[status][i] = session.cardlist_studied[position]
            }
        }

        // on하고 off를 분리했다가 다시 붙히자. 이게 일종의 정렬 기능이 되어버려. off -> on 중에 학습한 거 -> on 중에 학습 안 한거
        let on_cards = cardlist_sepa[status].filter(card => card.detail_status.status_in_session === 'on')
        session.num_cards[status].selected = on_card.length
        let off_cards = cardlist_sepa[status].filter(card => card.detail_status.status_in_session === 'off')
        session.cardlist_sepa[status] = on_cards.concat(off_cards)
    }
    
// -------------------------------------- 스터딩 -----------------------------------------------------
    // 다시 하나로 묶어서 정리해주고 cardlist_studying으로 만들어준다.
    let cardlist_studying = []
    let cardlist_studying_yet = []
    let cardlist_studying_ing = []
    let cardlist_studying_hold = []
    let cardlist_studying_completed = []

    if (session.study_config.num_cards.on_off === 'on'){
        cardlist_studying_yet = cardlist_sepa.yet.slice(session.num_cards.yet.selected, session.study_config.num_cards.yet)
        cardlist_studying_ing = cardlist_sepa.ing.slice(session.num_cards.yet.selected, session.study_config.num_cards.ing)
        cardlist_studying_hold = cardlist_sepa.hold.slice(session.num_cards.yet.selected, session.study_config.num_cards.hold)
        cardlist_studying_completed = cardlist_sepa.completed.slice(session.num_cards.yet.selected, session.study_config.num_cards.completed)
    } else {
        cardlist_studying_yet = cardlist_sepa.yet.slice(session.num_cards.yet.selected, 1000000)
        cardlist_studying_ing = cardlist_sepa.ing.slice(session.num_cards.yet.selected, 1000000)
        cardlist_studying_hold = cardlist_sepa.hold.slice(session.num_cards.yet.selected, 1000000)
        cardlist_studying_completed = cardlist_sepa.completed.slice(session.num_cards.yet.selected, 1000000)
    }

    cardlist_studying = cardlist_studying.concat(cardlist_studying_yet, cardlist_studying_ing, cardlist_studying_hold, cardlist_studying_completed)
    

    // 사용한 카드가 몇 장인지 업데이트 해주자
    session.num_cards.yet.selected += cardlist_studying_yet.length
    session.num_cards.ing.selected += cardlist_studying_ing.length
    session.num_cards.hold.selected += cardlist_studying_hold.length
    session.num_cards.completed.selected += cardlist_studying_completed.length

    // seq_in_session로 정렬함 -> 그럼 원래 순서로 돌아옴
    cardlist_studying
        .sort((a,b) => a.seq_in_session - b.seq_in_session)
    
    session = await session.save()

    // 학습 설정도 받아주시고요
    let book_ids = []
    for (i=0; i<session.booksnindexes.length; i++){
        book_ids.push(session.booksnindexes[i].book_id)
    }
    let level_config = await Level_config.find({book_id : book_ids})
    
    console.log('1', cardlist_studying)
    res.json({isloggedIn : true, cardlist_studying, level_config, num_cards : session.num_cards});
}

// 학습 보류 및 완료를 학습중으로 돌립니다
exports.change_status_to_ing = async (req, res) => {
    console.log("학습 보류 및 완료를 학습중으로 돌립니다.~");
    console.log(req.body);

    let prev_status

    // 먼저 hold에서 삭제를 시도해보고
    let sepa_hold_change = await Session.updateOne(
        {_id : req.body.session_id},
        {$pull : {'cardlist_sepa.hold' : {_id : req.body.card_id }}}
    )
    
    // hold에서 삭제 됐으면, 기존 상태는 hold이고 아니면 completed에서 삭제 시도한다.
    if (sepa_hold_change.modifiedCount === 1){
        prev_status = 'hold'
    } else if (sepa_hold_change.modifiedCount === 0){
        let sepa_completed_change = await Session.updateOne(
            {_id : req.body.session_id},
            {$pull : {'cardlist_sepa.completed' : {_id : req.body.card.card_id }}}
        )
    }

    // completed에서 삭제 됐으면, 기존 상태는 completed이고 그냥 끝낸다.
    if (sepa_completed_change.modifiedCount === 1){
        prev_status = 'completed'
    } else {
        return
    }

    // ing에 추가, 카드 갯수 수정, total 수정
    if(prev_status = 'hold'){        
        let sepa_change = await Session.updateOne(
            {_id : req.body.session_id},
            {
                $push : {
                    'cardlist_sepa.ing' : {
                        $each : [req.body.card],
                        $position : session.num_cards.ing.selected
                    },
                },
                $inc : {
                    'num_cards.hold.total' : -1,
                    'num_cards.hold.selected' : -1,
                    'num_cards.ing.total' : 1,
                    'num_cards.ing.selected' : 1,
                }
            }
        )
        let total_change = await Session.updateOne(
            {_id : req.body.session_id, 'cardlist_total._id' : req.body.card._id},
            {'cardlist_total.$.status' : 'ing'}
        )
        
    } else if (prev_status = 'completed'){
        let sepa_change = await Session.updateOne(
            {_id : req.body.session_id},
            {
                $push : {
                    'cardlist_sepa.ing' : {
                        $each : [req.body.card],
                        $position : session.num_cards.ing.selected
                    },
                },
                $inc : {
                    'num_cards.completed.total' : -1, // 위랑 여기만 다름
                    'num_cards.completed.selected' : -1, // 위랑 여기만 다름
                    'num_cards.ing.total' : 1, 
                    'num_cards.ing.selected' : 1,
                }
            }
        )
        let total_change = await Session.updateOne(
            {_id : req.body.session_id, 'cardlist_total._id' : req.body.card._id},
            {'cardlist_total.$.status' : 'ing'}
        )
    }

    let session = await Session.findOne({_id : req.body.session_id})
        .select('num_cards')

    // 카드 갯수 정보를 다시 보냅니다.
    res.json({isloggedIn : true, num_cards : session.num_cards});

}


exports.get_studying_cards = async (req, res) => {
    console.log("카드 받으셔요~");
    console.log(req.body);

    // 컨텐츠를 받아오고
    let cards = await Card.find({_id : req.body.card_ids})
        .select ('parent_card_id external_card_id contents book_id')        
        .populate({path : 'parent_card_id',select : 'contents external_card_id', populate :{path : 'external_card_id',select : 'contents'}})
        .populate({path : 'external_card_id',select : 'contents'})
    
    // 날라온 카드 아이디 순서랑 맞춰주고
    for (i=0; i<req.body.card_ids.length; i++){
        if (cards[i]._id != req.body.card_ids[i]) {
            let position = cards.findIndex((card) => card._id == req.body.card_ids[i]);            
            [cards[i], cards[position]] = [cards[position], cards[i]]
        }
    }
    
    // 부모카드는 자식카드는 익스터널 컨텐츠는 안으로 넣어줌
    for (i=0; i<cards.length; i++) {
        if (cards[i].external_card_id != null) {
            cards[i].contents.face1 = cards[i].external_card_id.contents.face1,
            cards[i].contents.selection = cards[i].external_card_id.contents.selection,
            cards[i].contents.face2 = cards[i].external_card_id.contents.face2,
            cards[i].contents.annotation = cards[i].external_card_id.contents.annotation
            // 요롷게 null로 넣으면 null이 되려나... 안 되면 하나씩 지워야 함
            cards[i].external_card_id.contents = null
        }
        if (cards[i].parent_card_id != null) {
            if (cards[i].parent_card_id.external_card_id != null) {
                cards[i].parent_card_id.contents.face1 = cards[i].parent_card_id.external_card_id.contents.face1,
                cards[i].parent_card_id.contents.selection = cards[i].parent_card_id.external_card_id.contents.selection,
                cards[i].parent_card_id.contents.face2 = cards[i].parent_card_id.external_card_id.contents.face2,
                cards[i].parent_card_id.contents.annotation = cards[i].parent_card_id.external_card_id.contents.annotation
                // 요롷게 null로 넣으면 null이 되려나... 안 되면 하나씩 지워야 함
                cards[i].parent_card_id.external_card_id.contents = null
            }            
        }
    }

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

    // 1번 - 인덱스 아이디
    filters.index_id = req.body.index_id

    // 2번 - 카드 타입
    let target_cardtype = ['none', 'share']    
    // read, flip-normal, flip-select, none, share    
    if (session.study_config.card_on_off.read_card === 'on' ){
        target_cardtype = target_cardtype.concat(['read'])
    }
    if (session.study_config.card_on_off.flip_card === 'on' ){
        target_cardtype = target_cardtype.concat(['flip-normal', 'flip-select'])
    }
    filters.type = target_cardtype
    
    // 3번
    let target_status = []
    for (let card_status in ['yet', 'ing', 'hold', 'completed']) {
        if (session.study_config.status_on_off[card_status] === 'on'){
            target_status.push(card_status)
        }
    }
    filters.status = target_status
    
    // 4,5번    
    let target_needstudytime_from
    let target_needstudytime_to
    if(session.study_config.status_on_off.ing === 'on'){
        switch (session.study_config.collect_criteria){
            case 'all' :
                target_needstudytime_from = new Date('2000/1/1/00:00:00')
                target_needstudytime_to = new Date('2050/1/1/00:00:00')
                break
            case 'by_now' : 
                target_needstudytime_from = new Date('2000/1/1/00:00:00')
                target_needstudytime_to = Date.now()
                break
            case 'by_today' :
                let tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate()+1)
                tomorrow.setHours(0,0,0,0)                
                target_needstudytime_to = tomorrow.getTime()
                target_needstudytime_from = new Date('2000/1/1/00:00:00')
                break
            case 'custom' :
                // 필터 날짜 변환하는 거 확인 필요함
                target_needstudytime_from = session.study_config.needstudytime_filter.from
                target_needstudytime_to = session.study_config.needstudytime_filter.to
        }
        
        filters.$or= {$and : {'study_result.need_study_time' : {$gt : target_needstudytime_from,}, 'study_result.need_study_time' : {$lt : target_needstudytime_to}}, 'study_result.need_study_time' : null}        
    }

    // 리스트를 하나로 통합하고
    let cardlist_total = []

    let cards = await Card
        .find(filters)
        .select ('cardtype_id type seq_in_index position_of_content parent_exist_yeobu parent_card_id external_card_id contents')        
        .sort({seq_in_index : 1})
        .populate({path : 'parent_card_id',select : 'contents external_card_id', populate :{path : 'external_card_id',select : 'contents'}})
        .populate({path : 'external_card_id',select : 'contents'})
    
    // 하위카드가 없는 share카드의 삭제 --> 쉐어 카드 자체가 들어오지 않으므로 상관없을 듯
    // 포문으로 share 카드를 찾아서, 그 다음 카드의 parent와 동일하지 않다면 share를 삭제    
    let delete_list = []
    for (i=0; i<cards.length; i++){
        if (cards[i].type ==='share'){
            if (i === cards.length-1 || cards[i]._id != cards[i+1].parent_card_id ){
                delete_list.push(i)
            }
        }
    }    
    delete_list.reverse()
    for (i=0; i<delete_list.length; i++){
        cards.splice(delete_list[i], 1)
    }

    // 부모카드는 자식카드는 익스터널 컨텐츠는 안으로 넣어줌
    for (i=0; i<cards.length; i++) {
        if (cards[i].external_card_id != null) {
            cards[i].contents.face1 = cards[i].external_card_id.contents.face1,
            cards[i].contents.selection = cards[i].external_card_id.contents.selection,
            cards[i].contents.face2 = cards[i].external_card_id.contents.face2,
            cards[i].contents.annotation = cards[i].external_card_id.contents.annotation
            // 요롷게 null로 넣으면 null이 되려나... 안 되면 하나씩 지워야 함
            cards[i].external_card_id.contents = null
        }
    }
    
    res.json({isloggedIn : true, cards, });

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
    
    // // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    // let now = Date.now()        
    // for (i=0; i<cardlist_add.length; i++){        
    //     if (cardlist_add[i].detail_status.need_study_time === null || cardlist_studying[i].detail_status.need_study_time > now){
    //         cardlist_studying[i].detail_status.need_study_time = now
    //     }
    // }

    // seq_in_session로 정렬함 -> 그럼 원래 순서로 돌아옴
    cardlist_studying
        .sort((a,b) => a.seq_in_session - b.seq_in_session)

    res.json({isloggedIn : true, cardlist_studying, });

}







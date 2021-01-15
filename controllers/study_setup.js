const mongoose = require("mongoose");
const {ObjectId} = require('mongodb');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Session = require('../models/session');
const Level_config = require('../models/level_config');


// 스터디 콘피그를 보내줍니다.
exports.get_study_config = async (req, res) => {
    console.log("스터디 콘피그를 보내줍니다..");
    console.log('body', req.body);    
    
    // 책 갯수에 맞게 스터디 콘피그 받아오시고요
    let result
    if (req.body.selected_books.length >= 2){        
        result = await User.findOne({user_id : req.session.passport.user}, {study_config : 1, _id : 0})                        
    } else if (req.body.selected_books.length === 1) {
        result = await Book.findOne({_id : req.body.selected_books[0].book_id}, {study_config : 1, _id : 0})        
    }

    // 날짜를 변환해해서    
    for (let study_mode of ['read_mode', 'flip_mode', 'exam_mode']){        
        let today = new Date()
        today.setHours(0,0,0,0)
        result.study_config[study_mode].needstudytime_filter.low = today.setDate(today.getDate()+result.study_config[study_mode].needstudytime_filter.low_gap)

        today = new Date()
        today.setHours(0,0,0,0)
        result.study_config[study_mode].needstudytime_filter.high = today.setDate(today.getDate()+result.study_config[study_mode].needstudytime_filter.high_gap)
    }

    // 보내준다아아아아
    res.json({isloggedIn : true, study_config : result.study_config});    
}

// ********************************************************************************************************************************
// ********************************************************************************************************************************
// 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
exports.get_index = async (req, res) => {
    console.log('body', req.body);
    
    // 일단 인덱스를 받아오고
    let indexes = await Index
        .find({book_id : req.body.selected_books.book_id})
        .select('name level seq num_cards progress')
        .sort({seq : 1})

    // 인덱스의 시퀀스가 정상적인지 확인하고 정상적이지 않으면 수정해준다.
    // 뒤쪽에서 시퀀스 넘버로 어레이를 매니지 하니깐, 순서가 맞아야 한다.
    let index_seq_modi_need = 'no'
    for (i=0; i<indexes.length; i++){
        if (indexes[i].seq != i){
            let index_seq_modi_result = await Index.updateOne({_id : indexes[i]._id}, {seq : i})
        }        
    }
    console.log(indexes)

    // -------------------------카드갯수  --------------------------------------------

    // book_id를 그냥 넣으니깐 filter를 안 먹어요. objectid로 바꿔서 넣었어요.
    let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
    let filter = {book_id : converted_book_id, type : {$in : ['read', 'flip-normal', 'flip-select']}}

    indexes = await get_num_cards_of_index(indexes, filter)

    console.log('indexes', indexes)

// ----------------------------- 프로그레스 --------------------------------------------------------

    let project_for_progress = {
        index_id : 1,    
        type_group : {
            $switch : {
                branches : [
                    {
                        case : { $eq :['$type', 'read']},
                        then : 'read'
                    },
                    {
                        case : { $eq :['$type', 'flip-normal']},
                        then : 'flip'
                    },
                    {
                        case : { $eq :['$type', 'flip-select']},
                        then : 'flip'
                    },
                ]
            },
        },
        'detail_status.exp' : 1,        
    }

    let group_for_progress = {_id : {index_id : '$index_id', type : '$type_group'}, count : {$sum : 1}, progress: { $avg: "$detail_status.exp" }}

    let lookup = {
        from : 'indexes', //collection to join
        localField : '_id.index_id', //field from the input documents
        foreignField : '_id', //field from the documents of the "from" collection
        as : 'index_info' //output array field
    }
    
    let progress_of_index = await Card.aggregate([
        {$match : filter}, 
        {$project : project_for_progress},
        {$group : group_for_progress},
        {$lookup : lookup}
    ])
    progress_of_index.sort((a,b)=> a.index_info.seq - b.index_info.seq)

    // 프로그레스 정보를 추가하고
    for (i=0; i<progress_of_index.length; i++){       
        indexes[progress_of_index[i].index_info[0].seq]['num_cards'][progress_of_index[i]._id.type].progress = progress_of_index[i].progress    
    }

    // 인덱스에 total 값 정리한 후
    for (i=0; i<indexes.length; i++){
        indexes[i].num_cards.total.progress = (indexes[i].num_cards.read.progress*indexes[i].num_cards.read.total + indexes[i].num_cards.flip.progress*indexes[i].num_cards.flip.total) / (indexes[i].num_cards.read.total + indexes[i].num_cards.flip.total)
    }

    // 싱글북인포에 인덱스 정보를 넣어준다.
    let single_book_info = {
        book_id : req.body.selected_books.book_id,
        title : req.body.selected_books.title,
        index_info : indexes
    }

    // console.log(single_book_info)
    // console.log(single_book_info.index_info[0].num_cards)
     res.json({isloggedIn : true,  single_book_info});    
}

// ********************************************************************************************************************************
// ********************************************************************************************************************************
const get_num_cards_of_index = async (indexes, filter) => {    
    // 현재는 복습 필요시점이 시간으로 되어 있는데, 그룹핑을 해줘야 해요.
    let current_time = Date.now()
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate()+1)
    tomorrow.setHours(0,0,0,0)    
    tomorrow = tomorrow.getTime()
    
    let project = {
        index_id : 1,
        status : 1,
        // type : 1,
        type_group : {
            $switch : {
                branches : [
                    {
                        case : { $eq :['$type', 'read']},
                        then : 'read'
                    },
                    {
                        case : { $eq :['$type', 'flip-normal']},
                        then : 'flip'
                    },
                    {
                        case : { $eq :['$type', 'flip-select']},
                        then : 'flip'
                    },
                ]
            },
        },
        // need_study_time : 1,
        // need_study_time_by_milli : {$toDecimal : '$need_study_time'} ,
        book_id : 1,
        'detail_status.exp' : 1,
        // body_id_body : {$toObjectId : req.body.book_id},        
        need_study_time_group : {
            $switch : {
                branches : [
                    {
                        case : { $eq :['$detail_status.need_study_time', null]},
                        then : 'not_studying'
                    },                    {
                        case : { $lt :[{$toDecimal : '$detail_status.need_study_time'}, current_time]},
                        then : 'until_now'
                    },{
                        case : {$and : [{$gte : [{$toDecimal : '$detail_status.need_study_time'}, current_time]}, {$lt : [{$toDecimal : '$need_study_time'}, tomorrow]}]},
                        then : 'until_today'
                    },{
                        case : { $gt : [{$toDecimal : '$detail_status.need_study_time'}, tomorrow]},
                        then : 'after_tomorrow'
                    }
                ],
                default : 'not_studying'
            }
        }
    }

    // 조건에 맞는 카드 갯수를 구해야해요
    // index별, status별, 복습시점별
    let group = {_id : {index_id : '$index_id', type : '$type_group', status : '$status', need_study_time_group : '$need_study_time_group'}, count : {$sum : 1},}
    let lookup = {
        from : 'indexes', //collection to join
        localField : '_id.index_id', //field from the input documents
        foreignField : '_id', //field from the documents of the "from" collection
        as : 'index_info' //output array field
    }
    
    // aggregate를 실행해요        
    let num_cards_of_index = await Card.aggregate([
        {$match : filter}, 
        {$project : project},
        {$group : group},
        {$lookup : lookup}
    ])    
    num_cards_of_index.sort((a,b)=> a.index_info.seq - b.index_info.seq)
    // console.log('num_cards_of_index', num_cards_of_index)
    
    
    // 인덱스에 카드 갯수 정보를 추가하고
    for (i=0; i<num_cards_of_index.length; i++){        
        if (num_cards_of_index[i]._id.status ==='ing') {
            indexes[num_cards_of_index[i].index_info[0].seq].num_cards[num_cards_of_index[i]._id.type]['ing'][num_cards_of_index[i]._id.need_study_time_group] = num_cards_of_index[i].count
        } else {            
            indexes[num_cards_of_index[i].index_info[0].seq].num_cards[num_cards_of_index[i]._id.type][num_cards_of_index[i]._id.status] = num_cards_of_index[i].count
        }
    }
    // 인덱스에 total 값 정리한 후
    for (i=0; i<indexes.length; i++){
        indexes[i].num_cards.read.ing.total = indexes[i].num_cards.read.ing.not_studying + indexes[i].num_cards.read.ing.until_today + indexes[i].num_cards.read.ing.after_tomorrow        
        indexes[i].num_cards.read.total = indexes[i].num_cards.read.yet + indexes[i].num_cards.read.ing.total +indexes[i].num_cards.read.hold + indexes[i].num_cards.read.completed
        indexes[i].num_cards.flip.ing.total = indexes[i].num_cards.flip.ing.not_studying + indexes[i].num_cards.flip.ing.until_today + indexes[i].num_cards.read.ing.after_tomorrow
        indexes[i].num_cards.flip.total = indexes[i].num_cards.flip.yet + indexes[i].num_cards.flip.ing.total +indexes[i].num_cards.flip.hold + indexes[i].num_cards.flip.completed

        indexes[i].num_cards.total.yet = indexes[i].num_cards.read.yet + indexes[i].num_cards.flip.yet
        indexes[i].num_cards.total.ing.not_studying = indexes[i].num_cards.read.ing.not_studying + indexes[i].num_cards.flip.ing.not_studying
        indexes[i].num_cards.total.ing.until_now = indexes[i].num_cards.read.ing.until_now + indexes[i].num_cards.flip.ing.until_now
        indexes[i].num_cards.total.ing.until_today = indexes[i].num_cards.read.ing.until_today + indexes[i].num_cards.flip.ing.until_today
        indexes[i].num_cards.total.ing.after_tomorrow = indexes[i].num_cards.read.ing.after_tomorrow + indexes[i].num_cards.flip.ing.after_tomorrow
        indexes[i].num_cards.total.ing.total = indexes[i].num_cards.read.ing.total + indexes[i].num_cards.flip.ing.total
        indexes[i].num_cards.total.hold = indexes[i].num_cards.read.hold + indexes[i].num_cards.flip.hold
        indexes[i].num_cards.total.completed = indexes[i].num_cards.read.completed + indexes[i].num_cards.flip.completed
        indexes[i].num_cards.total.total = indexes[i].num_cards.read.total + indexes[i].num_cards.flip.total
    }

    return indexes
}

// **********************************************************************************
// **********************************************************************************
// 고급 필터를 적용합시다.
exports.apply_advanced_filter = async (req, res) => {
    console.log("고급 필터 좀 사용할게요~");
    console.log(req.body);

    let whole_filters = {}
    let and_filter = {}
    let or_filter = {}
    and_filter.$and = []
    or_filter.$or = []

    // 사용자 플래그
    if (advanced_filter.user_flag.on_off === 'on'){
        let user_flag_value = []
        for (let flag of ['none', 'flag1', 'flag2', 'flag3', 'flag4', 'flag5']) {
            if (req.body.advanced_filter.user_flag[flag] === 'on')
            user_flag_value.push(flag)
        }
        let user_flag_filter = {$in : user_flag_value}

        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.user_flag.group === 'on') {
                and_filter.$and.push(user_flag_filter)
            } else {
                or_filter.$or.push(user_flag_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or') {
            if (req.body.advanced_filter.user_flag.group === 'on') {
                or_filter.$or.push(user_flag_filter)
            } else {
                and_filter.$and.push(user_flag_filter)
            }
        }   
    }

    // 제작자 플래그
    if (advanced_filter.maker_flag.on_off === 'on'){
        let maker_flag_value = []
        for (let flag of ['none', 'flag1', 'flag2', 'flag3', 'flag4', 'flag5']) {
            if (req.body.advanced_filter.maker_flag[flag] === 'on')
            maker_flag_value.push(flag)
        }
        let maker_flag_filter = {$in : maker_flag_value}

        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.maker_flag.group === 'on') {
                and_filter.$and.push(maker_flag_filter)
            } else {
                or_filter.$or.push(maker_flag_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or') {
            if (req.body.advanced_filter.maker_flag.group === 'on') {
                or_filter.$or.push(maker_flag_filter)
            } else {
                and_filter.$and.push(maker_flag_filter)
            }
        }   
    }
    
    // 최근 학습 시점
    // String 변환 필요 여부, Number 변환 필요 여부
    if (req.body.advanced_filter.recent_study_time.on_off === 'on'){
        let low_split = req.body.advanced_filter.recent_study_time.low.split('-')
        let low = new Date(low_split[0], low_split[1]-1, low_split[2]).getTime()        
        
        let high_split = req.body.advanced_filter.recent_study_time.high.split('-')
        let high = new Date(high_split[0], high_split[1]-1, high_split[2]+1).getTime()
        
        let recent_study_time_filter = {$and : [{'study_result.need_study_time' : {$gt : low}}, {'study_result.need_study_time' : {$lt : high}}]}
    
        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.recent_study_time.group === 'on') {
                and_filter.$and.push(recent_study_time_filter)
            } else {
                or_filter.$or.push(recent_study_time_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or') {
            if (req.body.advanced_filter.recent_study_time.group === 'on') {
                or_filter.$or.push(recent_study_time_filter)
            } else {
                and_filter.$and.push(recent_study_time_filter)
            }
        }    
    }
    
    // 레벨
    if (req.body.advanced_filter.level.on_off === 'on'){
        let level_filter = {$and : [{'study_result.level' : {$gte : req.body.advanced_filter.level.low}}, {'study_result.level' : {$lte : req.body.advanced_filter.level.high}}]}
    
        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.level.group === 'on') {
                and_filter.$and.push(level_filter)
            } else {
                or_filter.$or.push(level_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or'){
            if (req.body.advanced_filter.level.group === 'on') {
                or_filter.$or.push(level_filter)
            } else {
                and_filter.$and.push(level_filter)
            }
        }    
    }
    
    // 스터디 타임즈
    if (req.body.advanced_filter.study_times.on_off === 'on'){
        let study_times_filter = {$and : [{'study_result.study_times' : {$gte : req.body.advanced_filter.study_times.low}}, {'study_result.study_times' : {$lte : req.body.advanced_filter.study_times.high}}]}
    
        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.level.group === 'on') {
                and_filter.$and.push(level_filter)
            } else {
                or_filter.$or.push(level_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or'){
            if (req.body.advanced_filter.level.group === 'on') {
                or_filter.$or.push(level_filter)
            } else {
                and_filter.$and.push(level_filter)
            }
        }    
    }

    // difficulty
    if (advanced_filter.difficulty.on_off === 'on'){
        let difficulty_value = []
        for (let diffi of ['none', 'diffi1', 'diffi2', 'diffi3', 'diffi4', 'diffi5']) {
            if (req.body.advanced_filter.difficulty[diffi] === 'on')
            difficulty_value.push(diffi)
        }
        let difficulty_filter = {$in : difficulty_value}

        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.difficulty.group === 'on') {
                and_filter.$and.push(difficulty_filter)
            } else {
                or_filter.$or.push(difficulty_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or') {
            if (req.body.advanced_filter.difficulty.group === 'on') {
                or_filter.$or.push(difficulty_filter)
            } else {
                and_filter.$and.push(difficulty_filter)
            }
        }   
    }

    // test_result
    if (advanced_filter.test_result.on_off === 'on'){
        let test_result_value = []
        for (let result of ['none', 'right', 'wrong']) {
            if (req.body.advanced_filter.test_result[result] === 'on')
            test_result_value.push(result)
        }
        let test_result_filter = {$in : test_result_value}

        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.test_result.group === 'on') {
                and_filter.$and.push(test_result_filter)
            } else {
                or_filter.$or.push(test_result_filter)
            }
        } else if (req.body.advanced_filter.mode === 'or') {
            if (req.body.advanced_filter.test_result.group === 'on') {
                or_filter.$or.push(test_result_filter)
            } else {
                and_filter.$and.push(test_result_filter)
            }
        }   
    }

    // writer
    if (advanced_filter.writer.on_off === 'on'){
        let writer_value = []
        for (let who of ['internal', 'external']) {
            if (req.body.advanced_filter.writer[who] === 'on')
            writer_value.push(who)
        }
        let writer_filter = {$in : writer_value}

        if (req.body.advanced_filter.mode === 'and'){
            if (req.body.advanced_filter.writer.group === 'on') {
                and_filter.$and.push(writer_filter)
            } else {
                or_filter.$or.push(writer_filter)
            }
        } else if (req.body.advanced_filter.writer.group === 'or') {
            if (req.body.advanced_filter.writer.group === 'on') {
                or_filter.$or.push(writer_filter)
            } else {
                and_filter.$and.push(writer_filter)
            }
        }   
    }

    // book_id를 그냥 넣으니깐 filter를 안 먹어요. objectid로 바꿔서 넣었어요.
    let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
    let whole_filter = {book_id : converted_book_id}

    // 하나로 통합헙시다.
    if (req.body.advanced_filter.mode === 'and'){
        and_filter.$and.push(or_filter)
        whole_filters = and_filter
        // book_id 넣는 것을 깜빡했네
        let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
        whole_filter.book_id = converted_book_id
    } else if (req.body.advanced_filter.mode === 'or'){
        or_filter.$and.push(and_filter)
        whole_filters = or_filter
        // book_id 넣는 것을 깜빡했네
        let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
        whole_filter.book_id = converted_book_id
    }
    
    
    console.log('and_filter',JSON.stringify(and_filter))
    console.log('or_filter',JSON.stringify(or_filter))
    console.log('whole_filters',JSON.stringify(whole_filters))

    indexes = get_num_cards_of_index(indexes, whole_filters)

    // 싱글북인포에 인덱스 정보를 넣어준다.
    let single_book_info = {
        book_id : req.body.selected_books.book_id,
        title : req.body.selected_books.title,
        index_info : indexes
    }

    // console.log(single_book_info)
    // console.log(single_book_info.index_info[0].num_cards)
     res.json({isloggedIn : true,  single_book_info});    

}


// 세션을 생성합니다.
exports.create_session= async (req, res) => {
    console.log("세션을 생성합니다..");
    console.log(req.body);

    // 복습 필요 시점 필터 날짜 변환
    let now = new Date().getTime()

    let low_split = req.body.advanced_filter.recent_study_time.low.split('-')
    let low_milli = new Date(low_split[0], low_split[1]-1, low_split[2]).getTime()
    let low_gap_day = Math.floor((low_milli-now)/1000/60/24) -1

    let high_split = req.body.advanced_filter.recent_study_time.high.split('-')
    let high_milli = new Date(high_split[0], high_split[1]-1, high_split[2]).getTime()
    let high_gap_day = Math.floor((high_milli-now)/1000/60/24) -1
    
    req.body.study_config.needstudytime_filter.low_gap_day = low_gap_day
    req.body.study_config.needstudytime_filter.high_gap_day = high_gap_day

    // 세션을 생성하고
    let session = await Session.create({
        user_id : req.session.passport.user,
        booksnindexes :  req.body.booksnindexes,        
        study_mode : req.body.study_mode,
        study_config : req.body.study_config,
        advanced_filter_on_off : req.body.advanced_filter_on_off,
        advanced_filter : req.body.advanced_filter,
    })

    // 저장도 하고
    if(req.body.booksnindexes.length ===1){       
        let config_modi_result = await Book.updateOne(
            {_id : session.booksnindexes[0].book_id}, {['study_config.'+session.study_mode+'_mode'] : req.body.study_config, advanced_filter : req.body.advanced_filter})
    } else if(session.booksnindexes.length >= 2){
        let config_modi_result = await User.updateOne(
            {user_id : req.session.passport.user}, {['study_config.'+session.study_mode+'_mode'] : req.body.study_config, advanced_filter : req.body.advanced_filter})        
    };

    res.json({msg : 'Sucess!!!!!!!!!!!!!', session_id : session._id})
}


// 해당 목차의 카드 리스트를 전달합니다.
exports.get_cardlist = async (req, res) => {
    console.log("공부를 시작합시다.");
    console.log(req.body);
    
    let session = await Session.findOne({_id : req.body.session_id})    
    
    // read에 standard이면 그냥 통과시켜야 함
    if (session.study_config.study_mode === 'read' && session.study_config.sort_option ==='standard'){
        start_standard_read_mode(session)
        return
    }

    // -------------------------------------- 필터 세팅 -----------------------------------------------------
    let filters = {}

    // 1번
    // filters.index_id = session.booksnindexes.index_ids

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
    filters.type = cardtype_filter
    
    // 3번
    let cardstatus_filter = []
    for (let card_status of ['yet', 'ing', 'hold', 'completed']) {        
        if (session.study_config.status_on_off[card_status] === 'on'){
            cardstatus_filter.push(card_status)
        }
    }
    filters.status = cardstatus_filter
    
    // 4,5번
    let needstudytime_high
    let needstudytime_low
    if(session.study_config.status_on_off.ing === 'on'){
        switch (session.study_config.collect_criteria){
            case 'all' :
                needstudytime_low = new Date('2000/1/1/00:00:00')
                needstudytime_high = new Date('2050/1/1/00:00:00')
                break
            case 'by_now' : 
                needstudytime_low = new Date('2000/1/1/00:00:00')
                needstudytime_high = Date.now()
                break
            case 'by_today' :
                let tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate()+1)
                tomorrow.setHours(0,0,0,0)
                console.log(tomorrow.getTime())         
                needstudytime_high = tomorrow.getTime()
                needstudytime_low = new Date('2000/1/1/00:00:00')
                break
            case 'custom' :
                // 필터 날짜 변환하는 거 확인 필요함
                needstudytime_low = session.study_config.needstudytime_filter.low
                needstudytime_high = session.study_config.needstudytime_filter.high
        }
        
        filters.$or= [{$and : [{'study_result.need_study_time' : {$gt : needstudytime_low,}}, {'study_result.need_study_time' : {$lt : needstudytime_high}}]}, {'study_result.need_study_time' : null}]
    }

    // -------------------------------------- 토 탈 -----------------------------------------------------
    
    // 리스트를 하나로 통합하고
    let cardlist_total = []

    // 책 단위로 카드를 받아서 통합하자
    for (i=0; i<session.booksnindexes.length; i++){
        filters.index_id = session.booksnindexes[i].index_ids
        // console.log('filters', filters)
        // let index_ids = session.booksnindexes[i].index_ids.map((index_array) => index_array.index_id)
        cardlist_of_singlebook = await Card
            // .find({index_id : index_ids, cardtype_name : cardtype_filter, status : cardstatus_filter, 'study_result.need_study_time' : {$gt : needstudytime_low_filter}, 'study_result.need_study_time' : {$gt : needstudytime_high_filter} })
            .find(filters)
            .select('cardtype_name book_id index_id status seq_in_index detail_status')                
            .sort({seq_in_index : 1})
            .populate({path : 'index_id',select : 'seq'})
        // for (j=0; j<cardlist_of_singlebook.length; j++){
        //     cardlist_of_singlebook.book_order = i
        // }
        cardlist_of_singlebook.sort((a,b) => a.index_id.seq - b.index_id.seq)        
        cardlist_total = cardlist_total.concat(cardlist_of_singlebook)                
    }
            
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
            // 쏼라
            for (let i = cardlist_total.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); // 무작위 인덱스(0 이상 i 미만)  
                [cardlist_total[i], cardlist_total[j]] = [cardlist_total[j], cardlist_total[i]];
              }
            break
    }

    // 토탈 카드리스트에 시퀀스 정보를 생성합니다.
    for (i=0; i<cardlist_total.length; i++) {        
        cardlist_total[i].seq_in_total_list = i        
    }

    for (i=0; i<cardlist_total.length; i++){
        delete cardlist_total[i].seq_in_index        
        delete cardlist_total[i].index_id
    }
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
    session.num_used_cards = {
        yet : cardlist_sepa.yet.length,
        ing : cardlist_sepa.ing.length,
        hold : cardlist_sepa.hold.length,
        completed : cardlist_sepa.completed.length,
    }

    // 복습 필요 시점이 지금보다 나중이면, 현재로 바꿔주자.
    // 안 그러면 난이도 평가 후에 복습 순서가 꼬여버림
    let now = Date.now()        
    for (i=0; i<cardlist_studying.length; i++){        
        if (cardlist_studying[i].detail_status.need_study_time === null || cardlist_studying[i].detail_status.need_study_time > now){
            cardlist_studying[i].detail_status.need_study_time = now
        }
    }

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
    console.log(level_config)


    // console.log('cardlist_studying', cardlist_studying)
    res.json({isloggedIn : true, cardlist_studying, level_config});
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
        cardtype_filter = cardtype_filter.concat(['share, read'])
    }
    if (session.study_config.card_on_off.flip_card === 'on' ){
        cardtype_filter = cardtype_filter.concat(['share, flip-normal', 'flip-select'])
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
                console.log(tomorrow.getTime())         
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
        let index_ids = session.booksnindexes[i].indexes.map((index_array) => index_array.index_id)
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
    
    // 하위카드가 없는 share카드의 삭제
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


exports.get_studying_cards = async (req, res) => {
    console.log("카드 받으셔요~");
    console.log(req.body);

    // 컨텐츠를 받아오고
    let cards = await Card.find({_id : req.body.card_ids})
        .select ('parent_card_id external_card_id seq_in_index contents')        
        .populate({path : 'parent_card_id',select : 'contents'})
        .populate({path : 'external_card_id',select : 'contents'})
    
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
    

    // 다시 소팅함



}


exports.get_level_config = async (req, res) => {
    console.log("레벨 설정을 보내드립니다.");
    console.log(req.body);

    let level_config = await Level_config.findOne({book_id : req.body.book_id})

    res.json({isloggedIn : true, level_config})  
}


exports.set_level_config = async (req, res) => {
    console.log("학습 설정을 바꾸셨군요.");
    console.log(req.body);

    let level_config = await level_config.findOne({book_id : req.body.book_id})

    level_config.difficulty_setting = req.body.difficulty_setting
    level_config.exp_setting = req.body.exp_setting
    level_config.lev_setting = req.body.lev_setting

    level_config = await level_config.save()

    res.json({isloggedIn : true, msg : "수정 완료"})  
}

// exports.get_all_level_configs = async (req, res) => {
//     console.log("학습 설정을 다 보내드립죠.");
//     console.log(req.body);

//     let selected_bookNindex_list = await Selected_bookNindex
//         .find({session_id : req.body.session_id})
//         .sort({seq : 1})

//     let book_ids = []
//     for (i=0; i<selected_bookNindex_list.length; i++){
//         book_ids.push(selected_bookNindex_list[i].book_id)
//     }

//     let level_configs = await level_config.find({book_id : book_ids})

//     res.json({isloggedIn : true, level_configs})  
// }




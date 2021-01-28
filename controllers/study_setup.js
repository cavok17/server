const mongoose = require("mongoose");
const {ObjectId} = require('mongodb');

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Session = require('../models/session');
const Level_config = require('../models/level_config');


exports.get_level_config = async (req, res) => {
    console.log("레벨 설정을 보내드립니다.");
    console.log(req.body);

    let level_config = await Level_config.findOne({book_id : req.body.book_id})

    res.json({isloggedIn : true, level_config})  
}

exports.set_level_config = async (req, res) => {
    console.log("학습 설정을 바꾸셨군요.");
    console.log(req.body);

    let level_config = await Level_config.findOne({book_id : req.body.book_id})

    level_config.difficulty_setting = req.body.difficulty_setting
    level_config.exp_setting = req.body.exp_setting
    level_config.lev_setting = req.body.lev_setting

    level_config = await level_config.save()

    res.json({isloggedIn : true, msg : "수정 완료"})  
}



// 스터디 콘피그를 보내줍니다.
exports.get_study_config = async (req, res) => {
    console.log("스터디 콘피그를 보내줍니다..");
    console.log('body', req.body);    
    
    // 책 갯수에 맞게 스터디 콘피그 받아오시고요
    let result
    if (req.body.selected_books.length >= 2){        
        result = await User.findOne({user_id : req.session.passport.user}, {study_config : 1, advanced_filter : 1, _id : 0})                        
    } else if (req.body.selected_books.length === 1) {
        result = await Book.findOne({_id : req.body.selected_books[0].book_id}, {study_config : 1, advanced_filter : 1, _id : 0})        
    }

    // console.log(result.study_config.read_mode)
    // 날짜를 변환해해서    
    for (let study_mode of ['read_mode', 'flip_mode', 'exam_mode']){        
        if (result.study_config[study_mode].needstudytime_filter.low_gap_date != null){
            let today1 = new Date()
            result.study_config[study_mode].needstudytime_filter.low = new Date(today1.setDate(today1.getDate()+result.study_config[study_mode].needstudytime_filter.low_gap_date))
        }
        if (result.study_config[study_mode].needstudytime_filter.high_gap_date != null){
            let today2 = new Date()
            result.study_config[study_mode].needstudytime_filter.high = new Date(today2.setDate(today2.getDate()+result.study_config[study_mode].needstudytime_filter.high_gap_date))
        }
    }

    for (i=0; i<2; i++){
        let today3 = new Date()
        result.advanced_filter.recent_study_time_value[i] = new Date(today3.setDate(today3.getDate()+result.advanced_filter.recent_study_time_gap[i]))
    }
    
    // console.log(result.advanced_filter)
    
    res.json({isloggedIn : true, study_config : result.study_config, advanced_filter : result.advanced_filter});    
}

// ********************************************************************************************************************************
// ********************************************************************************************************************************
// 선택된 인덱스를 저장하고, 카드 수량을 전달합니다.
exports.get_index = async (req, res) => {
    console.log('body', req.body);
    
    // 일단 인덱스를 받아오고
    let indexes = await Index
        .find({book_id : req.body.selected_books.book_id})
        .select('name level seq num_cards')
        .sort({seq : 1})
    
    // for (i=0; i<indexes.length; i++){
    //     console.log(indexes[i].num_cards)
    // }

    // 인덱스의 시퀀스가 정상적인지 확인하고 정상적이지 않으면 수정해준다.
    // 뒤쪽에서 시퀀스 넘버로 어레이를 매니지 하니깐, 순서가 맞아야 한다.
    let index_seq_modi_need = 'no'
    for (i=0; i<indexes.length; i++){
        if (indexes[i].seq != i){
            let index_seq_modi_result = await Index.updateOne({_id : indexes[i]._id}, {seq : i})
        }        
    }
    // console.log(indexes)

    // -------------------------카드갯수 계산 --------------------------------------------

    // book_id를 그냥 넣으니깐 filter를 안 먹어요. objectid로 바꿔서 넣었어요.
    let converted_book_id = mongoose.Types.ObjectId(req.body.selected_books.book_id)
    let filter = {book_id : converted_book_id, type : {$in : ['read', 'flip-normal', 'flip-select']}}

    indexes = await get_num_cards_of_index(indexes, filter)

    // console.log('indexes', indexes)

// ----------------------------- 프로그레스 --------------------------------------------------------    
    filter = {book_id : converted_book_id, type : {$in : ['read', 'flip-normal', 'flip-select']}}
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
        'detail_status.exp_stacked' : 1,        
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
    // for (i=0; i<progress_of_index.length; i++){
    //     console.log('progress_of_index', progress_of_index[i])
    // }

    // 카드 타입별 프로그레스 정보를 추가하고
    for (i=0; i<progress_of_index.length; i++){       
        indexes[progress_of_index[i].index_info[0].seq]['num_cards'][progress_of_index[i]._id.type].progress = progress_of_index[i].progress    
    }

    // 토탈 프로그레스 정보도 추가하고
    for (i=0; i<indexes.length; i++){
        indexes[i].num_cards.total.progress = (indexes[i].num_cards.read.progress*indexes[i].num_cards.read.total + indexes[i].num_cards.flip.progress*indexes[i].num_cards.flip.total) / (indexes[i].num_cards.read.total + indexes[i].num_cards.flip.total)
    }

// ----------------------------- 정리하자 --------------------------------------------------------

    // 싱글북인포에 인덱스 정보를 넣어준다.
    let single_book_info = {
        book_id : req.body.selected_books.book_id,
        title : req.body.selected_books.title,
        index_info : indexes
    }

    // console.log('single_book_info',single_book_info)
    // console.log(single_book_info.index_info[1].num_cards)
    res.json({isloggedIn : true,  single_book_info});    
}

// ********************************************************************************************************************************
// ********************************************************************************************************************************
const get_num_cards_of_index = async (indexes, filter) => {    
    // 현재는 복습 필요시점이 시간으로 되어 있는데, 그룹핑을 해줘야 해요.
    // let current_time = Date.now()
    let current_time = new Date()
    console.log('current_time', current_time)
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate()+1)
    tomorrow.setHours(0,0,0,0)
    console.log('tomorrow', tomorrow)
    
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
                        case : { $lt :['$detail_status.need_study_time', current_time]},
                        then : 'until_now'
                    },{
                        case : {$and : [{$gte : ['$detail_status.need_study_time', current_time]}, {$lte : ['$detail_status.need_study_time', tomorrow]}]},
                        // case : { $lt :[{$toDecimal : '$detail_status.need_study_time'}, tomorrow]},
                        then : 'until_today'
                    },{
                        case : { $gt : ['$detail_status.need_study_time', tomorrow]},
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
    console.log('num_cards_of_index', num_cards_of_index)
    
    
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
        // read 카드 토탈값들을 정리하고
        indexes[i].num_cards.read.ing.total = indexes[i].num_cards.read.ing.not_studying + indexes[i].num_cards.read.ing.until_now + indexes[i].num_cards.read.ing.until_today + indexes[i].num_cards.read.ing.after_tomorrow        
        indexes[i].num_cards.read.total = indexes[i].num_cards.read.yet + indexes[i].num_cards.read.ing.total +indexes[i].num_cards.read.hold + indexes[i].num_cards.read.completed
        // flip 카드 토탈값들을 정리하고
        indexes[i].num_cards.flip.ing.total = indexes[i].num_cards.flip.ing.not_studying + indexes[i].num_cards.flip.ing.until_now + indexes[i].num_cards.flip.ing.until_today + indexes[i].num_cards.flip.ing.after_tomorrow
        indexes[i].num_cards.flip.total = indexes[i].num_cards.flip.yet + indexes[i].num_cards.flip.ing.total +indexes[i].num_cards.flip.hold + indexes[i].num_cards.flip.completed
        // read와 flip을 합한 값들을 정리하고
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
    
    // let user_flag_filter
    // if (req.body.advanced_filter.user_flag_on_off === 'on'){        
    //     user_flag_filter = {$in : req.body.advanced_filter.user_flag_value}
    // }
    // let maker_flag_filter
    // if (req.body.advanced_filter.maker_flag_on_off === 'on'){        
    //     maker_flag_filter = {$in : req.body.advanced_filter.user_flag_value}
    // }
    // let difficulty_filter
    // if (req.body.advanced_filter.difficulty_on_off === 'on'){        
    //     difficulty_filter = {$in : req.body.advanced_filter.difficulty_value}
    // }
    // let test_result_filter
    // if (req.body.advanced_filter.test_result_on_off === 'on'){        
    //     test_result_filter = {$in : req.body.advanced_filter.test_result_value}
    // }
    // let writer_filter
    // if (req.body.advanced_filter.writer_on_off === 'on'){        
    //     writer_filter = {$in : req.body.advanced_filter.writer_value}
    // }

    // 사용자 플래그
    let user_flag_filter
    let maker_flag_filter
    let difficulty_filter
    let test_result_filter
    let writer_filter
    for (filter_name of ['user_flag','maker_flag','difficulty','test_result','writer']){
        if (req.body.advanced_filter[filter_name+'_on_off'] === 'on'){        
            eval(filter_name+'filter') = {$in : req.body.advanced_filter[filter_name+'_value']}
        }
    }
    let recent_study_time_filter
    if (req.body.advanced_filter.recent_study_time_on_off === 'on'){        
        let from = new Date(req.body.advanced_filter.recent_study_time_value[0])
        let to = new Date(req.body.advanced_filter.recent_study_time_value[1])
        to.setDate(to.getDate()+1)
        recent_study_time_filter = {$and : [{'detail_status.need_study_time' : {$gte : from}}, {'detail_status.need_study_time' : {$lte : to}}]}
    }
    let level_filter
    if (req.body.advanced_filter.level_on_off === 'on'){        
        let from = req.body.advanced_filter.level_value[0]
        let to = req.body.advanced_filter.level_value[1]
        level_filter = {$and : [{'detail_status.level' : {$gte : from}}, {'detail_status.level' : {$lte : to}}]}
    }
    let study_times_filter
    if (req.body.advanced_filter.study_times_on_off === 'on'){        
        let from = req.body.advanced_filter.study_times_value[0]
        let to = req.body.advanced_filter.study_times_value[1]
        study_times_filter = {$and : [{'detail_status.study_times' : {$gte : from}}, {'detail_status.study_times' : {$lte : to}}]}
    }
    

    for (comp of ['user_flag','maker_flag']){
        if (advanced_filter[comp+'_on_off'] === 'on'){ //일단 해당 필터가 on이면
            if (req.body.advanced_filter.mode === 'and'){
                if (req.body.advanced_filter[comp+'_group'] === 'on') {
                    and_filter.$and.push(...eval(comp+'_filter'))
                } else {
                    or_filter.$or.push(...eval(comp+'_filter'))
                }
            } else if (req.body.advanced_filter.mode === 'or'){
                if (req.body.advanced_filter[comp+'_group'] === 'on') {
                    or_filter.$or.push(...eval(comp+'_filter'))
                } else {
                    and_filter.$and.push(...eval(comp+'_filter'))
                }
            }
        }
    }

    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.user_flag_group === 'on') {
    //             and_filter.$and.push(user_flag_filter)
    //         } else {
    //             or_filter.$or.push(user_flag_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or') {
    //         if (req.body.advanced_filter.user_flag_group === 'on') {
    //             or_filter.$or.push(user_flag_filter)
    //         } else {
    //             and_filter.$and.push(user_flag_filter)
    //         }
    //     }   
    // }

    // // 제작자 플래그
    // if (advanced_filter.maker_flag.on_off === 'on'){
    //     let maker_flag_value = []
    //     for (let flag of ['none', 'flag1', 'flag2', 'flag3', 'flag4', 'flag5']) {
    //         if (req.body.advanced_filter.maker_flag[flag] === 'on')
    //         maker_flag_value.push(flag)
    //     }
    //     let maker_flag_filter = {$in : maker_flag_value}

    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.maker_flag.group === 'on') {
    //             and_filter.$and.push(maker_flag_filter)
    //         } else {
    //             or_filter.$or.push(maker_flag_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or') {
    //         if (req.body.advanced_filter.maker_flag.group === 'on') {
    //             or_filter.$or.push(maker_flag_filter)
    //         } else {
    //             and_filter.$and.push(maker_flag_filter)
    //         }
    //     }   
    // }
    
    // 최근 학습 시점
    // String 변환 필요 여부, Number 변환 필요 여부
    // if (req.body.advanced_filter.recent_study_time.on_off === 'on'){
    //     let low_split = req.body.advanced_filter.recent_study_time.low.split('-')
    //     let low = new Date(low_split[0], low_split[1]-1, low_split[2]).getTime()        
        
    //     let high_split = req.body.advanced_filter.recent_study_time.high.split('-')
    //     let high = new Date(high_split[0], high_split[1]-1, high_split[2]+1).getTime()
        
    //     let recent_study_time_filter = {$and : [{'study_result.need_study_time' : {$gt : low}}, {'study_result.need_study_time' : {$lt : high}}]}
    
    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.recent_study_time.group === 'on') {
    //             and_filter.$and.push(recent_study_time_filter)
    //         } else {
    //             or_filter.$or.push(recent_study_time_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or') {
    //         if (req.body.advanced_filter.recent_study_time.group === 'on') {
    //             or_filter.$or.push(recent_study_time_filter)
    //         } else {
    //             and_filter.$and.push(recent_study_time_filter)
    //         }
    //     }    
    // }
    
    // // 레벨
    // if (req.body.advanced_filter.level.on_off === 'on'){
    //     let level_filter = {$and : [{'study_result.level' : {$gte : req.body.advanced_filter.level.low}}, {'study_result.level' : {$lte : req.body.advanced_filter.level.high}}]}
    
    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.level.group === 'on') {
    //             and_filter.$and.push(level_filter)
    //         } else {
    //             or_filter.$or.push(level_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or'){
    //         if (req.body.advanced_filter.level.group === 'on') {
    //             or_filter.$or.push(level_filter)
    //         } else {
    //             and_filter.$and.push(level_filter)
    //         }
    //     }    
    // }
    
    // // 스터디 타임즈
    // if (req.body.advanced_filter.study_times.on_off === 'on'){
    //     let study_times_filter = {$and : [{'study_result.study_times' : {$gte : req.body.advanced_filter.study_times.low}}, {'study_result.study_times' : {$lte : req.body.advanced_filter.study_times.high}}]}
    
    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.level.group === 'on') {
    //             and_filter.$and.push(level_filter)
    //         } else {
    //             or_filter.$or.push(level_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or'){
    //         if (req.body.advanced_filter.level.group === 'on') {
    //             or_filter.$or.push(level_filter)
    //         } else {
    //             and_filter.$and.push(level_filter)
    //         }
    //     }    
    // }

    // // difficulty
    // if (advanced_filter.difficulty.on_off === 'on'){
    //     let difficulty_value = []
    //     for (let diffi of ['none', 'diffi1', 'diffi2', 'diffi3', 'diffi4', 'diffi5']) {
    //         if (req.body.advanced_filter.difficulty[diffi] === 'on')
    //         difficulty_value.push(diffi)
    //     }
    //     let difficulty_filter = {$in : difficulty_value}

    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.difficulty.group === 'on') {
    //             and_filter.$and.push(difficulty_filter)
    //         } else {
    //             or_filter.$or.push(difficulty_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or') {
    //         if (req.body.advanced_filter.difficulty.group === 'on') {
    //             or_filter.$or.push(difficulty_filter)
    //         } else {
    //             and_filter.$and.push(difficulty_filter)
    //         }
    //     }   
    // }

    // // test_result
    // if (advanced_filter.test_result.on_off === 'on'){
    //     let test_result_value = []
    //     for (let result of ['none', 'right', 'wrong']) {
    //         if (req.body.advanced_filter.test_result[result] === 'on')
    //         test_result_value.push(result)
    //     }
    //     let test_result_filter = {$in : test_result_value}

    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.test_result.group === 'on') {
    //             and_filter.$and.push(test_result_filter)
    //         } else {
    //             or_filter.$or.push(test_result_filter)
    //         }
    //     } else if (req.body.advanced_filter.mode === 'or') {
    //         if (req.body.advanced_filter.test_result.group === 'on') {
    //             or_filter.$or.push(test_result_filter)
    //         } else {
    //             and_filter.$and.push(test_result_filter)
    //         }
    //     }   
    // }

    // // writer
    // if (advanced_filter.writer.on_off === 'on'){
    //     let writer_value = []
    //     for (let who of ['internal', 'external']) {
    //         if (req.body.advanced_filter.writer[who] === 'on')
    //         writer_value.push(who)
    //     }
    //     let writer_filter = {$in : writer_value}

    //     if (req.body.advanced_filter.mode === 'and'){
    //         if (req.body.advanced_filter.writer.group === 'on') {
    //             and_filter.$and.push(writer_filter)
    //         } else {
    //             or_filter.$or.push(writer_filter)
    //         }
    //     } else if (req.body.advanced_filter.writer.group === 'or') {
    //         if (req.body.advanced_filter.writer.group === 'on') {
    //             or_filter.$or.push(writer_filter)
    //         } else {
    //             and_filter.$and.push(writer_filter)
    //         }
    //     }   
    // }

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

// **********************************************************************************
// **********************************************************************************
// 세션을 생성합니다.
exports.create_session= async (req, res) => {
    console.log("세션을 생성합니다..");
    // console.log('create_session_body', req.body);

    // from은 그 날짜를 그대로 쓰는데, to는 하루를 더해줘야 함
    req.body.study_config.needstudytime_filter.low = new Date(req.body.study_config.needstudytime_filter.low)
    req.body.study_config.needstudytime_filter.low.setHours(0,0,0,0)
    req.body.study_config.needstudytime_filter.low_gap_date = Math.ceil((req.body.study_config.needstudytime_filter.low.getTime()-Date.now())/86400000)
    req.body.study_config.needstudytime_filter.high = new Date(req.body.study_config.needstudytime_filter.high)
    req.body.study_config.needstudytime_filter.high.setDate(req.body.study_config.needstudytime_filter.high.getDate()+1)
    req.body.study_config.needstudytime_filter.high.setHours(0,0,0,0)
    req.body.study_config.needstudytime_filter.high_gap_date = Math.floor((req.body.study_config.needstudytime_filter.high.getTime()-Date.now())/86400000)
    
    req.body.advanced_filter.recent_study_time_value[0]= new Date(req.body.advanced_filter.recent_study_time_value[0])
    req.body.advanced_filter.recent_study_time_value[0].setHours(0,0,0,0)
    req.body.advanced_filter.recent_study_time_gap[0] = Math.ceil((req.body.advanced_filter.recent_study_time_value[0].getTime()-Date.now())/86400000)
    req.body.advanced_filter.recent_study_time_value[1]= new Date(req.body.advanced_filter.recent_study_time_value[1])
    req.body.advanced_filter.recent_study_time_value[1].setDate(req.body.advanced_filter.recent_study_time_value[1].getDate()+1) 
    req.body.advanced_filter.recent_study_time_value[1].setHours(0,0,0,0)
    req.body.advanced_filter.recent_study_time_gap[1] = Math.floor((req.body.advanced_filter.recent_study_time_value[1].getTime()-Date.now())/86400000)
    
    // 세션을 생성하고
    let session = await Session.create({
        user_id : req.session.passport.user,
        booksnindexes :  req.body.booksnindexes,        
        study_mode : req.body.study_mode,
        study_config : req.body.study_config,
        advanced_filter_on_off : req.body.advanced_filter_on_off,
        advanced_filter_save : req.body.advanced_filter_save,
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



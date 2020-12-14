const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Session = require('../models/session');
const Mentoring_req = require('../models/mentoring_req');

// 멘토링 관련 정보를 보여줍니다.
exports.get_mentoringlist = async (req, res) => {  
    console.log("멘토링 관련 리스트를 보내드릴게요.");
    console.log(req.body);

    let user = await User.findOne({user_id : req.session.passport.user})
        .select('mentors mentees')    
    // 멘토스에서 책 이름만 쫌 빼올까?
    
    let my_study_result = await get_my_study_result(req, res, user)
    let mentee_study_result = await get_mentee_study_result(req, res, user)
    
    res.json({isloggedIn : true, my_study_result, mentee_study_result });
}

// 멘토링 요청 화면을 띄웁니다.
exports.enter_mentoring_req = async (req, res) => {
    console.log("멘토링 요청 화면을 띄웁니다.");
    console.log(req.body);

    // 현재 요청중인 멘토링 요청 건을 가져오고요.
    let mentoring_req = await Mentoring_req.find({mentee_id : req.session.passport.user})
    
    // 전체 책 정보를 가져옵니다.
    let category = await Category.find({user_id : req.session.passport.user})        
        .sort({seq : 1})
        .select('book_ids name seq')
        .populate({path : 'book_ids', select : 'title'})
    // console.log('category', category)

    // let book = await Book.find({owner : req.session.passport.user, hide_or_show : {$ne : false}})
    //     .select('category_id seq_in_category title ')
    //     .sort({seq_in_category : 1})
    // let booklist = []
    // for (i=0; i<category.length; i++){
    //     let one_category = {
    //         category_id : category[i]._id,
    //         category_name : category[i].title,
    //         books : book.filter((book) => book.category_id === category[i]._id)
    //     }
    //     booklist.push(one_category)
    // }

    // let book = await Book.find({owner : req.session.passport.user, hide_or_show : {$ne : false}})
    //     .select('category_id seq_in_category title ')
    //     .populate({path : 'category_id', select : 'seq name'})
    //     .sort({seq_in_category : 1})
    
    // book.sort((a,b) => a.category_id.seq - b.category_id.seq)
    
    res.json({isloggedIn : true,  mentoring_req, category, });
}

// 멘토의 개인 정보를 보여줍니다.
exports.get_user_info = async (req, res) => {
    console.log("// 멘토의 개인 정보를 보여줍니다.");
    console.log(req.body);

    let user = await User.findOne(
        {user_id : req.body.user_id},
        {user_id : 1, name : 1, nickname : 1, from : 1})
    
    res.json({isloggedIn : true, user, });
}

// 멘토링을 요청합니다.
exports.request_mentoring = async (req, res) => {
    console.log("멘토링을 요청합니다..");
    console.log(req.body);

    let mentoring_req_create = await Mentoring_req.create({
        book_id : req.body.book_id,
        title : req.body.title,
        mentee_id : req.session.passport.user,
        mentor_id : req.body.mentor_id,
        msg : req.body.msg
    })

    let mentoring_req = await Mentoring_req.find({mentee_id : req.session.passport.user})        
    let category = await Category.find({user_id : req.session.passport.user})        
        .sort({seq : 1})
        .select('book_ids name seq')
        .populate({path : 'book_ids', select : 'title'})
    
    res.json({isloggedIn : true, category, mentoring_req });
}


// 멘토링 요청을 취소합니다.
exports.cancel_mentoring_req = async (req, res) => {
    console.log("멘토링 요청을 취소합니다.");
    console.log(req.body);
    
    let mentoring_req_cancel = await Mentoring_req.deleteOne({_id : req.body.mentoring_req_id})
    
    let mentoring_req = await Mentoring_req.find({user_id : req.session.passport.user})        
    let category = await Category.find({user_id : req.session.passport.user})        
    .sort({seq : 1})
        .select('book_ids name seq')
        .populate({path : 'book_ids', select : 'title'})
        
        res.json({isloggedIn : true, category, mentoring_req });
    }

// 멘토링 수락/거절 화면으로 들어갑니다.
exports.enter_mentoring_req_management = async (req, res) => {
    console.log("멘토링 수락/거절 화면으로 들어갑니다.");
    console.log(req.body);

    let mentoring_req = await Mentoring_req
        .find({mentor_id : req.session.passport.user})
        .sort({time_created : 1})
    
    res.json({isloggedIn : true, mentoring_req, })
}
    
// 멘토링을 수락합니다.
exports.accept_mentoring_req = async (req, res) => {
    console.log("멘토링을 수락합니다.");
    console.log(req.body);
    
    let mentoring_req = await Mentoring_req.findOne({_id : req.body.mentoring_id})    
    let mentee_info = {
        book_id : mentoring_req.book_id,
        mentee_id : mentoring_req.mentee_id,
        group : '(미지정)',
        start_date : Date.now()
    }
    console.log(mentee_info)
    let mentor_info = {
        book_id : mentoring_req.book_id,
        mentor_id : mentoring_req.mentor_id,
        start_date : Date.now()   
    }

    let mentee = await User.updateOne(
        {user_id : mentee_info.mentee_id},
        {$push : {mentors : mentor_info}})
    console.log(mentee)
    
    let mentor = await User.updateOne(
        {user_id : mentor_info.mentor_id},
        {$push : {mentees : mentee_info}})
        
    let mentoring_info_delete = await Mentoring_req.deleteOne({_id : req.body.mentoring_id})

    let new_mentoring_req = await Mentoring_req
        .find({mentor_id : req.session.passport.user})
        .sort({time_created : 1})
    
    res.json({isloggedIn : true, new_mentoring_req, })
}

// 멘토링을 거절합니다.
exports.deny_mentoring_req = async (req, res) => {
    console.log("멘토링을 수락합니다.");
    console.log(req.body);

    let mentoring_info_delete = await Mentoring_req.deleteOne({_id : req.body.mentoring_id})

    let new_mentoring_req = await Mentoring_req
        .find({mentor_id : req.session.passport.user})
        .sort({time_created : 1})
    
    res.json({isloggedIn : true, new_mentoring_req, })
}

// 멘티 역할을 취소합니다.
exports.cancel_mentee_role = async (req, res) => {
    console.log("멘티 역할을 취소합니다.");
    console.log(req.body);


}








// ----------------------------------------------------------------------------------




// 멘티 그룹을 만듭니다.
exports.create_mentee_group = async (req, res) => {
    console.log("멘티 그룹을 만듭니다.");
    console.log(req.body);

    // 중복된 이름으로 있는지 검사합니다.
    let user = await User.findOne({user_id : req.session.passport.user})
        .select('menteegroup')    
    let position_of_same_name =  user.menteegroup.findIndex((menteegroup) => menteegroup.name === req.body.group_name)

    // 없으면 생성합니다.
    if (position_of_same_name === -1){
        let mentee_group = await User.updateOne(
            {user_id : req.session.passport.user},
            {$push : { mentee_group : {name : req.body.group_name}}}
        )
    } else {
        let msg = '중복된 이름이 있는데... 이름 좀 바까주시죠'
    }

    res.json({isloggedIn : true, msg, })
}

// 멘티 그룹을 삭제합니다.
exports.delete_mentee_group = async (req, res) => {
    console.log("멘티 그룹을 삭제합니다.");
    console.log(req.body);

    if (req.body.other_group === 'none'){
        // 일단 멘토의 멘티 정보를 수정하고
        let user = await User.findone({user_id : req.session.passport.user})
            .select('menteegroup, mentees')
        let modified_mentee_array = user.mentees.filter((mentee) => mentee.group != req.body.curr_group)
        let need_modify_mentee = user.mentees.filter((mentee) => mentee.group === req.body.curr_group)
        user.mentees = modified_mentee_array
        user = await user.save()

        // 멘티들의 멘토 정보도 수정하고
        for(i=0; i<need_modify_mentee.mentees.length; i++){
            let update_result = await User.updateOne(
                {user_id : delete_mentee.mentees[i].mentee_id},
                {$pull : {'mentors.book_id' : need_modify_mentee.mentees.book_id, 'mentors.mentor_id' : req.session.passport.user }})
        }
    } else {
        let user = await User.findone({user_id : req.session.passport.user})
            .select('menteegroup, mentees')
        for (i=0; i<user.mentees.length; i++){
            if (user.mentees[i].group === req.body.curr_group) {
                user.mentees[i].group = req.body.other_group
            }
        }        
        user = await user.save()
    }   
    

    // 없으면 생성합니다.
    let mentee_group = await User.updateOne(
        {user_id : req.session.passport.user},
        {$push : { mentee_group : {name : req.body.group_name}}}
    )

    res.json({isloggedIn : true, msg : '생성 완료', })
}

// 멘티 그룹을 이동합니다.
exports.change_mentee_group = async (req, res) => {




}

// 그룹별로 멘티리스트를 보여줍니다.
exports.show_menteelist_by_group = async (req, res) => {
    console.log("그룹별 멘티를 보여줍니다..");
    console.log(req.body);

    // 일단 전체 리스트를 보여주자
    let user = await User.findOne({user_id : req.session.passport.user})
        .select('mentee menteegroup')            
    
    menteelist = []
    for (i=0; i<menteegroup.length; i++) {
        let groupname = menteegroup[i]
        let mentees = user.mentees.filter((mentee) => mentee.group === groupname)
        let group = {groupname, mentees}
        menteelist.push(group)
    }    

    res.json({isloggedIn : true, menteelist, })
}


// 세션을 다 모아보자.
const get_my_study_result = async (req, res, user) => {

    // 7일 전이라는 날짜를 만들어서 그 때 이후로 종료된 애들만 가져오자

    let sessions = await Session.find({user_id : req.session.passport.user})
        .select('cardlist_working')
    
    let cardlist_working = []
    for (i=0; i<sessions.length; i++){
        cardlist_working = cardlist_working.concat(sessions[i].cardlist_working)
    }
        
    let all_book_result = []
    for (i=0; i<user.mentors.length; i++){
        let single_book_result = {}
        single_book_result.book_id = user.mentors[i].book_id
        let current_book = await Book.findOne({_id : user.mentors[i].book_id})
        single_book_result.title = current_book.title
        single_book_result.mentor_id = user.mentors[i].mentor_id
        single_book_result.study_times = 0
        single_book_result.study_hour = 0
        for (j=0; j<cardlist_working.length; j++){            
            if (cardlist_working[j].book_id == user.mentors[i].book_id){                
                if (cardlist_working[j].study_time != null){
                    single_book_result.study_times +=1
                    single_book_result.study_hour += (cardlist_working[j].study_hour)*1
                }
            }
        }
        all_book_result.push(single_book_result)
    }    
    return all_book_result    
}

const get_mentee_study_result = async (req, res, user) => {        
    
    let all_book_result = []
    for (i=0; i<user.mentees.length; i++){
        let sessions = await Session.find({user_id : user.mentees[i].mentee_id})
            .select('cardlist_working')
        let cardlist_working = []
        for (k=0; k<sessions.length; k++){
            cardlist_working = cardlist_working.concat(sessions[k].cardlist_working)
        }       

        let single_book_result = {}        
        single_book_result.book_id = user.mentees[i].book_id
        let current_book = await Book.findOne({_id : user.mentees[i].book_id})
        single_book_result.title = current_book.title
        single_book_result.mentee_id = user.mentees[i].mentee_id
        single_book_result.study_times = 0
        single_book_result.study_hour = 0

        for (j=0; j<cardlist_working.length; j++){
            if (cardlist_working[j].book_id == user.mentees[i].book_id){                
                if (cardlist_working[j].study_time != null){
                    single_book_result.study_times +=1
                    single_book_result.study_hour += (cardlist_working[j].study_hour)*1
                }
            }
        }
        all_book_result.push(single_book_result)
    }    
    return all_book_result    
}
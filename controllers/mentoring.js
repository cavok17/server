const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Mentoring_req = require('../models/mentoring_req');



// 멘토링 관련 정보를 보여줍니다.
exports.get_mentoringlist = async (req, res) => {  
    console.log("멘토링 관련 리스트를 보내드릴게요.");
    console.log(req.body);

    let mentor = await User.findOne(
        {user_id : req.session.passport.user},
        {mentor : 1})
    let mentee = await User.findOne(
        {user_id : req.session.passport.user},
        {mentee : 1})

    res.json({isloggedIn : true, mentoring, });
}

// 멘토링 요청 화면을 띄웁니다.
exports.enter_mentoring_req = async (req, res) => {
    console.log("멘토링을 요청합니다.");
    console.log(req.body);

    let book = {
        book_id : req.body.book_id,
        title : req.body.title
    }

    let user = await User.findOne(
        {user_id : req.session.passport.user},
        {user_id : 1, name : 1, nickname : 1, from : 1})
    
    res.json({isloggedIn : true, book, user, });
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

    let mentoring = await Mentoring_req.create({
        book_id : req.body.book_id,
        title : req.body.title,
        mentee_id : req.session.passport.user,
        mentor_id : req.body.mentor_id,
        msg : req.body.msg
    })
    
    let mentoring_id = mentoring._id
    res.json({isloggedIn : true, msg : '신청완료', mentoring_id})
}

// 멘토링 수락/거절 화면으로 들어갑니다.
exports.enter_mentoring_req_management = async (req, res) => {
    console.log("멘토링 수락/거절 화면으로 들어갑니다.");
    console.log(req.body);

    let mentoring = await Mentoring_req
        .find({mentor_id : req.session.passport.user})
        .sort({time_created : 1})        
    
    res.json({isloggedIn : true, mentoring, })
}

// 멘토링을 수락합니다.
exports.accept_mentoring_req = async (req, res) => {
    console.log("멘토링을 수락합니다.");
    console.log(req.body);
    
    let mentoring = await Mentoring_req.findOne({_id : req.body.mentoring_id})
    console.log(mentoring)
    let mentee_info = {
        book_id : mentoring.book_id,
        mentee_id : mentoring.mentee_id,
        group : '(미지정)'
    }
    console.log(mentee_info)
    let mentor_info = {
        book_id : mentoring.book_id,
        mentor_id : mentoring.mentor_id,        
    }

    let mentee = await User.updateOne(
        {user_id : mentee_info.mentee_id},
        {$push : {mentor : mentor_info}})
    console.log(mentee)
    
    let mentor = await User.updateOne(
        {user_id : mentor_info.mentor_id},
        {$push : {mentee : mentee_info}})
        
    let mentoring_info_delete = await Mentoring_req.deleteOne({_id : req.body.mentoring_id})
    
    res.json({isloggedIn : true, msg : '수락 완료', })
}

// 멘토링을 거절합니다.
exports.deny_mento_req = async (req, res) => {
    console.log("멘토링을 수락합니다.");
    console.log(req.body);

    let mentoring_info_delete = await Mentoring_req.deleteOne({_id : req.body.mentoring_id})

    res.json({isloggedIn : true, msg : '삭제 완료', })
}

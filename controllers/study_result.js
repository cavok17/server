const mongoose = require("mongoose");

// 모델 경로
const User = require('../models/user');
const Book = require('../models/book'); 
const Card = require('../models/card');
const Index = require('../models/index');
const Category = require('../models/category');
const Mentoring_req = require('../models/mentoring_req');
const Session = require('../models/session');
const { session } = require("passport");



// 세션을 다 모아보자.
exports.get_recent_study_result= async (req, res) => {    
    let sessions = await Session.find({user_id : req.session.passport.user})
        .select('cardlist_working')
    
    let cardlist_working = []
    for (i=0; i<sessions.length; i++){
        cardlist_working = cardlist_working.concat(sessions[i].cardlist_working)
    }

    let all_book_result = []
    for (j=0; j<book_ids.length; j++){
        for (i=0; i<cardlist_working.length; i++){
            let single_book_result = {}
            if (cardlist_working[i].book_id === book_ids[j]){
                single_book_result.book_id = book_ids[j]
                if (cardlist_working[i].study_time >0){
                    single_book_result.study_times +=1
                    single_book_result.study_hour += cardlist_working[i].study_hour
                }
            }
            all_book_result.push(single_book_result)
        }
    }
}

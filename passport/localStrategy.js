const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {  
  passport.use(new LocalStrategy({
    usernameField: 'user_id',
    passwordField: 'password',
  }, async (user_id, password, done) => {
    try {      
      console.log("1_아이디 입력여부", user_id);
      const exUser = await User.findOne({ user_id: user_id });      
      console.log("2_아이디 존재여부", exUser);
      if (exUser) {        
        const result = await bcrypt.compare(password, exUser.password);
        console.log("3_비번 일치여부", result);
        if (result) {          
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
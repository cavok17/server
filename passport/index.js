const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {    
    done(null, user.user_id);
  });

  passport.deserializeUser((user_id, done) => {    
    User.findOne({ user_id: user_id })
      .then(user_id => done(null, user_id))
      .catch(err => done(err));
  });

  local();  
};
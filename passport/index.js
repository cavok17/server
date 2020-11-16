const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {    
    done(null, user.user);
  });

  passport.deserializeUser((user, done) => {    
    User.findOne({ user: user })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();  
};
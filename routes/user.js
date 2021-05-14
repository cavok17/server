const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const User = require('../models/user');
const Category = require('../models/category');


const router = express.Router();

router.post('/register', isNotLoggedIn, async (req, res, next) => {
  const user_id = req.body.user_id;
  const password = req.body.password;  

  try {
    const exUser = await User.findOne({ user_id: user_id });    
    const hash = await bcrypt.hash(password, 12);    
    if (exUser) {
      console.log('중복아이디');
      return res.json({msg : '중복된 아이디가 있습니다.'});
    };
    
    let newUser = User.create({
        user_id: user_id,
        password: hash,        
        name: '윤상일',
        nickname : '홍익인간',
        email: 'kizwond@gmail.com',
        phone : '01093484979',      
    })

    let newCategory = Category.create({
      user_id : user_id,      
      name: '(미지정)',
      seq : 0,
      books : [], 
  })

  } catch (error) {
      console.error(error);
      return next(error);
  }

  return res.json({msg : '회원 가입이 완료되었습니다르르'});
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    // console.log(req.body)
    console.log('4_req.login', user);
    if (authError) {
      console.error('authError', authError);
      return next(authError);
    }
    if (!user) {
        return res.json({msg : '아이디가 없는 듯요'});      
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }      
      return res.json({'isLoggedIn' : true, cart : user.cart});      
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, async (req, res) => {
  req.logout();
  const destroy = new Promise((resolve, reject) => {
    req.session.destroy();
    resolve('love');
  });

  destroy.then(() => {
    console.log('세션이 파괴되었습니다?')
    res.json({isloggedIn : false}); 
  });

  // req.session.destroy();
  // res.json({isloggedIn : false});   

});

router.get('/user-auth', isLoggedIn, (req, res) => {  
  console.log(req.session);
  return res.json({'isLoggedIn' : true});
});

module.exports = router;
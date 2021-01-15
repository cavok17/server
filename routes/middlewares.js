const fs = require("fs");
const multer = require('multer');
const path = require("path");

exports.isNotLoggedIn = (req, res, next) => {
    // console.log('req.isAuthenticated',req.isAuthenticated());
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
  }
};

exports.isLoggedIn = (req, res, next) => {    
    console.log('req.isAuthenticated',req.isAuthenticated());    
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.upload = multer({
    storage : multer.diskStorage({
      destination(req, file, done) {        
        done(null, 'uploads/');
      },
      filename(req, file, done) {        
        const ext = path.extname(file.originalname);        
        done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        console.log('upload를 실행하였어요')
      },
    }),
    limits : {fileSize : 10*1024*1024}
  })

// //   메모리로 바로 저장. 그럼 buffer에 담기는데, 이걸 어떻게 읽을지는 모르겠다
// exports.upload = multer({
//     storage : multer.memoryStorage(),
//     limits : {fileSize : 10*1024*1024}
// })
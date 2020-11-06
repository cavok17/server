exports.isNotLoggedIn = (req, res, next) => {
    console.log('req.isAuthenticated',req.isAuthenticated());
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
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoose = require("mongoose");
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const csrf = require('csurf')
const csrfProtection = csrf({cookie : true})

const FileStore = require('session-file-store')(session);
const path = require("path");
const config = require('./config/key')



dotenv.config({ path: path.join(__dirname, '.env')});
const app = express();
// app.use(
//   cors({
//     credentials : true,
//     origin : "http://localhost:3000"
//   }));
app.use(cors());
const passportConfig = require('./passport');
passportConfig();



if (process.env.NODE_ENV === 'production'){
  app.enable('trust proxy')
  app.use(morgan('combined'));
  app.use(helmet({contentSecurityPolicy : false}))
  app.use(hpp())
} else {
  app.use(morgan('dev'));
}
// extended가 true였는데, froala하면서 false로 바꿈
app.use('/uploads',  express.static(path.join(__dirname, 'uploads')));
console.log(__dirname)
app.use('/thumbnail',  express.static(path.join(__dirname, 'uploads/thumbnail')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cookieParser(config.COOKIE_SECRET));


// 프록시 서버를 쓴다면 아래 내용을 적어주는 게 좋다고 함

const sessionOption = {
  resave : false,
  saveUninitialized : false,
  // secret : process.env.COOKIE_SECRET,
  secret : config.COOKIE_SECRET,
  cookie : {
    httpOnly : true,
    secure : false,
  },
  //   store : new FileStore(fileStoreOptions),
  store : new FileStore({logFn : function(){}}),
}
if (process.env.NODE_ENV === 'production'){
  sessionOption.proxy = true
  // https를 적용하면 secure를 true로 바꿔줘야함
  // sessionOption.cookie.secure = true
}
app.use(session(sessionOption))

const userRouter = require('./routes/user');
const bookRouter = require('./routes/book');
const categoryRouter = require('./routes/category');
const indexRouter = require('./routes/index');
const cardtypeRouter = require('./routes/cardtype');
const pagetypeRouter = require('./routes/pagetype');
const cardRouter = require('./routes/card');
const study_setupRouter = require('./routes/study_setup');
const study_executeRouter = require('./routes/study_execute');
const study_resultRouter = require('./routes/study_result');
const mentoringRouter = require('./routes/mentoring');
const bookstoreRouter = require('./routes/bookstore');

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/book', bookRouter)
app.use('/api/category', categoryRouter)
app.use('/api/index', indexRouter)
app.use('/api/cardtype', cardtypeRouter)
app.use('/api/pagetype', pagetypeRouter)
app.use('/api/card', cardRouter)
app.use('/api/studysetup',study_setupRouter);
app.use('/api/studyexecute',study_executeRouter);
app.use('/api/studyresult',study_resultRouter);
app.use('/api/user', userRouter);
app.use('/api/mentoring', mentoringRouter);
app.use('/api/bookstore', bookstoreRouter);

// const connect = mongoose.connect(process.env.mongoURI,{
const connect = mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true, 
    useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const PORT = config.PORT;

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))
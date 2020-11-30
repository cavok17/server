const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require("path");



dotenv.config({ path: path.join(__dirname, '.env')});
const app = express();
app.use(
  cors({
    credentials : true,
    origin : "http://localhost:3000"
  }));
const passportConfig = require('./passport');
passportConfig();




app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
// const fileStoreOptions = {
//     path : './sessions',
// };
app.use(session({
  secret: process.env.COOKIE_SECRET,  
  cookie: {
      httponly: true,
      maxAge: 7200000
  },
//   원래 false였음
  resave: false,
//   원래 false였음
  saveUninitialized: true,
//   store : new FileStore(fileStoreOptions),
  store : new FileStore({logFn : function(){}}),
}));


const userRouter = require('./routes/user');
const bookRouter = require('./routes/book');
const indexRouter = require('./routes/index');
const cardtypeRouter = require('./routes/cardtype');
const cardRouter = require('./routes/card');
const studyRouter = require('./routes/study');

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/book', bookRouter)
app.use('/api/index', indexRouter)
app.use('/api/cardtype', cardtypeRouter)
app.use('/api/card', cardRouter)
app.use('/api/study', studyRouter);
app.use('/api/user', userRouter);

const connect = mongoose.connect(process.env.mongoURI,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true, 
    useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))
const express = require("express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const cors = require('cors')

require("dotenv").config();
const { DB_URL } = require("./config/database");
const { connect } = require("./config/helpers");

// Init App
const app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// app.use(function (error, req, res, next) {
//   if(error instanceof SyntaxError){ //Handle SyntaxError here.
//     return res.status(500).send({data : "Invalid data"});
//   } else {
//     next();
//   }
// });

// Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(cors({credentials: true, origin: true}))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

// Route Files

const auth = require("./routes/auth");
const users = require('./routes/users');

app.use("/", auth);
app.use("/api/user", users);

connect(DB_URL)
  .then(() =>
    app.listen(process.env.PORT || 5000, () => {
      console.log("server on http://localhost:5000");
    })
  )
  .catch((e) => console.error(e));
